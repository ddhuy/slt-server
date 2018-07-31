import httplib, json

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render

from django.contrib.auth.models import User
from SltServer.models import Bench
from SltServer.logger import *
from SltServer.serializers import BenchSerializer
from SltServer.views import BasePage

class BenchMonitorPage ( BasePage ) :
    template_name = "bench.html"

    def __init__ ( self ) :
        super(BenchMonitorPage, self).__init__()
        self._funcdict = {
        }

    def get ( self, request, *args, **kwargs ) :
        benches = Bench.objects.all()
        return render(request, self.template_name, {'Benches': benches})
