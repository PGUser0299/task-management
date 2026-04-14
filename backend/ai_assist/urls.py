from django.urls import path

from .views import ParseTaskView, SuggestTodayView

urlpatterns = [
    path("parse-task/", ParseTaskView.as_view(), name="parse-task"),
    path("suggest-today/", SuggestTodayView.as_view(), name="suggest-today"),
]

