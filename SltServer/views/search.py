from django.http import HttpResponse, JsonResponse
from django.shortcuts import render

from SltServer.models import Architecture
from SltServer.models import SltMode

from SltServer.views import BasePage

class SearchPage ( BasePage ) :
    template_name = "search.html"

    ArchName = None
    SummMode = None

    # init POST controller functions
    def __init__ ( self ) :
        self._funcdict = {
            'GetTestResult' : self.__GetTestResult,
            'GetTestHistory' : self.__GetTestHistory,
            'GetTestResultDetail' : self.__GetTestResultDetail,
            'GetStatisticsByLotNumber' : self.__GetStatisticsByLotNumber,
        }

    def get ( self, request, arch, mode, *args, **kwargs ) :
        self.ArchName = self._get_arch_name(arch)
        self.SummMode = self._get_summary_mode_name(mode)
        return render(request, self.template_name, {'ArchName': self.ArchName, 'SummMode': self.SummMode})

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

    def __GetTestResult ( self, request ) :
        return JsonResponse(status = 200, data = {'error': 0, 'data': 'OK'})

    def __GetTestHistory ( self, request ) :
        pass

    def __GetTestResultDetail ( self, request ) :
        pass

    def __GetStatisticsByLotNumber ( self, request ) :
        pass