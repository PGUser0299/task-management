from __future__ import annotations

import json
import logging
import anthropic

from dataclasses import dataclass
from datetime import date
from typing import List, Optional
from django.conf import settings
from django.contrib.auth import get_user_model
from tasks.models import Task

User = get_user_model()
logger = logging.getLogger(__name__)


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
    is_ai: bool = False
    ai_error: Optional[str] = None


# JSON Schema for Claude structured output
_PARSE_TASK_SCHEMA = {
    "type": "object",
    "properties": {
        "title": {
            "type": "string",
            "description": "タスクの簡潔なタイトル（100文字以内）",
        },
        "description": {
            "type": "string",
            "description": "タスクの詳細説明",
        },
        "subtasks": {
            "type": "array",
            "description": "サブタスクのリスト",
            "items": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "サブタスクのタイトル",
                    },
                    "estimate_minutes": {
                        "type": "integer",
                        "description": "このサブタスクの見積時間（分）",
                    },
                },
                "required": ["title", "estimate_minutes"],
                "additionalProperties": False,
            },
        },
        "estimate_minutes": {
            "type": "integer",
            "description": "タスク全体の見積時間（分）。サブタスクの合計と同等にする",
        },
        "priority": {
            "type": "string",
            "description": "タスクの優先度",
            "enum": ["low", "medium", "high", "urgent"],
        },
    },
    "required": ["title", "description", "subtasks", "estimate_minutes", "priority"],
    "additionalProperties": False,
}


class TaskAIService:
    """
    AI task decomposition service.

    Uses the Anthropic Claude API when ANTHROPIC_API_KEY is configured.
    Falls back to simple heuristics otherwise.
    """

    DEFAULT_PRIORITY = "medium"

    def _get_client(self):
        """Return an Anthropic client if the API key is configured."""
        api_key = getattr(settings, "ANTHROPIC_API_KEY", "")
        if not api_key:
            return None
        
        return anthropic.Anthropic(api_key=api_key)

    # parse_task_description
    def parse_task_description(self, text: str) -> ParsedTaskSuggestion:
        client = self._get_client()
        if client is None:
            result = self._parse_heuristic(text)
            result.ai_error = "ANTHROPIC_API_KEY が設定されていません。"
            return result

        try:
            result = self._parse_with_claude(client, text)
            result.is_ai = True
            return result
        except Exception as exc:
            logger.exception("Claude API call failed, falling back to heuristics")
            result = self._parse_heuristic(text)
            error_msg = str(exc)
            if "credit balance" in error_msg.lower():
                result.ai_error = "Anthropic APIのクレジット残高が不足しています。"
            else:
                result.ai_error = f"AI解析に失敗しました。"
            return result

    def _parse_with_claude(self, client, text: str) -> ParsedTaskSuggestion:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            system=(
                "あなたはプロジェクト管理の専門家です。"
                "ユーザーが自然言語で入力したタスクの説明を分析し、"
                "構造化されたタスク定義に変換してください。\n\n"
                "ルール:\n"
                "- タイトルは簡潔に（100文字以内）\n"
                "- サブタスクは具体的なアクションアイテムに分解する\n"
                "- 各サブタスクに現実的な見積時間（分単位）を付ける\n"
                "- 全体の見積時間はサブタスクの合計と同等にする\n"
                "- 優先度はテキストの緊急度を考慮して判断する\n"
                "  - urgent: 緊急・至急・critical\n"
                "  - high: 今日中・本日・重要\n"
                "  - low: いつか・後で・時間があれば\n"
                "  - medium: それ以外\n"
                "- サブタスクがない場合でも最低1つは作成する\n"
                "- 日本語のテキストには日本語で応答する"
            ),
            messages=[
                {
                    "role": "user",
                    "content": (
                        f"以下のタスク説明を分析し、構造化してください:\n\n{text}"
                    ),
                },
            ],
            output_config={
                "format": {
                    "type": "json_schema",
                    "schema": _PARSE_TASK_SCHEMA,
                },
            },
        )

        # Extract JSON from the first text block
        raw = next(b.text for b in response.content if b.type == "text")
        data = json.loads(raw)

        subtasks = [
            SubtaskSuggestion(
                title=s["title"],
                estimate_minutes=s.get("estimate_minutes"),
            )
            for s in data.get("subtasks", [])
        ]

        return ParsedTaskSuggestion(
            title=data["title"],
            description=data["description"],
            subtasks=subtasks,
            estimate_minutes=data.get("estimate_minutes"),
            priority=data.get("priority", self.DEFAULT_PRIORITY),
        )


    # Heuristic fallback (そのままの状態で追加する。LLMが使えない場合の簡易解析。)
    def _parse_heuristic(self, text: str) -> ParsedTaskSuggestion:
        normalized = text.strip()

        title = normalized.splitlines()[0][:100] if normalized else "New Task"
        description = normalized

        subtasks: List[SubtaskSuggestion] = []
        for line in normalized.splitlines()[1:]:
            line = line.strip("-・* ").strip()
            if not line:
                continue
            subtasks.append(SubtaskSuggestion(title=line))

        estimate = 30 * len(subtasks) if subtasks else 60

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


    # suggest_today_tasks 
    def suggest_today_tasks(
        self,
        user: User,
        team_id: Optional[int] = None,
        project_id: Optional[int] = None,
        limit: int = 5,
    ):
        qs = Task.objects.filter(project__team__memberships__user=user)

        if team_id:
            qs = qs.filter(project__team_id=team_id)
        if project_id:
            qs = qs.filter(project_id=project_id)

        qs = qs.filter(status__in=["pending", "todo", "in_progress"], parent__isnull=True)

        today = date.today()

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
            "due_date",
            "priority_order",
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
            summary = "本日フォーカスすべき新しいタスクはありません。"
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
