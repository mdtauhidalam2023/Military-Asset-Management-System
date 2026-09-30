from django.contrib import admin
from .models import Base, EquipmentType, Asset


admin.site.register(Base)
admin.site.register(EquipmentType)
admin.site.register(Asset)