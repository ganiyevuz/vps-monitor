from rest_framework import serializers

from .constants import ProviderType
from .models import Provider


class ProviderListSerializer(serializers.ModelSerializer):
    """Serializer for listing providers (excludes sensitive data)."""

    class Meta:
        model = Provider
        fields = [
            "id",
            "name",
            "provider_type",
            "is_active",
            "created_at",
            "updated_at",
            "last_sync_at",
            "last_sync_status",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "last_sync_at",
            "last_sync_status",
        ]


class ProviderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating providers with credentials."""

    credentials = serializers.JSONField(
        write_only=True, help_text="Provider-specific credentials as JSON"
    )

    class Meta:
        model = Provider
        fields = ["id", "name", "provider_type", "credentials", "is_active"]
        read_only_fields = ["id"]

    def validate_credentials(self, value):
        """Validate credentials based on provider type."""
        provider_type = self.initial_data.get("provider_type")

        if provider_type == ProviderType.CONTABO:
            required_fields = ["client_id", "client_secret", "api_user", "api_password"]
            missing = [f for f in required_fields if f not in value]
            if missing:
                raise serializers.ValidationError(
                    f"Contabo credentials missing: {', '.join(missing)}"
                )

        elif provider_type == ProviderType.DIGITALOCEAN:
            if "token" not in value:
                raise serializers.ValidationError(
                    "DigitalOcean credentials must include 'token'"
                )

        return value

    def create(self, validated_data):
        """Create provider with encrypted credentials."""
        credentials = validated_data.pop("credentials")
        provider = Provider(**validated_data)
        provider.user = self.context["request"].user
        provider.set_credentials(credentials)
        provider.save()
        return provider

    def update(self, instance, validated_data):
        """Update provider, re-encrypting credentials if provided."""
        if "credentials" in validated_data:
            credentials = validated_data.pop("credentials")
            instance.set_credentials(credentials)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
