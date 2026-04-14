from django.contrib import admin

from .models import Project, Task, TaskComment


class TaskInline(admin.TabularInline):
    model = Task
    extra = 0
    fields = ["title", "status", "priority", "assignee", "due_date"]
    raw_id_fields = ["assignee", "parent"]
    autocomplete_fields = ["assignee"]
    show_change_link = True


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ["name", "team", "created_at", "updated_at"]
    list_filter = ["team"]
    search_fields = ["name", "description", "team__name"]
    raw_id_fields = ["team"]
    autocomplete_fields = ["team"]
    ordering = ["-created_at"]
    inlines = [TaskInline]


class TaskCommentInline(admin.TabularInline):
    model = TaskComment
    extra = 0
    raw_id_fields = ["author"]
    autocomplete_fields = ["author"]
    readonly_fields = ["created_at"]


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "project",
        "status",
        "priority",
        "assignee",
        "due_date",
        "created_at",
    ]
    list_filter = ["status", "priority", "project__team"]
    search_fields = ["title", "description", "project__name"]
    list_editable = ["status", "priority"]
    raw_id_fields = ["project", "assignee", "parent"]
    autocomplete_fields = ["project", "assignee", "parent"]
    date_hierarchy = "due_date"
    ordering = ["-created_at"]
    inlines = [TaskCommentInline]

    fieldsets = (
        (None, {"fields": ("project", "title", "description", "parent")}),
        ("状態", {"fields": ("status", "priority", "assignee")}),
        ("見積（日）・期限", {"fields": ("estimate_minutes", "due_date")}),
        ("日付", {"fields": ("created_at", "updated_at")}),
    )
    readonly_fields = ["created_at", "updated_at"]


@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ["task", "author", "content_short", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["content", "task__title", "author__username"]
    raw_id_fields = ["task", "author"]
    autocomplete_fields = ["task", "author"]
    ordering = ["-created_at"]
    readonly_fields = ["created_at"]

    def content_short(self, obj):
        return (obj.content[:50] + "…") if len(obj.content) > 50 else obj.content

    content_short.short_description = "内容"
