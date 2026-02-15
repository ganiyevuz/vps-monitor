from rest_framework.routers import DefaultRouter

from .views import VPSViewSet

router = DefaultRouter()
router.register(r"vps", VPSViewSet, basename="vps")

urlpatterns = router.urls
