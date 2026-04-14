from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import List, Optional

from django.contrib.auth import get_user_model

from tasks.models import Task

User = get_user_model()


@dataclass
class SubtaskSuggestion:
    title: str
    estimate_minutes: Optional[int] = None


@dataclass
class ParsedTaskSuggestion:
    title: str
    description: str
    subtasks: List[SubtaskSuggestion]
    estimate_minutes: Optional[int]
    priority: str


class TaskAIService:
    """
    AI-like heuristics for task parsing and suggestion.

    NOTE:
        This class is intentionally implemented without an external LLM dependency
        so that the project works out-of-the-box. You can replace the internal
        logic with real LLM calls (OpenAI, Anthropic, etc.) if desired.
    """

    DEFAULT_PRIORITY = "medium"

    def parse_task_description(self, text: str) -> ParsedTaskSuggestion:
        normalized = text.strip()

        # Very simple heuristics for demo:
        title = normalized.splitlines()[0][:100] if normalized else "New Task"
        description = normalized

        subtasks: List[SubtaskSuggestion] = []
        for line in normalized.splitlines()[1:]:
            line = line.strip("-・* ").strip()
            if not line:
                continue
            subtasks.append(SubtaskSuggestion(title=line))

        # Estimate: 30 min per subtask, or 60 min fallback
        estimate = 30 * len(subtasks) if subtasks else 60

        # Priority estimation based on simple keyword rules
        lower = normalized.lower()
        if any(k in lower for k in ["urgent", "緊急", "至急", "critical"]):
            priority = "urgent"
        elif any(k in lower for k in ["today", "本日", "今日"]):
            priority = "high"
        elif any(k in lower for k in ["someday", "いつか", "後で"]):
            priority = "low"
        else:
            priority = self.DEFAULT_PRIORITY

        return ParsedTaskSuggestion(
            title=title,
            description=description,
            subtasks=subtasks,
            estimate_minutes=estimate,
            priority=priority,
        )

    def suggest_today_tasks(
        self,
        user: User,
        team_id: Optional[int] = None,
        project_id: Optional[int] = None,
        limit: int = 5,
    ):
        """
        Suggest tasks to focus on today based on:
        - status (todo/in_progress)
        - due date proximity
        - priority
        """
        qs = Task.objects.filter(project__team__memberships__user=user)

        if team_id:
            qs = qs.filter(project__team_id=team_id)
        if project_id:
            qs = qs.filter(project_id=project_id)

        # メインタスクのみ対象（サブタスクは除外）
        qs = qs.filter(status__in=["pending", "todo", "in_progress"], parent__isnull=True)

        today = date.today()

        # 優先度を数値にマップして正しい順序でソートする（urgent > high > medium > low）
        from django.db.models import Case, IntegerField, Value, When

        qs = qs.annotate(
            priority_order=Case(
                When(priority="urgent", then=Value(0)),
                When(priority="high", then=Value(1)),
                When(priority="medium", then=Value(2)),
                When(priority="low", then=Value(3)),
                default=Value(4),
                output_field=IntegerField(),
            )
        ).order_by(
            "due_date",      # 期限が近い順
            "priority_order",  # 優先度が高い順
        )

        tasks = list(qs[:limit])

        items = []
        for task in tasks:
            reason_parts = []
            if task.due_date:
                delta = (task.due_date - today).days
                if delta < 0:
                    reason_parts.append("期限超過のタスクです。")
                elif delta == 0:
                    reason_parts.append("本日が期限のタスクです。")
                elif delta <= 2:
                    reason_parts.append("期限が数日以内に迫っています。")

            if task.priority in ["high", "urgent"]:
                reason_parts.append(f"優先度が {task.priority} に設定されています。")

            if not reason_parts:
                reason_parts.append("進行中または未着手のタスクの中からバランスよく選ばれました。")

            items.append(
                {
                    "id": task.id,
                    "project_id": task.project_id,
                    "title": task.title,
                    "status": task.status,
                    "priority": task.priority,
                    "due_date": task.due_date,
                    "reason": " ".join(reason_parts),
                }
            )

        summary: str
        if not items:
            summary = "本日フォーカスすべき新しいタスクはありません。残件の確認や振り返りに時間を使いましょう。"
        else:
            urgent_count = sum(1 for t in items if t["priority"] in ["high", "urgent"])
            deadline_today_count = sum(
                1
                for t in items
                if isinstance(t["due_date"], date) and t["due_date"] == today
            )
            summary_parts = ["本日フォーカスすべきタスクをピックアップしました。"]
            if urgent_count:
                summary_parts.append(f"うち {urgent_count} 件は優先度 High 以上です。")
            if deadline_today_count:
                summary_parts.append(f"{deadline_today_count} 件は本日が期限です。")
            summary = " ".join(summary_parts)

        return {
            "summary": summary,
            "items": items,
        }

