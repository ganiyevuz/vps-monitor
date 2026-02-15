from datetime import datetime, timedelta
from typing import List

import requests

from .base import BaseProviderClient, VPSInstance


class DigitalOceanClient(BaseProviderClient):
    """DigitalOcean API client using Bearer token authentication."""

    API_BASE_URL = "https://api.digitalocean.com/v2"

    def __init__(self, credentials: dict, provider_id: int):
        """
        Initialize DigitalOcean client.

        Expects credentials with:
        - token (API token)
        """
        super().__init__(credentials, provider_id)

    def authenticate(self) -> bool:
        """Test authentication by making a simple API call."""
        try:
            headers = self._get_headers()
            response = requests.get(
                f"{self.API_BASE_URL}/account",
                headers=headers,
                timeout=10,
            )
            response.raise_for_status()
            return True
        except requests.RequestException:
            return False

    def list_instances(self) -> List[VPSInstance]:
        """Fetch all droplets (VPS instances) from DigitalOcean."""
        instances = []

        try:
            url = f"{self.API_BASE_URL}/droplets"
            headers = self._get_headers()
            params = {"per_page": 250}  # Max per page
            page = 1

            while True:
                params["page"] = page
                response = requests.get(url, headers=headers, params=params, timeout=10)
                response.raise_for_status()

                data = response.json()
                droplets = data.get("droplets", [])

                if not droplets:
                    break

                for droplet in droplets:
                    instance = self._normalize_instance(droplet)
                    instances.append(instance)

                # Check if there are more pages
                links = data.get("links", {})
                if "pages" not in links or "next" not in links.get("pages", {}):
                    break

                page += 1
        except requests.RequestException as e:
            raise Exception(f"Failed to fetch DigitalOcean droplets: {str(e)}")

        return instances

    def get_instance(self, instance_id: str) -> VPSInstance:
        """Fetch a single droplet by ID."""
        try:
            url = f"{self.API_BASE_URL}/droplets/{instance_id}"
            headers = self._get_headers()

            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()

            droplet = response.json().get("droplet", {})
            return self._normalize_instance(droplet)
        except requests.RequestException as e:
            raise Exception(
                f"Failed to fetch DigitalOcean droplet {instance_id}: {str(e)}"
            )

    def _get_headers(self) -> dict:
        """Get authorization headers."""
        return {
            "Authorization": f"Bearer {self.credentials.get('token')}",
            "Content-Type": "application/json",
        }

    def _normalize_instance(self, data: dict) -> VPSInstance:
        """Normalize DigitalOcean API response to VPSInstance."""
        # Extract IPs from networks
        ipv4 = ""
        ipv6 = None

        networks = data.get("networks", {})
        for net in networks.get("v4", []):
            if net.get("type") == "public":
                ipv4 = net.get("ip_address", "")
                break

        for net in networks.get("v6", []):
            if net.get("type") == "public":
                ipv6 = net.get("ip_address", None)
                break

        created_at_str = data.get("created_at", datetime.now().isoformat())
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
        plan = data.get("size_slug", None)
        price = None

        # Try to get pricing from size object
        if "size" in data:
            size_data = data.get("size", {})
            if isinstance(size_data, dict):
                # Try multiple possible price field names
                for price_field in ["price_monthly", "priceMonthly", "price"]:
                    price_value = size_data.get(price_field)
                    if price_value:
                        try:
                            price = float(price_value)
                            break
                        except (ValueError, TypeError):
                            continue

                # If no plan name yet, try to get from size object
                if not plan:
                    plan = size_data.get("slug") or size_data.get("name")

        # If no plan name yet, construct from resources
        if not plan:
            vcpus = data.get("vcpus", 0)
            memory = data.get("memory", 0)
            disk = data.get("disk", 0)
            if vcpus or memory or disk:
                plan = f"Droplet {vcpus}vCPU {memory}MB {disk}GB"

        return VPSInstance(
            id=str(data.get("id")),
            name=data.get("name", ""),
            status=self._normalize_status(data.get("status", "error")),
            ipv4=ipv4,
            ipv6=ipv6,
            cpu_cores=data.get("vcpus", 0),
            ram_mb=data.get("memory", 0),
            disk_gb=data.get("disk", 0),
            region=data.get("region", {}).get("slug", ""),
            created_at=created_at,
            provider_type="digitalocean",
            provider_account_id=self.provider_id,
            plan=plan,
            monthly_price=price,
            currency="USD",
            raw_data=data,
        )

    def list_invoices(self, limit: int = 12) -> list:
        """Fetch invoices from DigitalOcean using the billing history endpoint."""
        try:
            headers = self._get_headers()
            invoices = []

            # Fetch billing history
            url = f"{self.API_BASE_URL}/customers/my/billing_history"
            params = {"limit": limit}
            response = requests.get(url, headers=headers, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()
            billing_history = data.get("billing_history", [])

            # Group by invoice month to create invoices
            invoice_months = {}
            for item in billing_history:
                # Get the invoice period (YYYY-MM format)
                invoice_period = item.get("invoice_period", "")
                if not invoice_period:
                    continue

                # Aggregate amounts by invoice period
                if invoice_period not in invoice_months:
                    invoice_months[invoice_period] = {
                        "period": invoice_period,
                        "amount": 0.0,
                        "items": [],
                    }

                try:
                    amount = float(item.get("amount", 0))
                    invoice_months[invoice_period]["amount"] += amount
                except (ValueError, TypeError):
                    pass

                invoice_months[invoice_period]["items"].append(item)

            # Convert to invoice list
            for period, invoice_data in sorted(invoice_months.items(), reverse=True)[
                :limit
            ]:
                try:
                    # Parse the invoice period (YYYY-MM format)
                    invoice_date = datetime.strptime(period, "%Y-%m")
                    # Due date is typically end of month or 15 days after
                    due_date = invoice_date + timedelta(days=30)

                    invoice = {
                        "id": period,
                        "invoice_number": f"INV-{period.replace('-', '')}",
                        "date": invoice_date.isoformat(),
                        "due_date": due_date.isoformat(),
                        "amount": invoice_data["amount"],
                        "status": "Paid",  # DigitalOcean billing history shows only paid items
                        "provider_type": "digitalocean",
                        "provider_account_id": self.provider_id,
                        "raw_data": invoice_data,
                    }
                    invoices.append(invoice)
                except (ValueError, TypeError, KeyError) as e:
                    print(f"Error parsing invoice period {period}: {str(e)}")
                    continue

            return invoices
        except requests.RequestException as e:
            raise Exception(f"Failed to fetch DigitalOcean invoices: {str(e)}")
