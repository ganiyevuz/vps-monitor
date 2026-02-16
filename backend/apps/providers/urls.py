from rest_framework.routers import SimpleRouter

from .views import ProviderViewSet

router = SimpleRouter(trailing_slash=False)
router.register(r"providers", ProviderViewSet, basename="provider")

urlpatterns = router.urls
