from django.db import models

from providers.models import Provider


class InstanceCustomPrice(models.Model):
    """Store custom monthly prices for specific VPS instances."""

    provider = models.ForeignKey(
        Provider, on_delete=models.CASCADE, related_name="instance_prices"
    )
    instance_id = models.CharField(
        max_length=255, help_text="Instance ID from the provider"
    )
    instance_ip = models.CharField(
        max_length=45, blank=True, null=True, help_text="Instance IP address (optional)"
    )
    monthly_price = models.DecimalField(
        max_digits=10, decimal_places=2, help_text="Custom monthly price"
    )
    currency = models.CharField(max_length=3, default="USD")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("provider", "instance_id")
        indexes = [
            models.Index(fields=["provider", "instance_id"]),
            models.Index(fields=["provider", "instance_ip"]),
        ]
        verbose_name = "Instance Custom Price"
        verbose_name_plural = "Instance Custom Prices"

    def __str__(self):
        return f"{self.provider.name} - {self.instance_id}: ${self.monthly_price}"
