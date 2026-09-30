from rest_framework import generics
from rest_framework.exceptions import PermissionDenied

from accounts.permissions import CanManageLogistics
from audit.models import AuditLog

from .models import Purchase
from .serializers import PurchaseSerializer


class PurchaseListCreateView(generics.ListCreateAPIView):

    serializer_class = PurchaseSerializer
    permission_classes = [CanManageLogistics]

    def get_queryset(self):

        user = self.request.user

        queryset = Purchase.objects.select_related(
            "base",
            "equipment_type",
            "created_by",
        ).all().order_by("-purchase_date", "-created_at")

        # Base Commander can only view their own base.
        if user.role == "COMMANDER":
            queryset = queryset.filter(base=user.base)

        # Logistics Officer is also restricted to assigned base.
        elif user.role == "LOGISTICS":
            queryset = queryset.filter(base=user.base)

        # Filters
        base_id = self.request.query_params.get("base")
        equipment_type = self.request.query_params.get(
            "equipment_type"
        )
        date = self.request.query_params.get("date")

        # Only Admin can arbitrarily filter across bases.
        if base_id and user.role == "ADMIN":
            queryset = queryset.filter(base_id=base_id)

        if equipment_type:
            queryset = queryset.filter(
                equipment_type_id=equipment_type
            )

        if date:
            queryset = queryset.filter(
                purchase_date=date
            )

        return queryset

    def perform_create(self, serializer):

        user = self.request.user
        requested_base = serializer.validated_data["base"]

        # Commander / Logistics cannot purchase for another base.
        if user.role in ["COMMANDER", "LOGISTICS"]:

            if user.base is None:
                raise PermissionDenied(
                    "No base is assigned to this user."
                )

            if requested_base != user.base:
                raise PermissionDenied(
                    "You can only create purchases "
                    "for your assigned base."
                )

        purchase = serializer.save(
            created_by=user
        )

        AuditLog.objects.create(
            user=user,
            action="PURCHASE_CREATED",
            entity_type="Purchase",
            entity_id=purchase.id,
            details=(
                f"Purchased {purchase.quantity} "
                f"{purchase.equipment_type.name} "
                f"for {purchase.base.name}"
            ),
        )