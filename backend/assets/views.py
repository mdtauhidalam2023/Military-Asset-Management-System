from datetime import date

from django.db.models import Sum
from django.db.models.functions import Coalesce
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import CanManageLogistics
from operations.models import Assignment, Expenditure
from purchases.models import Purchase
from transfers.models import Transfer

from rest_framework import generics

from .models import Base, EquipmentType
from .serializers import BaseSerializer, EquipmentTypeSerializer


class BaseListView(generics.ListAPIView):
    queryset = Base.objects.all().order_by("name")
    serializer_class = BaseSerializer


class EquipmentTypeListView(generics.ListAPIView):
    queryset = EquipmentType.objects.all().order_by("name")
    serializer_class = EquipmentTypeSerializer


class DashboardView(APIView):

    permission_classes = [CanManageLogistics]

    def get(self, request):

        user = request.user

        base_id = request.query_params.get("base")
        equipment_type_id = request.query_params.get(
            "equipment_type"
        )

        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        # Commander / Logistics are restricted to their base.
        if user.role in ["COMMANDER", "LOGISTICS"]:
            if user.base is None:
                return Response(
                    {"detail": "No base assigned to user."},
                    status=400
                )

            base_id = user.base_id

        purchases = Purchase.objects.all()
        transfers_in = Transfer.objects.all()
        transfers_out = Transfer.objects.all()
        assignments = Assignment.objects.all()
        expenditures = Expenditure.objects.all()

        # -------------------------
        # BASE FILTER
        # -------------------------

        if base_id:
            purchases = purchases.filter(
                base_id=base_id
            )

            transfers_in = transfers_in.filter(
                to_base_id=base_id
            )

            transfers_out = transfers_out.filter(
                from_base_id=base_id
            )

            assignments = assignments.filter(
                base_id=base_id
            )

            expenditures = expenditures.filter(
                base_id=base_id
            )

        # -------------------------
        # EQUIPMENT FILTER
        # -------------------------

        if equipment_type_id:

            purchases = purchases.filter(
                equipment_type_id=equipment_type_id
            )

            transfers_in = transfers_in.filter(
                equipment_type_id=equipment_type_id
            )

            transfers_out = transfers_out.filter(
                equipment_type_id=equipment_type_id
            )

            assignments = assignments.filter(
                equipment_type_id=equipment_type_id
            )

            expenditures = expenditures.filter(
                equipment_type_id=equipment_type_id
            )

        # -------------------------
        # OPENING BALANCE
        # -------------------------

        opening_balance = 0

        if start_date:

            previous_purchases = Purchase.objects.filter(
                purchase_date__lt=start_date
            )

            previous_transfer_in = Transfer.objects.filter(
                transfer_date__lt=start_date
            )

            previous_transfer_out = Transfer.objects.filter(
                transfer_date__lt=start_date
            )

            previous_expenditures = Expenditure.objects.filter(
                expenditure_date__lt=start_date
            )

            if base_id:
                previous_purchases = previous_purchases.filter(
                    base_id=base_id
                )

                previous_transfer_in = previous_transfer_in.filter(
                    to_base_id=base_id
                )

                previous_transfer_out = previous_transfer_out.filter(
                    from_base_id=base_id
                )

                previous_expenditures = previous_expenditures.filter(
                    base_id=base_id
                )

            if equipment_type_id:
                previous_purchases = previous_purchases.filter(
                    equipment_type_id=equipment_type_id
                )

                previous_transfer_in = previous_transfer_in.filter(
                    equipment_type_id=equipment_type_id
                )

                previous_transfer_out = previous_transfer_out.filter(
                    equipment_type_id=equipment_type_id
                )

                previous_expenditures = previous_expenditures.filter(
                    equipment_type_id=equipment_type_id
                )

            previous_purchase_total = (
                previous_purchases.aggregate(
                    total=Coalesce(Sum("quantity"), 0)
                )["total"]
            )

            previous_transfer_in_total = (
                previous_transfer_in.aggregate(
                    total=Coalesce(Sum("quantity"), 0)
                )["total"]
            )

            previous_transfer_out_total = (
                previous_transfer_out.aggregate(
                    total=Coalesce(Sum("quantity"), 0)
                )["total"]
            )

            previous_expended_total = (
                previous_expenditures.aggregate(
                    total=Coalesce(Sum("quantity"), 0)
                )["total"]
            )

            opening_balance = (
                previous_purchase_total
                + previous_transfer_in_total
                - previous_transfer_out_total
                - previous_expended_total
            )

        # -------------------------
        # DATE FILTER
        # -------------------------

        if start_date:

            purchases = purchases.filter(
                purchase_date__gte=start_date
            )

            transfers_in = transfers_in.filter(
                transfer_date__gte=start_date
            )

            transfers_out = transfers_out.filter(
                transfer_date__gte=start_date
            )

            assignments = assignments.filter(
                assignment_date__gte=start_date
            )

            expenditures = expenditures.filter(
                expenditure_date__gte=start_date
            )

        if end_date:

            purchases = purchases.filter(
                purchase_date__lte=end_date
            )

            transfers_in = transfers_in.filter(
                transfer_date__lte=end_date
            )

            transfers_out = transfers_out.filter(
                transfer_date__lte=end_date
            )

            assignments = assignments.filter(
                assignment_date__lte=end_date
            )

            expenditures = expenditures.filter(
                expenditure_date__lte=end_date
            )

        # -------------------------
        # TOTALS
        # -------------------------

        purchase_total = purchases.aggregate(
            total=Coalesce(Sum("quantity"), 0)
        )["total"]

        transfer_in_total = transfers_in.aggregate(
            total=Coalesce(Sum("quantity"), 0)
        )["total"]

        transfer_out_total = transfers_out.aggregate(
            total=Coalesce(Sum("quantity"), 0)
        )["total"]

        assigned_total = assignments.aggregate(
            total=Coalesce(Sum("quantity"), 0)
        )["total"]

        expended_total = expenditures.aggregate(
            total=Coalesce(Sum("quantity"), 0)
        )["total"]

        # -------------------------
        # CALCULATIONS
        # -------------------------

        net_movement = (
            purchase_total
            + transfer_in_total
            - transfer_out_total
        )

        closing_balance = (
            opening_balance
            + net_movement
            - expended_total
        )

        return Response({
            "opening_balance": opening_balance,

            "closing_balance": closing_balance,

            "net_movement": net_movement,

            "assigned": assigned_total,

            "expended": expended_total,

            "movement_details": {
                "purchases": purchase_total,
                "transfer_in": transfer_in_total,
                "transfer_out": transfer_out_total,
            }
        })