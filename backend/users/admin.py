from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Team, TeamMembership

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["username", "email", "display_name", "is_staff", "is_active", "date_joined"]
    list_filter = ["is_staff", "is_superuser", "is_active"]
    search_fields = ["username", "email", "display_name"]
    ordering = ["-date_joined"]
    filter_horizontal = ["groups", "user_permissions"]

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("個人情報", {"fields": ("display_name", "first_name", "last_name", "email")}),
        (
            "権限",
            {
                "fields": ("is_active", "is_staff", "is_superuser"),
            },
        ),
        ("グループと権限", {"fields": ("groups", "user_permissions")}),
        ("重要日付", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "display_name", "email", "password1", "password2"),
            },
        ),
    )


class TeamMembershipInline(admin.TabularInline):
    model = TeamMembership
    extra = 0
    raw_id_fields = ["user"]
    autocomplete_fields = ["user"]


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ["name", "created_at"]
    search_fields = ["name"]
    ordering = ["-created_at"]
    inlines = [TeamMembershipInline]


@admin.register(TeamMembership)
class TeamMembershipAdmin(admin.ModelAdmin):
    list_display = ["user", "team", "role", "created_at"]
    list_filter = ["role", "team"]
    search_fields = ["user__username", "user__display_name", "team__name"]
    raw_id_fields = ["user"]
    autocomplete_fields = ["user", "team"]
    ordering = ["-created_at"]
