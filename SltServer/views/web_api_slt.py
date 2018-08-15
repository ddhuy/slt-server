import os, httplib

from django.contrib.auth.models import User
from django.core.files.storage import FileSystemStorage
from django.http import JsonResponse
from django.shortcuts import render, redirect

from SltServer.models import *
from SltServer.models.ConfigurationFile import *
from SltServer.logger import *
from SltServer.serializers import *
from SltServer.settings import *
from SltServer.utils import *
from SltServer.views import BasePageNoAuth

SLT_LOG_FILE_PATH = 'Logs/Clients'
PLATFORM = 'SLT'

def getLogFilePath ( Rfid, Filename ) :
    return os.path.join(SLT_LOG_FILE_PATH, Rfid, Filename)

class WebApi_SLT ( BasePageNoAuth ) :
    template_name = "web_api.html"

    def __init__ ( self ) :
        super(WebApi_SLT, self).__init__()
        self._funcdict = {
            'ClearBoardAction': self.__ClearBoardAction,

            'GetSoftwareInfo': self.__GetSoftwareInfo,
            'GetBenchInfo': self.__GetBenchInfo,
            'SetBenchInfo': self.__SetBenchInfo,

            'UpdateTestResult': self.__UpdateTestResult,
            'UpdateBenchEvent': self.__UpdateBenchEvent,
            'UpdateBenchStatus': self.__UpdateBenchStatus,

            'UploadTestLog': self.__UploadTestLog,

            'GetBoardListContent' : self.__GetBoardListContent,
            'GetBoardIniContent' : self.__GetBoardIniContent,
            'GetTestConfigContent': self.__GetTestConfigContent,
        }

    def get ( self, request, *args, **kwargs ) :
        return redirect('api')

    def __ClearBoardAction ( self, request, *args, **kwargs ) :
        pass

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

    def __UpdateTestResult ( self, request, *args, **kwargs) :
        test_result = TestResult.ParseRequest(request)
        return httplib.OK, 

    def __UploadTestLog ( self, request, *args, **kwargs ) :
        TestLog = request.FILES['TestLog']
        Rfid = request.POST.get('Rfid', None)
        if ((Rfid is None) or (TestLog is None)) :
            return httplib.BAD_REQUEST, 'UploadTestLog request needs Rfid & Log File'
        LogFilePath = getLogFilePath(Rfid, TestLog.name)
        return httplib.OK, FileSystemStorage().save(LogFilePath, TestLog)

    def __SetBenchInfo ( self, request, *args, **kwargs ) :
        MacAddress = request.POST.get('MacAddress', None)
        if (MacAddress is None) :
            return httplib.BAD_REQUEST, 'Mac Address is not provided'
        
        bench = Bench.objects.filter(MacAddress = MacAddress).first()
        if (bench is None) :
            bench = Bench() # bench with provided MAC is not exist -> create it
        bench.MacAddress = MacAddress
        IpAddress = request.POST.get('IpAddress', None)
        if (IpAddress != None) :
            bench.IpAddress = IpAddress
        Rfid = request.POST.get('Rfid', None)
        if (Rfid) :
            bench.Operator = User.objects.get(profile__Rfid = Rfid)
        BenchName = request.POST.get('BenchName', None)
        if (BenchName != None) :
            bench.Name = BenchName
        BenchNumber = request.POST.get('BenchNumber', None)
        if (BenchNumber != None) :
            bench.Number = BenchNumber
        BoardSerial = request.POST.get('BoardSerial', None)
        if (BoardSerial != None) :
            bench.BoardSerial = BoardSerial
        SocketSerial = request.POST.get('SocketSerial', None)
        if (SocketSerial != None) :
            bench.SocketSerial = SocketSerial
        Status = request.POST.get('Status', None)
        if (Status != None) :
            bench.Status = Status
        ArchName = request.POST.get('ArchName', None)
        if (ArchName != None) :
            bench.Architecture = Architecture.objects.filter(Name = ArchName).first()
        HardwareInfo = request.POST.get('HardwareInfo', None)
        if (HardwareInfo != None) :
            bench.HardwareInfo = HardwareInfo
        bench.save()
        return httplib.OK, BenchSerializer(bench).data

    def __GetBenchInfo ( self, request, *args, **kwargs ) :
        MacAddress = request.POST.get('MacAddress', None)
        if (MacAddress is None) :
            return httplib.BAD_REQUEST, 'Mac Address is not provided'
        bench = Bench.objects.filter(MacAddress = MacAddress).first()
        if (bench is None) :
            return httplib.NOT_FOUND, 'Bench with provided MAC is not exist'
        return httplib.OK, BenchSerializer(bench).data

    def __UpdateBenchEvent ( self, request, *args, **kwargs ) :
        MacAddress = request.POST.get('MacAddress', None)
        if (MacAddress is None) :
            return httplib.BAD_REQUEST, 'Mac Address is not provided'
        bench = Bench.objects.filter(MacAddress = MacAddress).first()
        if (bench is None) :
            return httplib.NOT_FOUND, 'Bench with provided MAC is not exist'
        bench.Status = Bench.BENCH_STATUS_ONLINE
        bench.save()
        bench_history = BenchHistory()
        bench_history.Bench = bench
        bench_history.EventId = request.POST.get('EventId', None)
        bench_history.Description = request.POST.get('Description', None)
        bench_history.save()
        return httplib.OK, BenchHistorySerializer(bench_history).data

    def __GetSoftwareInfo ( self, request, *args, **kwargs ) :
        pass

    def __GetBBBReleaseInfo ( self, request, *args, **kwargs ) :
        pass

    def __GetBoardListContent ( self, request, *args, **kwargs ) :
        Rfid = request.POST.get('Rfid', None)
        if (Rfid is None) :
            return httplib.BAD_REQUEST, 'Rfid is not provided'
        ArchName = request.POST.get('ArchName', None)
        BoardList = Csv_BoardList(Rfid).GetData(ArchName)
        return httplib.OK, BoardList

    def __GetBoardIniContent ( self, request, *args, **kwargs ) :
        return self.__GetBoardListContent(request, *args, **kwargs)

    def __GetTestConfigContent ( self, request, *args, **kwargs ) :
        Rfid = request.POST.get('Rfid', None)
        if (Rfid is None) :
            return httplib.BAD_REQUEST, 'Rfid is not provided'
        TestPlanId = request.POST.get('TestId', None)
        if (TestPlanId is None) :
            return httplib.BAD_REQUEST, 'TestPlanId is not provided'

        TestConfigs = []
        for TestSuite in Csv_MenuDisplay(Rfid, TestPlanId).GetData() :
            Cfg = {
                'ID': TestSuite['ID'],
                'Display': TestSuite['display'],
                'Mode': TestSuite['mode'],
                'Enable': TestSuite['enable'],
            }
            CsvFile = Csv_TestConfiguration1(Rfid, TestPlanId, TestSuite['ID'])
            Cfg['MainData_Filename'] = FileHelper.extract_filename(CsvFile.GetFilepath())
            Cfg['MainData'] = CsvFile.GetContent()
            CsvFile = Csv_TestConfiguration2(Rfid, TestPlanId, TestSuite['ID'])
            Cfg['SecondData_Filename'] = FileHelper.extract_filename(CsvFile.GetFilepath())
            Cfg['SecondData'] = CsvFile.GetContent()
            CsvFile = Csv_ErrorMonitor1(Rfid, TestPlanId, TestSuite['ID'])
            Cfg['Error1_Filename'] = FileHelper.extract_filename(CsvFile.GetFilepath())
            Cfg['ErrorData1'] = CsvFile.GetContent()
            CsvFile = Csv_ErrorMonitor2(Rfid, TestPlanId, TestSuite['ID'])
            Cfg['Error2_Filename'] = FileHelper.extract_filename(CsvFile.GetFilepath())
            Cfg['ErrorData2'] = CsvFile.GetContent()
            TestConfigs.append(Cfg)
        return httplib.OK, TestConfigs
