from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import List


@dataclass
class VPSInstance:
    """Normalized VPS instance data from any provider."""

    id: str
    name: str
    status: str
    ipv4: str
    ipv6: str | None
    cpu_cores: int
    ram_mb: int
    disk_gb: int
    region: str
    created_at: datetime
    provider_type: str
    provider_account_id: int
    plan: str | None = None
    monthly_price: float | None = None
    currency: str = "USD"
    raw_data: dict = None


class BaseProviderClient(ABC):
    """Abstract base class for provider API clients."""

    def __init__(self, credentials: dict, provider_id: int):
        """
        Initialize provider client.

        Args:
            credentials: Provider-specific credentials dictionary
            provider_id: Database ID of the provider account
        """
        self.credentials = credentials
        self.provider_id = provider_id

    @abstractmethod
    def authenticate(self) -> bool:
        """Authenticate with provider API. Returns True if successful."""
        pass

    @abstractmethod
    def list_instances(self) -> List[VPSInstance]:
        """Fetch all VPS instances from provider."""
        pass

    @abstractmethod
    def get_instance(self, instance_id: str) -> VPSInstance:
        """Fetch a single VPS instance by ID."""
        pass

    @staticmethod
    def _normalize_status(provider_status: str) -> str:
        """
        Normalize provider-specific status to standard format.

        Standard statuses: running, stopped, error
        """
        status_lower = provider_status.lower()

        if status_lower in ["on", "active", "running"]:
            return "running"
        elif status_lower in ["off", "stopped", "paused"]:
            return "stopped"
        else:
            return "error"
