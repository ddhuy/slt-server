from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone

from rest_framework import serializers

from .Architecture import Architecture
from .LotNumber import LotNumber
from .SltMode import SltMode

class TestResult ( models.Model ) :
    DUT_MODE_FULL_SGMII = 'F'
    DUT_MODE_NO_SGMII = 'N'
    DUT_MODES = (
        (DUT_MODE_FULL_SGMII, 'fullsgmii'),
        (DUT_MODE_NO_SGMII, 'nosgmii'),
    )

    ECID1 = models.CharField(max_length = 255, default = '', blank = True, null = True)
    ECID2 = models.CharField(max_length = 255, default = '', blank = True, null = True)
    ECID3 = models.CharField(max_length = 255, default = '', blank = True, null = True)
    ECID4 = models.CharField(max_length = 255, default = '', blank = True, null = True)
    CPUID = models.CharField(max_length = 255, default = '', blank = True, null = True)
    LotNumber = models.CharField(max_length= 255, blank = True, null = True)
    BenchNumber = models.CharField(max_length = 255, blank = True, null = True)
    TestName = models.CharField(max_length = 255, blank = True, null = True)
    DutMode = models.CharField(max_length = 255, choices = DUT_MODES, blank = True, null = True)
    SltMode = models.ForeignKey(SltMode, blank = True, null = True, related_name = 'SltMode')
    Result = models.CharField(max_length = 255, blank = True, null = True)
    Operator = models.ForeignKey(User, blank = True, null = True, related_name = 'Operator')
    Rfid = models.IntegerField(blank = True, null = True)
    BoardSerial = models.CharField(max_length = 255, blank = True, null = True)
    SocketSerial = models.CharField(max_length = 255, blank = True, null = True)
    ExecutionDate = models.DateTimeField(auto_now_add = True, blank = True, null = True)
    LogFilePath = models.CharField(max_length = 255, blank = True, null = True)
    Description = models.CharField(max_length = 255, blank = True, null = True)
    TestEnvironments = models.TextField(null = True, blank = True)
    Arch = models.ForeignKey(Architecture, blank = True, null = True, related_name = 'Arch')

    class Meta:
        verbose_name = 'TestResult'
        verbose_name_plural = 'TestResults'

    def __str__ ( self ) :
        disp_str = ''
        if (self.Arch.Name == Architecture.ARCH_SKYLARK) :
            disp_str = '[%s-%d] %s-%s-%s' % (self.Arch.Name, self.id, self.ECID1, self.ECID2, self.CPUID)
        elif (self.Arch.Name == Architecture.ARCH_STORM) :
            disp_str = '[%s-%d] %s-%s-%s-%s' % (self.Arch.Name, self.id, self.ECID1, self.ECID2, self.ECID3, self.ECID4)
        else :
            disp_str = 'Unknown CPU Architecture'
        return disp_str

    @classmethod 
    def GetTestResult ( cls, arch_name, summ_mode, search_req ) :
        pass













