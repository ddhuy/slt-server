import os, httplib

from django.core.files.storage import FileSystemStorage
from django.http import JsonResponse
from django.shortcuts import render

from SltServer.logger import *
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
            # 'GetUserInfo': self.__GetUserInfo,

            # 'SetBenchInfo': self.__SetBenchInfo,

            # 'UpdateTestResult': self.__UpdateTestResult,
            # 'UpdateBenchEvent': self.__UpdateBenchEvent,
            # 'UpdateBoardStatus': self.__UpdateBoardStatus,

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


    def __UploadLogFile ( self, request, *args, **kwargs ) :
        LogFile = request.FILES['LogFile']
        Rfid = request.POST.get('Rfid', None)
        if ((Rfid is None) or (LogFile is None)) :
            return httplib.BAD_REQUEST, 'UploadLogFile request needs File & Rfid'
        LogFilePath = getLogFilePath(Rfid, LogFile.name)
        return httplib.OK, FileSystemStorage().save(LogFilePath, LogFile)
