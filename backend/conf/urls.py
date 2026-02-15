from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

import conf.swagger
from conf import settings
from conf.settings import MEDIA_URL, MEDIA_ROOT, STATIC_ROOT, STATIC_URL

urlpatterns = [
    path("admin/", admin.site.urls),
    # Health check endpoints
    path("api/v1/", include("apps.urls")),
]
if settings.DEBUG:
    import debug_toolbar

    urlpatterns += (
        [
            path("__debug__", include(debug_toolbar.urls)),
        ]
        + conf.swagger.urlpatterns
        + static(STATIC_URL, document_root=STATIC_ROOT)
        + static(MEDIA_URL, document_root=MEDIA_ROOT)
    )
