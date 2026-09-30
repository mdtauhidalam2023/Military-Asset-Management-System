from django.conf import settings
from django.db import models
from assets.models import Base, EquipmentType


class Purchase(models.Model):
    base = models.ForeignKey(
        Base,
        on_delete=models.PROTECT,
        related_name="purchases"
    )

    equipment_type = models.ForeignKey(
        EquipmentType,
        on_delete=models.PROTECT,
        related_name="purchases"
    )

    quantity = models.PositiveIntegerField()

    purchase_date = models.DateField()

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="purchases_created"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.equipment_type} - {self.quantity}"