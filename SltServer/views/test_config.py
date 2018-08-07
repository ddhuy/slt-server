import os, csv
import json, httplib
import ConfigParser

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render

from django.contrib.auth.models import User

from SltServer.models.ConfigurationFile import *
from SltServer.models import SltMode, TestMode, TestCommand
from SltServer.logger import *
from SltServer.FileHelper import *
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
            'GetTestSteps': self.__GetTestSteps,
            'SetTestSteps': self.__SetTestSteps,
            'GetErrorMonitor': self.__GetErrorMonitor,
            'SetErrorMonitor': self.__SetErrorMonitor,
            # Functions for import/export/raw file content
            'ParseBoardSettings': self.__ParseBoardSettings,
            'ExportBoardSettings': self.__ExportBoardSettings,
            'ParseTestSteps': self.__ParseTestSteps,
        }

    def get ( self, request, *args, **kwargs ) :
        if (request.GET.get('Action', None) == 'ExportBoardSettings') :
            return self.__ExportBoardSettings(request, *args, **kwargs)
        operators = User.objects.all().order_by('username')
        sltmodes = SltMode.objects.all()
        runmodes = TestMode.objects.all()
        commands = TestCommand.objects.all()
        return render(request, self.template_name, {'Operators': operators, 'SltModes': sltmodes, 'RunModes': runmodes, 'Commands': commands})

    def __GenerateTestId ( self, request, *args, **kwargs ) :
        Data = json.loads(request.POST.get('Data', {}))
        OperatorId = Data.get('OperatorId', None)
        if (OperatorId == None) :
            return httplib.BAD_REQUEST, 'Not provide Operator ID'
        new_id = utils.generate_id()
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

    def __GetTestSteps ( self, request, *args, **kwargs ) :
        OperatorId = request.POST.get('OperatorId', None)
        if (OperatorId == None) :
            return httplib.BAD_REQUEST, 'Operator ID is empty'
        TestPlanId = request.POST.get('TestPlanId', None)
        if (TestPlanId == None) :
            return httplib.BAD_REQUEST, 'Test Plan ID is empty'
        TestSuiteId = request.POST.get('TestSuiteId', None)
        if (TestSuiteId == None) :
            return httplib.BAD_REQUEST, 'Test Suites ID is empty'
        CfgNumber = request.POST.get('CfgNumber', None)
        if (CfgNumber == None) :
            return httplib.BAD_REQUEST, 'Test Configuration Type is empty'
        Operator = User.objects.filter(id = OperatorId).first()
        if (Operator and Operator.profile.Rfid) :
            if (int(CfgNumber) == 1) :
                test_steps = Csv_TestConfiguration1(Operator.profile.Rfid, TestPlanId, TestSuiteId)
            elif (int(CfgNumber) == 2) :
                test_steps = Csv_TestConfiguration2(Operator.profile.Rfid, TestPlanId, TestSuiteId)
            else :
                return httplib.BAD_REQUEST, 'Test Configuration Type is invalid'
            return httplib.OK, test_steps.GetData()
        else :
            return httplib.NOT_FOUND, 'Operator not found or Rfid not assigned'

    def __SetTestSteps ( self, request, *args, **kwargs ) :
        OperatorId = request.POST.get('OperatorId', None)
        if (OperatorId == None) :
            return httplib.BAD_REQUEST, 'Operator ID is empty'
        TestPlanId = request.POST.get('TestPlanId', None)
        if (TestPlanId == None) :
            return httplib.BAD_REQUEST, 'Test Plan ID is empty'
        TestSuiteId = request.POST.get('TestSuiteId', None)
        if (TestSuiteId == None) :
            return httplib.BAD_REQUEST, 'Test Suites ID is empty'
        TestSteps = json.loads(request.POST.get('TestSteps', []))
        if (TestSteps == None) :
            return httplib.BAD_REQUEST, 'Test Steps data is empty'
        CfgNumber = request.POST.get('CfgNumber', None)
        if (CfgNumber == None) :
            return httplib.BAD_REQUEST, 'Test Configuration Type is empty'
        Operator = User.objects.filter(id = OperatorId).first()
        if (Operator and Operator.profile.Rfid) :
            LOG.info(type(CfgNumber))
            if (int(CfgNumber) == 1) :
                test_steps = Csv_TestConfiguration1(Operator.profile.Rfid, TestPlanId, TestSuiteId)
            elif (int(CfgNumber) == 2) :
                test_steps = Csv_TestConfiguration2(Operator.profile.Rfid, TestPlanId, TestSuiteId)
            else :
                return httplib.BAD_REQUEST, 'Test Configuration Type is invalid'
            test_steps_data = []
            for step in TestSteps :
                data = test_steps.CreateItem(**step)
                test_steps_data.append(data)
            test_steps.SetData(test_steps_data)
            return httplib.OK, test_steps.GetData()
        else :
            return httplib.NOT_FOUND, 'Operator not found or Rfid not assigned'

    def __GetErrorMonitor ( self, request, *args, **kwargs ) :
        OperatorId = request.POST.get('OperatorId', None)
        if (OperatorId == None) :
            return httplib.BAD_REQUEST, 'Operator ID is empty'
        TestPlanId = request.POST.get('TestPlanId', None)
        if (TestPlanId == None) :
            return httplib.BAD_REQUEST, 'Test Plan ID is empty'
        TestSuiteId = request.POST.get('TestSuiteId', None)
        if (TestSuiteId == None) :
            return httplib.BAD_REQUEST, 'Test Suites ID is empty'
        Number = request.POST.get('Number', None)
        if (Number == None) :
            return httplib.BAD_REQUEST, 'Error Monitor Type is empty'
        Operator = User.objects.filter(id = OperatorId).first()
        if (Operator and Operator.profile.Rfid) :
            if (int(Number) == 1) :
                error_monitor = Csv_ErrorMonitor1(Operator.profile.Rfid, TestPlanId, TestSuiteId)
            elif (int(Number) == 2) :
                error_monitor = Csv_ErrorMonitor2(Operator.profile.Rfid, TestPlanId, TestSuiteId)
            else :
                return httplib.BAD_REQUEST, 'Error Monitor Type is invalid'
            return httplib.OK, error_monitor.GetData()
        else :
            return httplib.NOT_FOUND, 'Operator not found or Rfid not assigned'

    def __SetErrorMonitor ( self, request, *args, **kwargs ) :
        OperatorId = request.POST.get('OperatorId', None)
        if (OperatorId == None) :
            return httplib.BAD_REQUEST, 'Operator ID is empty'
        TestPlanId = request.POST.get('TestPlanId', None)
        if (TestPlanId == None) :
            return httplib.BAD_REQUEST, 'Test Plan ID is empty'
        TestSuiteId = request.POST.get('TestSuiteId', None)
        if (TestSuiteId == None) :
            return httplib.BAD_REQUEST, 'Test Suites ID is empty'
        MonitorRules = json.loads(request.POST.get('MonitorRules', []))
        if (MonitorRules == None) :
            return httplib.BAD_REQUEST, 'Monitor Rules data is empty'
        Number = request.POST.get('Number', None)
        if (Number == None) :
            return httplib.BAD_REQUEST, 'Error Monitor Type is empty'
        Operator = User.objects.filter(id = OperatorId).first()
        if (Operator and Operator.profile.Rfid) :
            LOG.info(type(Number))
            if (int(Number) == 1) :
                error_monitor = Csv_ErrorMonitor1(Operator.profile.Rfid, TestPlanId, TestSuiteId)
            elif (int(Number) == 2) :
                error_monitor = Csv_ErrorMonitor2(Operator.profile.Rfid, TestPlanId, TestSuiteId)
            else :
                return httplib.BAD_REQUEST, 'Error Monitor Type is invalid'
            error_monitor_data = []
            for rule in MonitorRules :
                data = error_monitor.CreateItem(**rule)
                error_monitor_data.append(data)
            error_monitor.SetData(error_monitor_data)
            return httplib.OK, error_monitor.GetData()
        else :
            return httplib.NOT_FOUND, 'Operator not found or Rfid not assigned'

    def __ParseBoardSettings ( self, request, *args, **kwargs ) :
        Data = request.POST.get('Data', None)
        if (Data is None) :
            return httplib.BAD_REQUEST, 'Board Setting content is not provided'
        # save new uploaded board settings to temp file then read it again.
        # we do this becasue we need to re-use the parsing function to ensure the uploaded data is valid
        try :
            ini_boardsetting = Ini_BoardSetting(request.user.profile.Rfid, 'tmp_board_settings')
            ini_boardsetting.SetContent(Data)
            resp_data = ini_boardsetting.GetContent()
            FileHelper.rm(ini_boardsetting.GetFilepath())
            return httplib.OK, resp_data
        except Exception as e:
            return httplib.BAD_REQUEST, 'Invalid Board Settings content'

    def __ExportBoardSettings ( self, request, *args, **kwargs ) :
        OperatorId = request.GET.get('OperatorId', None)
        if (OperatorId == None) :
            return HttpResponse(status = httplib.BAD_REQUEST, reason = 'Operator ID is empty')
        TestPlanId = request.GET.get('TestPlanId', None)
        if (TestPlanId == None) :
            return HttpResponse(status = httplib.BAD_REQUEST, reason = 'Test Plan ID is empty')
        Operator = User.objects.filter(id = OperatorId).first()
        if (Operator and Operator.profile.Rfid) :
            board_ini = Ini_BoardSetting(Operator.profile.Rfid, TestPlanId)
            response = HttpResponse(board_ini.GetContent(), content_type = 'application/x-download')
            response['Content-Disposition'] = 'attachment; filename=%s' % FileHelper.extract_filename(board_ini.GetFilepath())
            return response
        else :
            return HttpResponse(status = httplib.NOT_FOUND, reason = 'Operator not found or Rfid not assigned')

    def __ParseTestSteps ( self, request, *args, **kwargs ) :
        OperatorId = request.POST.get('OperatorId', None)
        if (OperatorId == None) :
            return httplib.BAD_REQUEST, 'Operator ID is empty'
        Data = request.POST.get('Data', [])
        if (Data == None) :
            return httplib.BAD_REQUEST, 'Test Steps data is empty'
        CfgNumber = request.POST.get('CfgNumber', None)
        if (CfgNumber == None) :
            return httplib.BAD_REQUEST, 'Test Configuration Type is empty'
        Operator = User.objects.filter(id = OperatorId).first()
        if (Operator and Operator.profile.Rfid) :
            if (int(CfgNumber) == 1) :
                test_steps = Csv_TestConfiguration1(Operator.profile.Rfid, 'TestPlanTmp', 'TestSuiteTmp')
            elif (int(CfgNumber) == 2) :
                test_steps = Csv_TestConfiguration2(Operator.profile.Rfid, 'TestPlanTmp', 'TestSuiteTmp')
            else :
                return httplib.BAD_REQUEST, 'Test Configuration Type is invalid'
            try:
                test_steps.SetContent(Data)
                resp_data = test_steps.GetData()
                FileHelper.rmdir_r(FileHelper.extract_filepath(test_steps.GetFilepath()))
                return httplib.OK, resp_data
            except Exception as e:
                return httplib.BAD_REQUEST, 'Bad file format'
        else :
            return httplib.NOT_FOUND, 'Operator not found or Rfid not assigned'
