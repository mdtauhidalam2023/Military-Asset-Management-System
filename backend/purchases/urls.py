from django.urls import path

from .views import PurchaseListCreateView


urlpatterns = [
    path(
        "",
        PurchaseListCreateView.as_view(),
        name="purchase-list-create",
    ),
]