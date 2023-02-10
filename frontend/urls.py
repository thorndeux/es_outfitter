from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, {'resource': ''} ),
    path('<path:resource>', views.index ),
]