from .base import BaseProviderClient
from .contabo import ContaboClient
from .digitalocean import DigitalOceanClient


class ProviderClientFactory:
    """Factory for creating provider API clients."""

    CLIENTS = {
        "contabo": ContaboClient,
        "digitalocean": DigitalOceanClient,
    }

    @classmethod
    def create(
        cls,
        provider_type: str,
        credentials: dict,
        provider_id: int,
    ) -> BaseProviderClient:
        """
        Create a provider client instance.

        Args:
            provider_type: Type of provider (contabo, digitalocean)
            credentials: Provider-specific credentials
            provider_id: Database ID of the provider account

        Returns:
            Instance of appropriate provider client

        Raises:
            ValueError: If provider type is not supported
        """
        client_class = cls.CLIENTS.get(provider_type.lower())

        if not client_class:
            raise ValueError(
                f"Unsupported provider type: {provider_type}. "
                f"Supported: {', '.join(cls.CLIENTS.keys())}"
            )

        return client_class(credentials, provider_id)
