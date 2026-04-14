from rest_framework import serializers


class ParseTaskRequestSerializer(serializers.Serializer):
    text = serializers.CharField()


class SubtaskSuggestionSerializer(serializers.Serializer):
    title = serializers.CharField()
    estimate_minutes = serializers.IntegerField(required=False, allow_null=True)


class ParseTaskResponseSerializer(serializers.Serializer):
    title = serializers.CharField()
    description = serializers.CharField()
    estimate_minutes = serializers.IntegerField(required=False, allow_null=True)
    priority = serializers.CharField()
    subtasks = SubtaskSuggestionSerializer(many=True)


class SuggestTodayRequestSerializer(serializers.Serializer):
    team_id = serializers.IntegerField(required=False)
    project_id = serializers.IntegerField(required=False)
    limit = serializers.IntegerField(required=False, min_value=1, max_value=20, default=5)


class SuggestedTaskSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    project_id = serializers.IntegerField()
    title = serializers.CharField()
    status = serializers.CharField()
    priority = serializers.CharField()
    due_date = serializers.DateField(required=False, allow_null=True)
    reason = serializers.CharField()


class SuggestTodayResponseSerializer(serializers.Serializer):
    summary = serializers.CharField()
    items = SuggestedTaskSerializer(many=True)

