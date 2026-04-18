from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    ParseTaskRequestSerializer,
    ParseTaskResponseSerializer,
    SuggestTodayRequestSerializer,
    SuggestTodayResponseSerializer,
)
from .services import TaskAIService


class ParseTaskView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ParseTaskRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = TaskAIService()
        result = service.parse_task_description(serializer.validated_data["text"])

        response_serializer = ParseTaskResponseSerializer(
            {
                "title": result.title,
                "description": result.description,
                "estimate_minutes": result.estimate_minutes,
                "priority": result.priority,
                "subtasks": [
                    {
                        "title": s.title,
                        "estimate_minutes": s.estimate_minutes,
                    }
                    for s in result.subtasks
                ],
                "is_ai": result.is_ai,
                "ai_error": result.ai_error,
            }
        )
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class SuggestTodayView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = SuggestTodayRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = TaskAIService()
        data = service.suggest_today_tasks(
            user=request.user,
            team_id=serializer.validated_data.get("team_id"),
            project_id=serializer.validated_data.get("project_id"),
            limit=serializer.validated_data.get("limit") or 5,
        )

        response_serializer = SuggestTodayResponseSerializer(data)
        return Response(response_serializer.data, status=status.HTTP_200_OK)

