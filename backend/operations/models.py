from django.conf import settings
from django.db import models
from assets.models import Base, EquipmentType


class Assignment(models.Model):
    base = models.ForeignKey(
        Base,
        on_delete=models.PROTECT,
        related_name="assignments"
    )

    equipment_type = models.ForeignKey(
        EquipmentType,
        on_delete=models.PROTECT,
        related_name="assignments"
    )

    assigned_to = models.CharField(max_length=150)
    quantity = models.PositiveIntegerField()
    assignment_date = models.DateField()

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="assignments_created"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.equipment_type} -> {self.assigned_to}"


class Expenditure(models.Model):
    base = models.ForeignKey(
        Base,
        on_delete=models.PROTECT,
        related_name="expenditures"
    )

    equipment_type = models.ForeignKey(
        EquipmentType,
        on_delete=models.PROTECT,
        related_name="expenditures"
    )

    quantity = models.PositiveIntegerField()
    reason = models.CharField(max_length=255)
    expenditure_date = models.DateField()

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="expenditures_created"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.equipment_type} - {self.quantity}"