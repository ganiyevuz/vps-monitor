from django.contrib.auth.models import User
from django.db import models

from .constants import ProviderType
from .services.encryption import decrypt_credentials, encrypt_credentials


class Provider(models.Model):
    """Cloud provider account for a user."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="providers")
    name = models.CharField(max_length=255, help_text="Display name for the provider account")
    provider_type = models.CharField(
        max_length=20,
        choices=ProviderType.choices,
        help_text="Type of cloud provider",
    )
    encrypted_credentials = models.TextField(help_text="Encrypted JSON credentials")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_sync_at = models.DateTimeField(null=True, blank=True)
    last_sync_status = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        help_text="Last sync status: success, error",
    )

    class Meta:
        db_table = "providers_provider"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "provider_type"]),
            models.Index(fields=["user", "is_active"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_provider_type_display()})"

    def set_credentials(self, credentials: dict) -> None:
        """Encrypt and store credentials."""
        self.encrypted_credentials = encrypt_credentials(credentials)

    def get_credentials(self) -> dict:
        """Decrypt and retrieve credentials."""
        return decrypt_credentials(self.encrypted_credentials)
