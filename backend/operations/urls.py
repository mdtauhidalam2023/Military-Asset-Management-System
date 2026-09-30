from django.urls import path

from .views import (
    AssignmentListCreateView,
    ExpenditureListCreateView,
)


urlpatterns = [
    path(
        "assignments/",
        AssignmentListCreateView.as_view(),
        name="assignment-list-create",
    ),

    path(
        "expenditures/",
        ExpenditureListCreateView.as_view(),
        name="expenditure-list-create",
    ),
]