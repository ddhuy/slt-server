import json

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render

from django.contrib.auth.models import User

from SltServer.logger import *

from SltServer.views import BasePage

class TestConfigPage ( BasePage ) :
    template_name = "test_config.html"

    # init POST controller functions
    def __init__ ( self ) :
        super(TestConfigPage, self).__init__()
        self._funcdict = {
        }

    def get ( self, request, *args, **kwargs ) :
        operators = User.objects.all().order_by('username')
        return render(request, self.template_name, {'Operators': operators})