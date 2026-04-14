from django.contrib.auth import get_user_model
from rest_framework import serializers

from users.models import Team
from .models import Project, Task, TaskComment

User = get_user_model()


class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "display_name"]


class ProjectSerializer(serializers.ModelSerializer):
    team_id = serializers.PrimaryKeyRelatedField(
        source="team",
        queryset=Team.objects.all(),
        write_only=True,
    )

    class Meta:
        model = Project
        fields = ["id", "name", "description", "team", "team_id", "created_at", "updated_at"]
        read_only_fields = ["id", "team", "created_at", "updated_at"]

    def validate_team_id(self, team):
        """リクエストユーザーが対象チームのメンバーであることを確認する。"""
        request = self.context.get("request")
        if request and not team.memberships.filter(user=request.user).exists():
            raise serializers.ValidationError("このチームにプロジェクトを作成する権限がありません。")
        return team


class TaskSerializer(serializers.ModelSerializer):
    assignee = UserMiniSerializer(read_only=True)
    assignee_id = serializers.PrimaryKeyRelatedField(
        source="assignee",
        queryset=User.objects.all(),
        write_only=True,
        allow_null=True,
        required=False,
    )
    parent_id = serializers.PrimaryKeyRelatedField(
        source="parent",
        queryset=Task.objects.all(),
        write_only=True,
        allow_null=True,
        required=False,
    )

    class Meta:
        model = Task
        fields = [
            "id",
            "project",
            "title",
            "description",
            "status",
            "priority",
            "estimate_minutes",
            "due_date",
            "assignee",
            "assignee_id",
            "parent",
            "parent_id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "assignee", "parent", "created_at", "updated_at"]

    def validate(self, attrs):
        parent = attrs.get("parent")
        project = attrs.get("project") or (self.instance.project if self.instance else None)

        if parent is not None and project is not None:
            if parent.project_id != project.pk:
                raise serializers.ValidationError(
                    {"parent_id": "親タスクは同じプロジェクト内のタスクを指定してください。"}
                )

        return attrs


class TaskCommentSerializer(serializers.ModelSerializer):
    author = UserMiniSerializer(read_only=True)

    class Meta:
        model = TaskComment
        fields = ["id", "task", "author", "content", "created_at"]
        read_only_fields = ["id", "task", "author", "created_at"]
