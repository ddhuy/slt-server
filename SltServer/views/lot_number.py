import httplib, json

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render

from django.contrib.auth.models import User
from SltServer.models import LotNumber

from SltServer.logger import *

from SltServer.serializers import LotNumberSerializer

from SltServer.views import BasePage

class LotNumberPage ( BasePage ) :
    template_name = "lot_number.html"

    # init POST controller functions
    def __init__ ( self ) :
        super(LotNumberPage, self).__init__()
        self._funcdict = {
        }

    def get ( self, request, *args, **kwargs ) :
        lot_numbers = LotNumber.objects.all()
        return render(request, self.template_name, {'LotNumbers': lot_numbers})
