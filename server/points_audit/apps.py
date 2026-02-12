from django.apps import AppConfig


class PointsAuditConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'points_audit'
    verbose_name = 'Points Audit Log'
