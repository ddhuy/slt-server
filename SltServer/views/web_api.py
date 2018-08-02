import os, httplib

from django.contrib.auth.models import User
from django.core.files.storage import FileSystemStorage
from django.http import JsonResponse
from django.shortcuts import render

from SltServer.models import Bench
from SltServer.logger import *
from SltServer.serializers import BenchSerializer, UserSerializer
from SltServer.settings import *
from SltServer.utils import *
from SltServer.views import BasePageNoAuth

SLT_LOG_FILE_PATH = 'Logs/Clients'

def getLogFilePath ( Rfid, Filename ) :
    return os.path.join(SLT_LOG_FILE_PATH, Rfid, Filename)

class WebApiPage ( BasePageNoAuth ) :
    template_name = "web_api.html"

    def __init__ ( self ) :
        super(WebApiPage, self).__init__()
        self._funcdict = {
            # 'ClearBoardAction': self.__ClearBoardAction,

            # 'GetBoardConfig': self.__GetBoardConfig,
            # 'GetBoardInfo': self.__GetBoardInfo,
            'GetServerInfo': self.__GetServerInfo,
            # 'GetSoftwareInfo': self.__GetSoftwareInfo,
            # 'GetTestConfig': self.__GetTestConfig,
            'GetUserInfo': self.__GetUserInfo,

            # 'SetBenchInfo': self.__SetBenchInfo,

            # 'UpdateTestResult': self.__UpdateTestResult,
            # 'UpdateBenchEvent': self.__UpdateBenchEvent,
            'UpdateBenchStatus': self.__UpdateBenchStatus,

            'UploadLogFile': self.__UploadLogFile,
        }

    def get ( self, request, *args, **kwargs ) :
        return render(request, self.template_name)

    def __GetServerInfo ( self, request, *args, **kwargs ) :
        server_info = {
            'Version': ("%s.%s.%s" % (SLT_MAJOR_VERSION, SLT_MINOR_VERSION, SLT_REVISION_NUMBER)),
            'Timezone': get_system_timezone(),
        }
        return httplib.OK, server_info

    def __GetUserInfo ( self, request, *args, **kwargs ) :
        Rfid = request.POST.get('Rfid', None)
        if (Rfid is None) :
            return httplib.BAD_REQUEST, 'Unknown Rfid'
        operator = User.objects.get(profile__Rfid = Rfid)
        return httplib.OK, UserSerializer(operator).data

    def __UpdateBenchStatus ( self, request, *args, **kwargs ) :
        MacAddress = request.POST.get('MacAddress', None)
        if (MacAddress is None) :
            return httplib.BAD_REQUEST, 'Unknown MAC Address'
        Status = request.POST.get('Status', None)
        if (Status is None) :
            return httplib.BAD_REQUEST, 'Unknown Bench Status'
        bench = Bench.objects.get(MacAddress = MacAddress)
        bench.Status = Status
        bench.save()
        return httplib.OK, BenchSerializer(bench).data

    def __UploadLogFile ( self, request, *args, **kwargs ) :
        LogFile = request.FILES['LogFile']
        Rfid = request.POST.get('Rfid', None)
        if ((Rfid is None) or (LogFile is None)) :
            return httplib.BAD_REQUEST, 'UploadLogFile request needs File & Rfid'
        LogFilePath = getLogFilePath(Rfid, LogFile.name)
        return httplib.OK, FileSystemStorage().save(LogFilePath, LogFile)
