from django.contrib import admin

from .models import Hull, Outfit, Outfit_details, Build

# Register your models here.

admin.site.register(Hull)
admin.site.register(Outfit)
admin.site.register(Outfit_details)
admin.site.register(Build)