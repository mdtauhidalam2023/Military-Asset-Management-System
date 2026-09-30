from django.conf import settings
from django.db import models
from assets.models import Base, EquipmentType


class Transfer(models.Model):

    from_base = models.ForeignKey(
        Base,
        on_delete=models.PROTECT,
        related_name="transfers_out"
    )

    to_base = models.ForeignKey(
        Base,
        on_delete=models.PROTECT,
        related_name="transfers_in"
    )

    equipment_type = models.ForeignKey(
        EquipmentType,
        on_delete=models.PROTECT,
        related_name="transfers"
    )

    quantity = models.PositiveIntegerField()

    transfer_date = models.DateField()

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="transfers_created"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (
            f"{self.equipment_type}: "
            f"{self.from_base} -> {self.to_base}"
        )