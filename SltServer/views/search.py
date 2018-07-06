import json

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render

from SltServer.models import Architecture
from SltServer.models import SltMode
from SltServer.models import TestResult

from SltServer.views import BasePage

class SearchPage ( BasePage ) :
    template_name = "search.html"

    # init POST controller functions
    def __init__ ( self ) :
        self._funcdict = {
            'GetTestResult' : self.__GetTestResult,
            'GetTestHistory' : self.__GetTestHistory,
            'GetTestResultDetail' : self.__GetTestResultDetail,
            'GetStatisticsByLotNumber' : self.__GetStatisticsByLotNumber,
        }

    def get ( self, request, *args, **kwargs ) :
        arch_name = self._get_arch_name(kwargs['arch'])
        summ_mode = self._get_summary_mode_name(kwargs['mode'])
        return render(request, self.template_name, {'ArchName': arch_name, 'SummMode': summ_mode})

    def _get_arch_name ( self, arch ) :
        arch_name = Architecture.get_name(arch)
        if (not arch_name) :
            raise Http404
        return arch_name

    def _get_summary_mode_name ( self, summ_mode ) :
        summ_mode = SltMode.get_name(summ_mode)
        if (not summ_mode) :
            raise Http404
        return summ_mode

    def __GetTestResult ( self, request, *args, **kwargs ) :
        arch_name = kwargs['arch']
        summ_mode = kwargs['mode']
        Data = json.loads(request.POST.get('Data', {}))

        JsonResp = TestResult.GetTestResult(arch_name, summ_mode, Data)
        return JsonResponse(status = 200, data = {'Errno': 0, 'Data': 'OK'})

    def __GetTestHistory ( self, request ) :
        pass

    def __GetTestResultDetail ( self, request ) :
        pass

    def __GetStatisticsByLotNumber ( self, request ) :
        pass