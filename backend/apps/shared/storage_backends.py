from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage


class StaticMinIOStorage(S3Boto3Storage):
    location = settings.STATICFILES_LOCATION


class MediaMinIOStorage(S3Boto3Storage):
    location = settings.MEDIA_FILES_LOCATION
