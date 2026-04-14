from rest_framework.permissions import BasePermission, SAFE_METHODS


ADMIN_GROUP_NAME = "管理者"


def is_admin_group_member(user) -> bool:
    """管理者グループ所属（またはスーパーユーザー）であるかを判定する。"""
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    return user.groups.filter(name=ADMIN_GROUP_NAME).exists()


class IsAdminGroupMemberForWrite(BasePermission):
    """参照系は認証済みなら許可、更新系は管理者グループ所属者のみ許可する。"""

    message = "この操作は管理者グループのメンバーのみ実行できます。"

    def has_permission(self, request, view) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return is_admin_group_member(request.user)
