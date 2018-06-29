from django.db import models
from django.utils import timezone

from .Architecture import Architecture
from .LotNumber import LotNumber
from .Profile import Profile
from .SltMode import SltMode

class TestResult ( models.Model ) :
    DUT_MODES = (
        ('F', 'fullsgmii'),
        ('N', 'nosgmii'),
    )

    ECID1 = models.CharField(max_length = 255, default = '', blank = True, null = True)
    ECID2 = models.CharField(max_length = 255, default = '', blank = True, null = True)
    ECID3 = models.CharField(max_length = 255, default = '', blank = True, null = True)
    ECID4 = models.CharField(max_length = 255, default = '', blank = True, null = True)
    CPUID = models.CharField(max_length = 255, default = '', blank = True, null = True)
    Arch = models.ForeignKey(Architecture)
    TestName = models.CharField(max_length = 255)
    LotNumber = models.ForeignKey(LotNumber)
    BenchNumber = models.CharField(max_length = 255)
    BoardSerial = models.CharField(max_length = 255)
    SocketSerial = models.CharField(max_length = 255)
    SltMode = models.ForeignKey(SltMode)
    DutMode = models.CharField(max_length = 255, choices = DUT_MODES, default = '', blank = True, null = True)
    Result = models.CharField(max_length = 255)
    Operator = models.ForeignKey(Profile)
    Rfid = models.IntegerField()
    ExecutionDate = models.DateTimeField(auto_now_add = True)
    LogFilePath = models.CharField(max_length = 255)
    TestEnvironments = models.TextField(null = True, blank = True)
    Description = models.CharField(max_length = 255)

    class Meta:
        verbose_name = 'TestResult'
        verbose_name_plural = 'TestResults'

    def __str__ ( self ) :
        disp_str = ''
        if (self.Arch.Name == Architecture.ARCH_SKYLARK) :
            disp_str = '%s-%s-%s' % (self.ECID1, self.ECID2, self.CPUID)
        elif (self.Arch.Name == Architecture.ARCH_STORM) :
            disp_str = '%s-%s-%s-%s' % (self.ECID1, self.ECID2, self.ECID3, self.ECID4)
        else :
            disp_str = 'Unknown CPU Architecture'
        return disp_str
