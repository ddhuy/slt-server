import httplib, json

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render

from django.contrib.auth.models import User
from SltServer.models import Architecture, Bench
from SltServer.logger import *
from SltServer.serializers import BenchSerializer
from SltServer.views import BasePage

class BenchMonitorPage ( BasePage ) :
    template_name = "bench.html"

    def __init__ ( self ) :
        super(BenchMonitorPage, self).__init__()
        self._funcdict = {
            'GetBenchInfo' : self.__GetBenchInfo,
            'SetBenchInfo' : self.__SetBenchInfo,
        }

    def get ( self, request, *args, **kwargs ) :
        architectures = Architecture.objects.all()
        benches = Bench.objects.all()
        return render(request, self.template_name, {'Architectures': architectures, 'Benches': benches})

    def __SetBenchInfo ( self, request, *args, **kwargs ) :
        BenchId = request.POST.get('BenchId', None)
        if (BenchId == None) :
            return httplib.BAD_REQUEST, 'Bench ID is not provided.'
        BenchNumber = request.POST.get('BenchNumber', None)
        BoardSerial = request.POST.get('BoardSerial', None)
        SocketSerial = request.POST.get('SocketSerial', None)
        HardwareInfo = request.POST.get('HardwareInfo', None)
        ArchId = request.POST.get('ArchId', None)
        
        bench = Bench.objects.get(id = BenchId)
        if (BenchNumber != None) :
            bench.Number = BenchNumber
        if (BoardSerial != None) :
            bench.BoardSerial = BoardSerial
        if (SocketSerial != None) :
            bench.SocketSerial = SocketSerial
        if(HardwareInfo != None) :
            bench.HardwareInfo = HardwareInfo
        if (ArchId != None) :
            bench.Architecture = Architecture.objects.get(id = ArchId)
        bench.save()
        return httplib.OK, BenchSerializer(bench).data

    def __GetBenchInfo ( self, request, *args, **kwargs ) :
        BenchId = request.POST.get('BenchId', None)
        if (BenchId == None) :
            return httplib.BAD_REQUEST, 'Bench ID is not provided.'
        bench = Bench.objects.get(id = BenchId)
        return httplib.OK, BenchSerializer(bench).data
