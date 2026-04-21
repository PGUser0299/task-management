from rest_framework.permissions import BasePermission, SAFE_METHODS


ADMIN_GROUP_NAME = "管理者"


# 管理者グループのメンバーであれば全ての操作を許可。
def is_admin_group_member(user) -> bool:
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    return user.groups.filter(name=ADMIN_GROUP_NAME).exists()


class IsAdminGroupMemberForWrite(BasePermission):
    message = "この操作は管理者グループのメンバーのみ実行できます。"

    def has_permission(self, request, view) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return is_admin_group_member(request.user)
