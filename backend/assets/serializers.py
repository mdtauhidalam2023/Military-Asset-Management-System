from rest_framework import serializers
from .models import Base, EquipmentType


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Base
        fields = ["id", "name", "location"]


class EquipmentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquipmentType
        fields = ["id", "name", "description"]