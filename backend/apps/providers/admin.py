from django.contrib import admin

from .models import Provider


@admin.register(Provider)
class ProviderAdmin(admin.ModelAdmin):
    """Admin interface for Provider model."""

    list_display = (
        "name",
        "user",
        "provider_type",
        "is_active",
        "created_at",
        "last_sync_at",
        "last_sync_status",
    )
    list_filter = ("provider_type", "is_active", "created_at")
    search_fields = ("name", "user__username", "user__email")
    readonly_fields = ("created_at", "updated_at", "last_sync_at", "encrypted_credentials")

    fieldsets = (
        ("Basic Info", {
            "fields": ("name", "user", "provider_type", "is_active")
        }),
        ("Credentials", {
            "fields": ("encrypted_credentials",),
            "classes": ("collapse",),
        }),
        ("Sync Info", {
            "fields": ("last_sync_at", "last_sync_status"),
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )

    def has_delete_permission(self, request, obj=None):
        """Only superusers can delete providers."""
        return request.user.is_superuser
