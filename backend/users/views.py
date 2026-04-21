from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Team, TeamMembership
from .permissions import IsAdminGroupMemberForWrite, is_admin_group_member
from .serializers import (
    ChangePasswordSerializer,
    MeSerializer,
    RegisterSerializer,
    TeamMembershipSerializer,
    TeamSerializer,
    UpdateDisplayNameSerializer,
    UserSerializer,
)

User = get_user_model()


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Django superuser はチームメンバーとして扱わない。
        return User.objects.exclude(is_superuser=True).order_by("id")


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class MeView(generics.RetrieveAPIView):
    serializer_class = MeSerializer

    def get_object(self):
        return self.request.user


class UpdateDisplayNameView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        serializer = UpdateDisplayNameSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.display_name = serializer.validated_data["display_name"]
        request.user.save(update_fields=["display_name"])
        return Response(UserSerializer(request.user).data)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        return Response({"detail": "パスワードを変更しました。"}, status=status.HTTP_200_OK)


class TeamViewSet(viewsets.ModelViewSet):
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminGroupMemberForWrite]

    def get_queryset(self):
        return Team.objects.filter(memberships__user=self.request.user).distinct()

    def perform_create(self, serializer):
        team = serializer.save()
        TeamMembership.objects.create(
            user=self.request.user,
            team=team,
            role=TeamMembership.ROLE_OWNER,
        )


class TeamMembershipViewSet(viewsets.ModelViewSet):
    serializer_class = TeamMembershipSerializer

    def get_queryset(self):
        qs = TeamMembership.objects.filter(team__memberships__user=self.request.user).distinct()
        team_id = self.request.query_params.get("team")
        if team_id:
            qs = qs.filter(team_id=team_id)
        return qs

    def _require_owner(self, team: Team) -> None:
        is_owner = team.memberships.filter(
            user=self.request.user,
            role=TeamMembership.ROLE_OWNER,
        ).exists()
        if not is_owner:
            raise PermissionDenied("この操作はチームのオーナーのみ実行できます。")

    def perform_create(self, serializer):
        team = serializer.validated_data["team"]
        self._require_owner(team)
        serializer.save()

    def perform_update(self, serializer):
        team = serializer.instance.team
        self._require_owner(team)
        serializer.save()

    def perform_destroy(self, instance):
        self._require_owner(instance.team)
        instance.delete()
