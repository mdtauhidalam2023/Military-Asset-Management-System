from rest_framework import generics
from rest_framework.exceptions import PermissionDenied

from accounts.permissions import IsAdminOrCommander
from audit.models import AuditLog

from .models import Assignment, Expenditure
from .serializers import (
    AssignmentSerializer,
    ExpenditureSerializer,
)


class AssignmentListCreateView(generics.ListCreateAPIView):

    serializer_class = AssignmentSerializer
    permission_classes = [IsAdminOrCommander]

    def get_queryset(self):

        user = self.request.user

        queryset = Assignment.objects.select_related(
            "base",
            "equipment_type",
            "created_by",
        ).all().order_by(
            "-assignment_date",
            "-created_at"
        )

        if user.role == "COMMANDER":
            queryset = queryset.filter(base=user.base)

        base_id = self.request.query_params.get("base")
        equipment_type = self.request.query_params.get(
            "equipment_type"
        )
        date = self.request.query_params.get("date")

        if base_id and user.role == "ADMIN":
            queryset = queryset.filter(base_id=base_id)

        if equipment_type:
            queryset = queryset.filter(
                equipment_type_id=equipment_type
            )

        if date:
            queryset = queryset.filter(
                assignment_date=date
            )

        return queryset

    def perform_create(self, serializer):

        user = self.request.user
        requested_base = serializer.validated_data["base"]

        if user.role == "COMMANDER":

            if user.base is None:
                raise PermissionDenied(
                    "No base is assigned to this user."
                )

            if requested_base != user.base:
                raise PermissionDenied(
                    "You can only assign assets "
                    "from your assigned base."
                )

        assignment = serializer.save(
            created_by=user
        )

        AuditLog.objects.create(
            user=user,
            action="ASSET_ASSIGNED",
            entity_type="Assignment",
            entity_id=assignment.id,
            details=(
                f"Assigned {assignment.quantity} "
                f"{assignment.equipment_type.name} "
                f"to {assignment.assigned_to} "
                f"at {assignment.base.name}"
            ),
        )


class ExpenditureListCreateView(generics.ListCreateAPIView):

    serializer_class = ExpenditureSerializer
    permission_classes = [IsAdminOrCommander]

    def get_queryset(self):

        user = self.request.user

        queryset = Expenditure.objects.select_related(
            "base",
            "equipment_type",
            "created_by",
        ).all().order_by(
            "-expenditure_date",
            "-created_at"
        )

        if user.role == "COMMANDER":
            queryset = queryset.filter(base=user.base)

        base_id = self.request.query_params.get("base")
        equipment_type = self.request.query_params.get(
            "equipment_type"
        )
        date = self.request.query_params.get("date")

        if base_id and user.role == "ADMIN":
            queryset = queryset.filter(base_id=base_id)

        if equipment_type:
            queryset = queryset.filter(
                equipment_type_id=equipment_type
            )

        if date:
            queryset = queryset.filter(
                expenditure_date=date
            )

        return queryset

    def perform_create(self, serializer):

        user = self.request.user
        requested_base = serializer.validated_data["base"]

        if user.role == "COMMANDER":

            if user.base is None:
                raise PermissionDenied(
                    "No base is assigned to this user."
                )

            if requested_base != user.base:
                raise PermissionDenied(
                    "You can only record expenditure "
                    "for your assigned base."
                )

        expenditure = serializer.save(
            created_by=user
        )

        AuditLog.objects.create(
            user=user,
            action="ASSET_EXPENDED",
            entity_type="Expenditure",
            entity_id=expenditure.id,
            details=(
                f"Expended {expenditure.quantity} "
                f"{expenditure.equipment_type.name} "
                f"at {expenditure.base.name}. "
                f"Reason: {expenditure.reason}"
            ),
        )