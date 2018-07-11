import json

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render

from django.contrib.auth.models import User
from SltServer.models import Architecture
from SltServer.models import SltMode
from SltServer.models import TestResult, TestResultDetail

from SltServer.serializers import TestResultSerializer, TestResultDetailSerializer

from SltServer.views import BasePage

class SearchPage ( BasePage ) :
    template_name = "search.html"

    # init POST controller functions
    def __init__ ( self ) :
        super(SearchPage, self).__init__()
        self._funcdict = {
            'GetTestResult' : self.__GetTestResult,
            'GetTestHistory' : self.__GetTestHistory,
            'GetTestResultDetails' : self.__GetTestResultDetails,
            'GetStatisticsByLotNumber' : self.__GetStatisticsByLotNumber,
        }

    def get ( self, request, *args, **kwargs ) :
        arch_name = self._get_arch_name(kwargs['arch'])
        summ_mode = self._get_summary_mode_name(kwargs['mode'])
        operators = User.objects.all().order_by('username')
        test_envs = TestResult.CollectTestEnvironments(arch_name = arch_name)
        return render(request, self.template_name, {'ArchName': arch_name, 'SummMode': summ_mode,
                                                    'Operators': operators, 'TestEnvironments': test_envs})

    def _get_arch_name ( self, arch ) :
        arch_name = Architecture.GetName(arch)
        if (not arch_name) :
            raise Http404
        return arch_name

    def _get_summary_mode_name ( self, summ_mode ) :
        summ_mode = SltMode.GetName(summ_mode)
        if (not summ_mode) :
            raise Http404
        return summ_mode

    def __GetTestResult ( self, request, *args, **kwargs ) :
        arch_name = kwargs['arch']
        summ_mode = kwargs['mode']
        Data = json.loads(request.POST.get('Data', {}))

        search_req = TestResult.ToSearchRequest(arch_name, Data)
        search_resp = TestResultSerializer(many = True, data = TestResult.GetTestResult(arch_name, summ_mode, search_req))
        if (search_resp.is_valid() == False) :
            print('__GetTestResult: search_resp is not valid')
        return {'Errno': 0, 'Data': search_resp.data}

    def __GetTestHistory ( self, request, *args, **kwargs  ) :
        arch_name = kwargs['arch']
        summ_mode = kwargs['mode']
        Data = json.loads(request.POST.get('Data', {}))
        test_result_id = Data

    def __GetTestResultDetails ( self, request, *args, **kwargs  ) :
        arch_name = kwargs['arch']
        summ_mode = kwargs['mode']
        Data = json.loads(request.POST.get('Data', {}))
        test_result_id = Data
        
        test_result_details = TestResultDetail.objects.filter(TestResult_id = test_result_id)
        post_resp = TestResultDetailSerializer(many = True, data = test_result_details)
        if (post_resp.is_valid() == False) :
            print('__GetTestResultDetails: post_resp is not valid')
        return {'Errno': 0, 'Data': post_resp.data}

    def __GetStatisticsByLotNumber ( self, request, *args, **kwargs  ) :
        pass