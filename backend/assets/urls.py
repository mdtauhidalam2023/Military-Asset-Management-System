from django.urls import path

from .views import (
    DashboardView,
    BaseListView,
    EquipmentTypeListView,
)


urlpatterns = [
    path(
        "dashboard/",
        DashboardView.as_view(),
        name="dashboard"
    ),

    path(
        "bases/",
        BaseListView.as_view(),
        name="base-list"
    ),

    path(
        "equipment-types/",
        EquipmentTypeListView.as_view(),
        name="equipment-type-list"
    ),
]