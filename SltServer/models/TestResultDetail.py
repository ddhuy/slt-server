from django.db import models

from .TestMode import TestMode
from .TestResult import TestResult

class TestResultDetail ( models.Model ) :
    TestResult = models.ForeignKey(TestResult, on_delete = models.CASCADE)
    Test = models.CharField(max_length = 255)
    Mode = models.CharField(max_length = 255, null = True, blank = True)
    Result = models.CharField(max_length = 255, null = True, blank = True)
    Pass = models.IntegerField(default = 0, null = True)
    Fail = models.IntegerField(default = 0, null = True)
    ExecutingTime = models.IntegerField(default = 0, null = True)

    class Meta:
        verbose_name = 'TestResultDetail'
        verbose_name_plural = 'TestResultDetails'

    def _str__ ( self ) :
        return "%s-%s" % (self._Test, self._Mode)
