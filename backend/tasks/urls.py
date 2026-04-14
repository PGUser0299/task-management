from rest_framework.routers import DefaultRouter

from .views import ProjectViewSet, TaskCommentViewSet, TaskViewSet

router = DefaultRouter()
router.register("projects", ProjectViewSet, basename="project")
router.register("tasks", TaskViewSet, basename="task")
router.register("comments", TaskCommentViewSet, basename="comment")

urlpatterns = router.urls
