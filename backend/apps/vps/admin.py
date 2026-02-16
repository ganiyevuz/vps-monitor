from django.contrib import admin

from vps.models import InstanceCustomPrice


@admin.register(InstanceCustomPrice)
class InstanceCustomPriceAdmin(admin.ModelAdmin):
    """Admin interface for custom instance prices."""

    list_display = ["provider", "instance_id", "instance_ip", "monthly_price", "currency", "is_active", "created_at"]
    list_filter = ["provider", "is_active", "currency", "created_at"]
    search_fields = ["instance_id", "instance_ip"]
    readonly_fields = ["created_at", "updated_at"]
    fieldsets = (
        ("Instance Info", {
            "fields": ("provider", "instance_id", "instance_ip")
        }),
        ("Pricing", {
            "fields": ("monthly_price", "currency")
        }),
        ("Status", {
            "fields": ("is_active",)
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )

    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        qs = super().get_queryset(request)
        return qs.select_related("provider")
