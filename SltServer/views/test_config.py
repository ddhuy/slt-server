import os, csv
import json, httplib
import ConfigParser

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render

from django.contrib.auth.models import User

from SltServer.models.ConfigurationFile import *
from SltServer.models import SltMode
from SltServer.logger import *
from SltServer.views import BasePage


class TestConfigPage ( BasePage ) :
    template_name = "test_config.html"

    # init POST controller functions
    def __init__ ( self ) :
        super(TestConfigPage, self).__init__()
        self._funcdict = {
            'GenerateTestId' : self.__GenerateTestId,
            'GetTestPlans' : self.__GetTestPlans,
            'SetTestPlans' : self.__SetTestPlans,
            'GetBoardSettings' : self.__GetBoardSettings,
            'SetBoardSettings' : self.__SetBoardSettings,
            'GetTestSuites': self.__GetTestSuites,
            'SetTestSuites': self.__SetTestSuites,
        }

    def get ( self, request, *args, **kwargs ) :
        operators = User.objects.all().order_by('username')
        sltmodes = SltMode.objects.all()
        return render(request, self.template_name, {'Operators': operators, 'SltModes': sltmodes})

    def __GenerateTestId ( self, request, *args, **kwargs ) :
        Data = json.loads(request.POST.get('Data', {}))
        OperatorId = Data.get('OperatorId', None)
        if (OperatorId == None) :
            return httplib.BAD_REQUEST, 'Not provide Operator ID'
        new_id = Utils.generate_id()
        # TODO: verify the duplicating of new generated id
        return httplib.OK, new_id

    def __GetTestPlans ( self, request, *args, **kwargs ) :
        OperatorId = json.loads(request.POST.get('OperatorId', None))
        if (OperatorId == None) :
            return httplib.BAD_REQUEST, 'OperatorId is empty'
        Operator = User.objects.filter(id = OperatorId).first()
        if (Operator and Operator.profile.Rfid) :
            board_list = Csv_BoardList(Operator.profile.Rfid)
            return httplib.OK, board_list.GetData()
        else :
            return httplib.NOT_FOUND, 'Operator not found or Rfid not assigned'

    def __SetTestPlans ( self, request, *args, **kwargs ) :
        Data = json.loads(request.POST.get('Data', None))
        if (Data == None) :
            return httplib.BAD_REQUEST, 'Request Data is empty'
        OperatorId = Data.get('OperatorId', None)
        if (OperatorId == None) :
            return httplib.BAD_REQUEST, 'Operator ID is empty'
        TestPlans = Data.get('TestPlans', None)
        if (TestPlans == None) :
            return httplib.BAD_REQUEST, 'Test Plans is empty'
        Operator = User.objects.filter(id = OperatorId).first()
        if (Operator and Operator.profile.Rfid) :
            board_list = Csv_BoardList(Operator.profile.Rfid)
            board_list_data = []
            for plan in TestPlans :
                data = board_list.CreateItem(**plan)
                board_list_data.append(data)
            board_list.SetData(board_list_data)
            return httplib.OK, board_list.GetData()
        else :
            return httplib.NOT_FOUND, 'Operator not found or Rfid not assigned'

    def __GetBoardSettings ( self, request, *args, **kwargs ) :
        OperatorId = request.POST.get('OperatorId', None)
        if (OperatorId == None) :
            return httplib.BAD_REQUEST, 'Operator ID is empty'
        TestPlanId = request.POST.get('TestPlanId', None)
        if (TestPlanId == None) :
            return httplib.BAD_REQUEST, 'Test Plan ID is empty'
        Operator = User.objects.filter(id = OperatorId).first()
        if (Operator and Operator.profile.Rfid) :
            board_ini = Ini_BoardSetting(Operator.profile.Rfid, TestPlanId)
            return httplib.OK, board_ini.GetContent()
        else :
            return httplib.NOT_FOUND, 'Operator not found or Rfid not assigned'

    def __SetBoardSettings ( self, request, *args, **kwargs ) :
        OperatorId = request.POST.get('OperatorId', None)
        if (OperatorId == None) :
            return httplib.BAD_REQUEST, 'Operator ID is empty'
        TestPlanId = request.POST.get('TestPlanId', None)
        if (TestPlanId == None) :
            return httplib.BAD_REQUEST, 'Test Plan ID is empty'
        BoardSettings = request.POST.get('BoardSettings', None)
        if (BoardSettings == None) :
            return httplib.BAD_REQUEST, 'Board Settings is empty'
        Operator = User.objects.filter(id = OperatorId).first()
        if (Operator and Operator.profile.Rfid) :
            board_ini = Ini_BoardSetting(Operator.profile.Rfid, TestPlanId)
            board_ini.SetContent(BoardSettings)
            return httplib.OK, board_ini.GetContent()
        else :
            return httplib.NOT_FOUND, 'Operator not found or Rfid not assigned'

    def __GetTestSuites ( self, request, *args, **kwargs ) :
        OperatorId = request.POST.get('OperatorId', None)
        if (OperatorId == None) :
            return httplib.BAD_REQUEST, 'Operator ID is empty'
        TestPlanId = request.POST.get('TestPlanId', None)
        if (TestPlanId == None) :
            return httplib.BAD_REQUEST, 'Test Plan ID is empty'
        Operator = User.objects.filter(id = OperatorId).first()
        if (Operator and Operator.profile.Rfid) :
            test_suites = Csv_MenuDisplay(Operator.profile.Rfid, TestPlanId)
            return httplib.OK, test_suites.GetData()
        else :
            return httplib.NOT_FOUND, 'Operator not found or Rfid not assigned'

    def __SetTestSuites ( self, request, *args, **kwargs ) :
        OperatorId = request.POST.get('OperatorId', None)
        if (OperatorId == None) :
            return httplib.BAD_REQUEST, 'Operator ID is empty'
        TestPlanId = request.POST.get('TestPlanId', None)
        if (TestPlanId == None) :
            return httplib.BAD_REQUEST, 'Test Plan ID is empty'
        TestSuites = json.loads(request.POST.get('TestSuites', {}))
        if (TestSuites == None) :
            return httplib.BAD_REQUEST, 'Test Suites data is empty'
        Operator = User.objects.filter(id = OperatorId).first()
        if (Operator and Operator.profile.Rfid) :
            test_suites = Csv_MenuDisplay(Operator.profile.Rfid, TestPlanId)
            test_suites_data = []
            for suite in TestSuites :
                data = test_suites.CreateItem(**suite)
                test_suites_data.append(data)
            test_suites.SetData(test_suites_data)
            return httplib.OK, test_suites.GetData()
        else :
            return httplib.NOT_FOUND, 'Operator not found or Rfid not assigned'
