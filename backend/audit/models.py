from django.conf import settings
from django.db import models


class AuditLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs"
    )

    action = models.CharField(max_length=100)

    entity_type = models.CharField(max_length=100)

    entity_id = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    details = models.TextField(
        blank=True
    )

    timestamp = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        username = self.user.username if self.user else "Unknown User"
        return f"{username} - {self.action}"