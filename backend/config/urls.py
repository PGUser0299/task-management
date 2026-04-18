from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("users.urls_auth")),
    path("api/", include("users.urls")),
    path("api/", include("tasks.urls")),
    path("api/ai/", include("ai_assist.urls")),
]
