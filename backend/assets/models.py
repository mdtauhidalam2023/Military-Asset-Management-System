from django.db import models


class Base(models.Model):
    name = models.CharField(max_length=100, unique=True)
    location = models.CharField(max_length=200)

    def __str__(self):
        return self.name


class EquipmentType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Asset(models.Model):
    name = models.CharField(max_length=150)
    equipment_type = models.ForeignKey(
        EquipmentType,
        on_delete=models.PROTECT,
        related_name="assets"
    )
    base = models.ForeignKey(
        Base,
        on_delete=models.PROTECT,
        related_name="assets"
    )
    quantity = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.name} - {self.base.name}"