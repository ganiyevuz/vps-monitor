import json
from typing import List

from django.contrib.auth.models import User
from django.core.cache import cache

from providers.models import Provider
from providers.services.base import VPSInstance
from providers.services.factory import ProviderClientFactory


class VPSAggregator:
    """Service for aggregating VPS instances from multiple providers."""

    CACHE_TTL = 300  # 5 minutes
    CACHE_KEY_PREFIX = "vps_instances"

    @classmethod
    def get_all_instances(cls, user: User) -> List[VPSInstance]:
        """Get all VPS instances from all active providers for a user."""
        instances = []

        active_providers = Provider.objects.filter(user=user, is_active=True)

        for provider in active_providers:
            try:
                provider_instances = cls._get_provider_instances(provider)
                instances.extend(provider_instances)
            except Exception as e:
                # Log error but continue with other providers
                import traceback

                print(f"Error fetching instances from {provider.name}: {str(e)}")
                traceback.print_exc()

        return instances

    @classmethod
    def get_provider_instances(cls, provider_id: int, user: User) -> List[VPSInstance]:
        """Get VPS instances from a specific provider."""
        try:
            provider = Provider.objects.get(id=provider_id, user=user)
            return cls._get_provider_instances(provider)
        except Provider.DoesNotExist:
            raise ValueError(f"Provider {provider_id} not found or not owned by user")

    @classmethod
    def _get_provider_instances(cls, provider: Provider) -> List[VPSInstance]:
        """Fetch instances from provider with caching."""
        cache_key = cls._get_cache_key(provider.id)

        # Try to get from cache
        cached_data = cache.get(cache_key)
        if cached_data:
            return cls._deserialize_instances(cached_data)

        # Fetch from API
        credentials = provider.get_credentials()
        client = ProviderClientFactory.create(
            provider.provider_type,
            credentials,
            provider.id,
        )

        instances = client.list_instances()

        # Cache the results
        cache.set(cache_key, cls._serialize_instances(instances), cls.CACHE_TTL)

        return instances

    @classmethod
    def clear_cache(cls, provider_id: int = None) -> None:
        """Clear cache for specific provider or all providers."""
        if provider_id:
            cache_key = cls._get_cache_key(provider_id)
            cache.delete(cache_key)
        else:
            # Clear all VPS cache keys
            # Note: This requires redis backend for key pattern matching
            pattern = f"{cls.CACHE_KEY_PREFIX}_*"
            # For now, we'll just note that full pattern clearing needs Redis
            # In production, use cache.delete_pattern() or similar

    @staticmethod
    def _get_cache_key(provider_id: int) -> str:
        """Generate cache key for provider."""
        return f"{VPSAggregator.CACHE_KEY_PREFIX}_{provider_id}"

    @staticmethod
    def _serialize_instances(instances: List[VPSInstance]) -> str:
        """Serialize VPSInstance objects to JSON for caching."""
        data = []
        for instance in instances:
            data.append(
                {
                    "id": instance.id,
                    "name": instance.name,
                    "status": instance.status,
                    "ipv4": instance.ipv4,
                    "ipv6": instance.ipv6,
                    "cpu_cores": instance.cpu_cores,
                    "ram_mb": instance.ram_mb,
                    "disk_gb": instance.disk_gb,
                    "region": instance.region,
                    "created_at": instance.created_at.isoformat(),
                    "provider_type": instance.provider_type,
                    "provider_account_id": instance.provider_account_id,
                    "plan": instance.plan,
                    "monthly_price": instance.monthly_price,
                    "currency": instance.currency,
                }
            )
        return json.dumps(data)

    @staticmethod
    def _deserialize_instances(json_str: str) -> List[VPSInstance]:
        """Deserialize JSON to VPSInstance objects."""
        from datetime import datetime

        data = json.loads(json_str)
        instances = []

        for item in data:
            created_at = datetime.fromisoformat(item["created_at"])
            instance = VPSInstance(
                id=item["id"],
                name=item["name"],
                status=item["status"],
                ipv4=item["ipv4"],
                ipv6=item["ipv6"],
                cpu_cores=item["cpu_cores"],
                ram_mb=item["ram_mb"],
                disk_gb=item["disk_gb"],
                region=item["region"],
                created_at=created_at,
                provider_type=item["provider_type"],
                provider_account_id=item["provider_account_id"],
                plan=item.get("plan"),
                monthly_price=item.get("monthly_price"),
                currency=item.get("currency", "USD"),
            )
            instances.append(instance)

        return instances
