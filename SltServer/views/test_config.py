import os, csv
import json, httplib
import ConfigParser

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render

from django.contrib.auth.models import User

from SltServer.models.ConfigurationFile import *
from SltServer.logger import *
from SltServer.views import BasePage


class TestConfigPage ( BasePage ) :
    template_name = "test_config.html"

    # init POST controller functions
    def __init__ ( self ) :
        super(TestConfigPage, self).__init__()
        self._funcdict = {
            'GenerateTestId' : self.__GenerateTestId,
            'SetTestPlan' : self.__SetTestPlan,
        }

    def get ( self, request, *args, **kwargs ) :
        operators = User.objects.all().order_by('username')
        return render(request, self.template_name, {'Operators': operators})

    def __GenerateTestId ( self, request, *args, **kwargs ) :
        Data = json.loads(request.POST.get('Data', {}))
        OperatorId = Data.get('OperatorId', None)
        if (OperatorId == None) :
            return httplib.BAD_REQUEST, 'Not provide Operator ID'
        new_id = Utils.generate_id()
        # TODO: verify the duplicating of new generated id
        return httplib.OK, new_id

    def __SetTestPlan ( self, request, *args, **kwargs ) :
        Data = json.loads(request.POST.get('Data', None))
        if (Data == None) :
            return httplib.BAD_REQUEST, 'Request Data is empty'
        OperatorId = Data.get('OperatorId', None)
        if (OperatorId == None) :
            return httplib.BAD_REQUEST, 'Operator ID is empty'
        TestPlans = Data.get('TestPlans', None)
        if (TestPlans == None) :
            return httplib.BAD_REQUEST, 'Test Plans is empty'
        LOG.info(OperatorId)
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

