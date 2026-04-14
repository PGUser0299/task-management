from rest_framework.permissions import BasePermission

from .models import Project, Task, TaskComment


class IsTeamMember(BasePermission):
    """
    Allow access only to users who belong to the team that owns the resource.

    - has_permission: list/create などリスト操作は get_queryset でフィルタ済みのため
      認証チェックのみ行う。create 時のチーム所属検証はシリアライザ側で実施する。
    - has_object_permission: detail 操作では対象オブジェクトのチームを確認する。
    """

    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj) -> bool:
        user = request.user

        from users.models import Team  # imported lazily to avoid circular imports

        team = None
        if isinstance(obj, Project):
            team = obj.team
        elif isinstance(obj, Task):
            team = obj.project.team
        elif isinstance(obj, TaskComment):
            team = obj.task.project.team
        elif isinstance(obj, Team):
            team = obj

        if team is None:
            return False

        return team.memberships.filter(user=user).exists()
