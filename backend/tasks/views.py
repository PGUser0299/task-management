from django.db.models import Q
from django.utils.dateparse import parse_date
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Project, Task, TaskComment
from .permissions import IsTeamMember
from .serializers import ProjectSerializer, TaskCommentSerializer, TaskSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, IsTeamMember]

    def get_queryset(self):
        user = self.request.user
        qs = Project.objects.filter(
            team__memberships__user=user
        ).select_related("team").distinct()
        team_id = self.request.query_params.get("team")
        if team_id:
            qs = qs.filter(team_id=team_id)
        return qs


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsTeamMember]

    def get_queryset(self):
        user = self.request.user
        qs = Task.objects.filter(project__team__memberships__user=user).select_related(
            "project", "assignee", "project__team", "parent"
        )

        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)

        assignee = self.request.query_params.get("assignee")
        if assignee:
            qs = qs.filter(assignee_id=assignee)

        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(project_id=project_id)

        team_id = self.request.query_params.get("team")
        if team_id:
            qs = qs.filter(project__team_id=team_id)

        parent_id = self.request.query_params.get("parent")
        if parent_id is not None:
            if parent_id == "" or parent_id == "null":
                qs = qs.filter(parent__isnull=True)
            else:
                qs = qs.filter(parent_id=parent_id)

        due_before = self.request.query_params.get("due_before")
        if due_before:
            date_val = parse_date(due_before)
            if date_val:
                qs = qs.filter(due_date__lte=date_val)

        due_after = self.request.query_params.get("due_after")
        if due_after:
            date_val = parse_date(due_after)
            if date_val:
                qs = qs.filter(due_date__gte=date_val)

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(description__icontains=search))

        return qs

    @action(detail=True, methods=["get", "post"])
    def comments(self, request, pk=None):
        task = self.get_object()

        if request.method == "GET":
            comments = task.comments.select_related("author")
            serializer = TaskCommentSerializer(comments, many=True)
            return Response(serializer.data)

        serializer = TaskCommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(task=task, author=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TaskCommentViewSet(viewsets.ModelViewSet):
    """
    タスクコメントの CRUD エンドポイント。

    - 作成は /api/tasks/{id}/comments/ (TaskViewSet.comments) を使用。
    - このViewSetは既存コメントの取得・更新・削除に使用する。
    """

    serializer_class = TaskCommentSerializer
    permission_classes = [IsAuthenticated, IsTeamMember]
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return TaskComment.objects.filter(
            task__project__team__memberships__user=self.request.user
        ).select_related("author", "task", "task__project__team")

    def perform_update(self, serializer):
        comment = self.get_object()
        if comment.author != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("自分のコメントのみ編集できます。")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("自分のコメントのみ削除できます。")
        instance.delete()
