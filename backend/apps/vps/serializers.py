from rest_framework import serializers


class VPSInstanceSerializer(serializers.Serializer):
    """Serializer for VPS instances from multiple providers."""

    id = serializers.CharField()
    name = serializers.CharField()
    status = serializers.CharField()
    ipv4 = serializers.CharField()
    ipv6 = serializers.CharField(allow_null=True)
    cpu_cores = serializers.IntegerField()
    ram_mb = serializers.IntegerField()
    disk_gb = serializers.IntegerField()
    region = serializers.CharField()
    created_at = serializers.DateTimeField()
    provider_type = serializers.CharField()
    provider_account_id = serializers.IntegerField()
    plan = serializers.CharField(allow_null=True)
    monthly_price = serializers.FloatField(allow_null=True)
    currency = serializers.CharField(default="USD")
