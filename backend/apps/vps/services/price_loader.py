"""
Service for loading and applying custom instance prices.
Optimized to avoid N+1 queries by preloading all prices.
"""

from decimal import Decimal
from typing import Dict, Optional, List

from vps.models import InstanceCustomPrice
from providers.services.base import VPSInstance


class PriceLoader:
    """Load custom prices efficiently and apply them to instances."""

    def __init__(self, provider_ids: List[int]):
        """Initialize with provider IDs to preload prices."""
        self.provider_ids = provider_ids
        self._prices_by_instance_id: Dict[str, Decimal] = {}
        self._prices_by_instance_ip: Dict[str, Decimal] = {}
        self._load_prices()

    def _load_prices(self):
        """Preload all custom prices for the given providers."""
        custom_prices = InstanceCustomPrice.objects.filter(
            provider_id__in=self.provider_ids,
            is_active=True
        ).values("instance_id", "instance_ip", "monthly_price")

        for price_record in custom_prices:
            instance_id = price_record.get("instance_id")
            instance_ip = price_record.get("instance_ip")
            monthly_price = Decimal(str(price_record.get("monthly_price", 0)))

            if instance_id:
                self._prices_by_instance_id[instance_id] = monthly_price

            if instance_ip:
                self._prices_by_instance_ip[instance_ip] = monthly_price

    def get_price(self, instance: VPSInstance) -> Optional[Decimal]:
        """
        Get custom price for an instance.
        Tries to match by instance ID first, then by IP.
        """
        # Try to match by instance ID (more reliable)
        if instance.id in self._prices_by_instance_id:
            return self._prices_by_instance_id[instance.id]

        # Try to match by IP address
        if instance.ipv4 and instance.ipv4 in self._prices_by_instance_ip:
            return self._prices_by_instance_ip[instance.ipv4]

        # No custom price found
        return None

    def apply_prices(self, instances: List[VPSInstance]) -> List[VPSInstance]:
        """Apply custom prices to instances."""
        for instance in instances:
            custom_price = self.get_price(instance)
            if custom_price is not None:
                instance.monthly_price = float(custom_price)

        return instances
