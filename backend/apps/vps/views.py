from datetime import datetime
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from vps.models import InstanceCustomPrice
from .serializers import VPSInstanceSerializer, InstanceCustomPriceSerializer
from .services.aggregator import VPSAggregator


class VPSViewSet(viewsets.ViewSet):
    """ViewSet for aggregated VPS instances from all providers."""

    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Get all VPS instances from all active providers."""
        try:
            instances = VPSAggregator.get_all_instances(request.user)

            # Apply filters if provided
            instances = self._apply_filters(instances, request)

            serializer = VPSInstanceSerializer(instances, many=True)
            return Response(
                {
                    "results": serializer.data,
                    "count": len(serializer.data),
                    "fetched_at": datetime.utcnow().isoformat(),
                }
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=["get"], url_path="by-provider")
    def by_provider(self, request):
        """Get VPS instances from a specific provider."""
        provider_id = request.query_params.get("provider_id")
        if not provider_id:
            return Response(
                {"error": "provider_id query parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            instances = VPSAggregator.get_provider_instances(
                int(provider_id),
                request.user,
            )

            # Apply filters if provided
            instances = self._apply_filters(instances, request)

            serializer = VPSInstanceSerializer(instances, many=True)
            return Response(
                {
                    "results": serializer.data,
                    "count": len(serializer.data),
                    "fetched_at": datetime.utcnow().isoformat(),
                }
            )

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=["post"], url_path="refresh")
    def refresh(self, request):
        """Refresh cache for all providers."""
        try:
            VPSAggregator.clear_cache()
            return Response({"status": "success", "message": "Cache cleared"})
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @staticmethod
    def _apply_filters(instances, request):
        """Apply query parameter filters to instances."""
        provider_type = request.query_params.get("provider_type")
        status_filter = request.query_params.get("status")
        region_filter = request.query_params.get("region")

        if provider_type:
            instances = [i for i in instances if i.provider_type == provider_type]

        if status_filter:
            instances = [i for i in instances if i.status == status_filter]

        if region_filter:
            instances = [i for i in instances if i.region == region_filter]

        return instances


class InstanceCustomPriceViewSet(viewsets.ModelViewSet):
    """ViewSet for managing custom instance prices."""

    queryset = InstanceCustomPrice.objects.all()
    serializer_class = InstanceCustomPriceSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["provider", "is_active"]
    search_fields = ["instance_id", "instance_ip"]

    def get_queryset(self):
        """Filter custom prices by user's providers."""
        user = self.request.user
        return InstanceCustomPrice.objects.filter(
            provider__user=user
        ).select_related("provider")
