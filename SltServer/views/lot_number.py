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
            'SetLotNumber': self.__SetLotNumber,
            'DeleteLotNumber': self.__DeleteLotNumber,
        }

    def get ( self, request, *args, **kwargs ) :
        lot_numbers = LotNumber.objects.all()
        return render(request, self.template_name, {'LotNumbers': lot_numbers})

    def __SetLotNumber ( self, request, *args, **kwargs ) :
        Id = request.POST.get('LotId', None)
        if (Id == None) :
            return httplib.BAD_REQUEST, 'Lot ID is empty'
        Number = request.POST.get('LotNumber', None)
        if (Number == None) :
            return httplib.BAD_REQUEST, 'Lot Number is empty'
        Lot = LotNumber.objects.filter(ID = Id).first()
        if (Lot) :
            return httplib.CONFLICT, 'Lot ID is conflicted'
        Lot = LotNumber.objects.filter(Number = Number).first()
        if (Lot) :
            return httplib.CONFLICT, 'Lot Number is conflicted'
        Lot = LotNumber(ID = Id, Number = Number)
        Lot.save()
        return httplib.OK, LotNumberSerializer(Lot).data

    def __DeleteLotNumber ( self, request, *args, **kwargs ) :
        Id = request.POST.get('LotId', None)
        Number = request.POST.get('LotNumber', None)
        if (Id) :
            Lot = LotNumber.objects.filter(ID = Id).first()
        elif (Number) :
            Lot = LotNumber.objects.filter(Number = Number).first()
        else:
            return httplib.BAD_REQUEST, 'User must provide LotId or LotNumber'
        Lot.delete()
        return httplib.OK, LotNumberSerializer(Lot).data
