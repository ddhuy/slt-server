import httplib, json

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.views.generic import TemplateView

from django.contrib.auth.models import User
from SltServer.models import Architecture, Bench
from SltServer.logger import *
from SltServer.serializers import BenchSerializer

class WebApiPage ( TemplateView ) :
    template_name = "web_api.html"

    def __init__ ( self ) :
        super(WebApiPage, self).__init__()
        self._funcdict = {
            # 'ClearBoardAction': self.__ClearBoardAction,

            # 'GetBoardConfig': self.__GetBoardConfig,
            # 'GetBoardInfo': self.__GetBoardInfo,
            # 'GetServerInfo': self.__GetServerInfo,
            # 'GetSoftwareInfo': self.__GetSoftwareInfo,
            # 'GetTestConfig': self.__GetTestConfig,
            # 'GetUserInfo': self.__GetUserInfo,

            # 'SetBenchInfo': self.__SetBenchInfo,

            # 'UpdateTestResult': self.__UpdateTestResult,
            # 'UpdateBenchEvent': self.__UpdateBenchEvent,
            # 'UpdateBoardStatus': self.__UpdateBoardStatus,

            # 'UploadTestLog': self.__UploadTestLog,
            # 'UploadFile': self.__UploadFile,
        }

    def get ( self, request, *args, **kwargs ) :
        return render(request, self.template_name)