from django.db import models
from django.utils import timezone

from .Profile import Profile
from .LotNumber import LotNumber
from .SltMode import SltMode

class TestResult ( models.Model ) :
    DUT_MODES = (
        ('N', 'nosgmii'),
        ('F', 'fullsgmii'),
    )

    ECID1 = models.CharField(max_length = 255)
    ECID2 = models.CharField(max_length = 255)
    ECID3 = models.CharField(max_length = 255)
    ECID4 = models.CharField(max_length = 255)
    CPUID = models.CharField(max_length = 255)
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
