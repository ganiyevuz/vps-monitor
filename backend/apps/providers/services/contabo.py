import uuid
from datetime import datetime
from typing import List

import requests

from .base import BaseProviderClient, VPSInstance


class ContaboClient(BaseProviderClient):
    """Contabo API client using OAuth 2.0 password grant flow."""

    AUTH_URL = (
        "https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token"
    )
    API_BASE_URL = "https://api.contabo.com"

    def __init__(self, credentials: dict, provider_id: int):
        """
        Initialize Contabo client.

        Expects credentials with:
        - client_id
        - client_secret
        - api_user
        - api_password
        """
        super().__init__(credentials, provider_id)
        self.access_token = None

    def authenticate(self) -> bool:
        """Authenticate using OAuth 2.0 password grant flow."""
        try:
            data = {
                "client_id": self.credentials.get("client_id"),
                "client_secret": self.credentials.get("client_secret"),
                "username": self.credentials.get("api_user"),
                "password": self.credentials.get("api_password"),
                "grant_type": "password",
            }

            response = requests.post(self.AUTH_URL, data=data, timeout=10)
            response.raise_for_status()

            self.access_token = response.json().get("access_token")
            return bool(self.access_token)
        except (requests.RequestException, ValueError) as e:
            raise Exception(f"Contabo authentication failed: {str(e)}")

    def list_instances(self) -> List[VPSInstance]:
        """Fetch all VPS instances from Contabo."""
        if not self.access_token:
            self.authenticate()

        instances = []
        page = 1

        while True:
            try:
                url = f"{self.API_BASE_URL}/v1/compute/instances"
                headers = {
                    "Authorization": f"Bearer {self.access_token}",
                    "x-request-id": str(uuid.uuid4()),
                }
                params = {"page": page}

                response = requests.get(url, headers=headers, params=params, timeout=10)
                response.raise_for_status()

                data = response.json()
                items = data.get("data", [])

                if not items:
                    break

                for item in items:
                    instance = self._normalize_instance(item)
                    instances.append(instance)

                # Check if there are more pages
                pagination = data.get("pagination", {})
                if page >= pagination.get("pages", 1):
                    break

                page += 1
            except requests.RequestException as e:
                raise Exception(f"Failed to fetch Contabo instances: {str(e)}")

        return instances

    def get_instance(self, instance_id: str) -> VPSInstance:
        """Fetch a single VPS instance by ID."""
        if not self.access_token:
            self.authenticate()

        try:
            url = f"{self.API_BASE_URL}/v1/compute/instances/{instance_id}"
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "x-request-id": str(uuid.uuid4()),
            }

            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()

            item = response.json().get("data", {})
            return self._normalize_instance(item)
        except requests.RequestException as e:
            raise Exception(f"Failed to fetch Contabo instance {instance_id}: {str(e)}")

    def _normalize_instance(self, data: dict) -> VPSInstance:
        """Normalize Contabo API response to VPSInstance."""
        created_at_str = data.get("createdDate", datetime.now().isoformat())
        if isinstance(created_at_str, str):
            try:
                created_at = datetime.fromisoformat(
                    created_at_str.replace("Z", "+00:00")
                )
            except (ValueError, AttributeError):
                created_at = datetime.now()
        else:
            created_at = datetime.now()

        # Extract plan and pricing information
        # Contabo provides productName directly (e.g., "VPS S SSD")
        plan = data.get("productName")

        # If no productName, try alternative plan identifiers
        if not plan:
            plan = (
                data.get("productType") or data.get("productId") or data.get("imageId")
            )

        # If still no plan, construct from resources
        if not plan:
            cpu = data.get("cpuCores", 0)
            ram = data.get("ramMb", 0)
            disk_mb = data.get("diskMb", 0)
            disk_gb = disk_mb / 1024 if disk_mb else 0
            if cpu or ram or disk_gb:
                plan = f"VPS {cpu}C {ram}MB {int(disk_gb)}GB"

        # Try to get pricing from multiple possible fields
        price = None
        price_candidates = [
            data.get("priceMonthly"),
            data.get("monthlyPrice"),
            data.get("price"),
            data.get("billingPrice"),
        ]

        for candidate in price_candidates:
            if candidate is not None:
                try:
                    price = float(candidate)
                    break
                except (ValueError, TypeError):
                    continue

        # Convert diskMb to diskGb (Contabo uses diskMb)
        disk_gb = 0
        disk_mb = data.get("diskMb", 0)
        if disk_mb:
            disk_gb = disk_mb / 1024

        # Use regionName for better readability, fall back to region
        region = (
            data.get("regionName") or data.get("dataCenter") or data.get("region", "")
        )

        return VPSInstance(
            id=str(data.get("instanceId")),
            name=data.get("displayName", ""),
            status=self._normalize_status(data.get("status", "error")),
            ipv4=data.get("ipConfig", {}).get("v4", {}).get("ip", ""),
            ipv6=data.get("ipConfig", {}).get("v6", {}).get("ip", None),
            cpu_cores=data.get("cpuCores", 0),
            ram_mb=data.get("ramMb", 0),
            disk_gb=disk_gb,
            region=region,
            created_at=created_at,
            provider_type="contabo",
            provider_account_id=self.provider_id,
            plan=plan,
            monthly_price=price,
            currency="USD",
            raw_data=data,
        )

    def list_invoices(self, limit: int = 12) -> list:
        """Fetch invoices from Contabo."""
        if not self.access_token:
            self.authenticate()

        try:
            url = f"{self.API_BASE_URL}/v1/billing/invoices"
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "x-request-id": str(uuid.uuid4()),
            }
            params = {"size": limit}

            response = requests.get(url, headers=headers, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()
            invoices = []

            for item in data.get("data", []):
                invoice = {
                    "id": str(item.get("invoiceNumber", "")),
                    "invoice_number": item.get("invoiceNumber", ""),
                    "date": item.get("invoiceDate"),
                    "due_date": item.get("dueDate"),
                    "amount": float(item.get("totalAmount", 0))
                    / 100,  # Convert from cents
                    "status": self._normalize_invoice_status(
                        item.get("invoiceStatus", "")
                    ),
                    "provider_type": "contabo",
                    "provider_account_id": self.provider_id,
                    "raw_data": item,
                }
                invoices.append(invoice)

            return invoices
        except requests.RequestException as e:
            raise Exception(f"Failed to fetch Contabo invoices: {str(e)}")

    @staticmethod
    def _normalize_invoice_status(status: str) -> str:
        """Normalize invoice status."""
        status_lower = status.lower()
        if status_lower in ["paid", "payed"]:
            return "Paid"
        elif status_lower in ["pending", "outstanding", "open"]:
            return "Pending"
        elif status_lower in ["overdue", "due"]:
            return "Overdue"
        else:
            return status
