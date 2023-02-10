from django.shortcuts import render

def index(request, resource):
    return render(request, 'frontend/index.html')
