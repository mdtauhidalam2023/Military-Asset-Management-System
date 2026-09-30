from django.db.models import Q
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied

from accounts.permissions import CanManageLogistics
from audit.models import AuditLog

from .models import Transfer
from .serializers import TransferSerializer


class TransferListCreateView(generics.ListCreateAPIView):

    serializer_class = TransferSerializer
    permission_classes = [CanManageLogistics]

    def get_queryset(self):

        user = self.request.user

        queryset = Transfer.objects.select_related(
            "from_base",
            "to_base",
            "equipment_type",
            "created_by",
        ).all().order_by(
            "-transfer_date",
            "-created_at"
        )

        # Commander and Logistics can only see
        # transfers involving their assigned base.
        if user.role in ["COMMANDER", "LOGISTICS"]:

            if user.base is None:
                return queryset.none()

            queryset = queryset.filter(
                Q(from_base=user.base) |
                Q(to_base=user.base)
            )

        # Filters
        base_id = self.request.query_params.get("base")
        equipment_type = self.request.query_params.get(
            "equipment_type"
        )
        date = self.request.query_params.get("date")

        if base_id and user.role == "ADMIN":
            queryset = queryset.filter(
                Q(from_base_id=base_id) |
                Q(to_base_id=base_id)
            )

        if equipment_type:
            queryset = queryset.filter(
                equipment_type_id=equipment_type
            )

        if date:
            queryset = queryset.filter(
                transfer_date=date
            )

        return queryset

    def perform_create(self, serializer):

        user = self.request.user

        from_base = serializer.validated_data["from_base"]
        to_base = serializer.validated_data["to_base"]

        if user.role in ["COMMANDER", "LOGISTICS"]:

            if user.base is None:
                raise PermissionDenied(
                    "No base is assigned to this user."
                )

            # User must be initiating transfer from own base.
            if from_base != user.base:
                raise PermissionDenied(
                    "You can only transfer assets "
                    "from your assigned base."
                )

        transfer = serializer.save(
            created_by=user
        )

        AuditLog.objects.create(
            user=user,
            action="TRANSFER_CREATED",
            entity_type="Transfer",
            entity_id=transfer.id,
            details=(
                f"Transferred {transfer.quantity} "
                f"{transfer.equipment_type.name} "
                f"from {transfer.from_base.name} "
                f"to {transfer.to_base.name}"
            ),
        )