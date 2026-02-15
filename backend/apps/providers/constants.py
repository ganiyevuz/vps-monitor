from django.db import models


class ProviderType(models.TextChoices):
    """Supported cloud provider types."""

    CONTABO = "contabo", "Contabo"
    DIGITALOCEAN = "digitalocean", "DigitalOcean"
