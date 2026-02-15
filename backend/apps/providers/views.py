from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Provider
from .serializers import ProviderCreateSerializer, ProviderListSerializer
from .services.factory import ProviderClientFactory


class ProviderViewSet(viewsets.ModelViewSet):
    """ViewSet for managing cloud provider accounts."""

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action in ["create", "update", "partial_update"]:
            return ProviderCreateSerializer
        return ProviderListSerializer

    def get_queryset(self):
        """Return providers for the current user."""
        return Provider.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Create provider with user context."""
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def test_connection(self, request, pk=None):
        """Test connection to provider API and update sync status."""
        provider = self.get_object()

        try:
            credentials = provider.get_credentials()
            client = ProviderClientFactory.create(
                provider.provider_type,
                credentials,
                provider.id,
            )

            if client.authenticate():
                provider.last_sync_at = timezone.now()
                provider.last_sync_status = "success"
                provider.save(update_fields=["last_sync_at", "last_sync_status"])

                return Response(
                    {"status": "success", "message": "Connection successful"},
                    status=status.HTTP_200_OK,
                )
            else:
                provider.last_sync_at = timezone.now()
                provider.last_sync_status = "failed"
                provider.save(update_fields=["last_sync_at", "last_sync_status"])

                return Response(
                    {"status": "error", "message": "Authentication failed"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except Exception as e:
            provider.last_sync_at = timezone.now()
            provider.last_sync_status = "failed"
            provider.save(update_fields=["last_sync_at", "last_sync_status"])

            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
