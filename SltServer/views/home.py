from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.http import HttpResponse
from django.shortcuts import render
from django.views.generic import TemplateView

class HomePage ( LoginRequiredMixin, TemplateView ) :
    template_name = "home.html"

    def get ( self, request ) :
        return render(request, self.template_name)