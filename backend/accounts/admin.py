from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):

    fieldsets = UserAdmin.fieldsets + (
        (
            "Military Asset System",
            {
                "fields": (
                    "role",
                    "base",
                )
            },
        ),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "Military Asset System",
            {
                "fields": (
                    "role",
                    "base",
                )
            },
        ),
    )