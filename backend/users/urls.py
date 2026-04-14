from rest_framework.routers import DefaultRouter

from .views import TeamMembershipViewSet, TeamViewSet, UserViewSet

router = DefaultRouter()
router.register("teams", TeamViewSet, basename="team")
router.register("team-memberships", TeamMembershipViewSet, basename="team-membership")
router.register("users", UserViewSet, basename="user")

urlpatterns = router.urls
