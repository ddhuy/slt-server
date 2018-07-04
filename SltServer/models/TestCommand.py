from django.db import models

from .Architecture import Architecture
from .TestMode import TestMode

class TestCommand ( models.Model ) :
    Test = models.CharField(max_length = 255)
    Mode = models.ForeignKey(TestMode)
    FailStop = models.BooleanField(default = False)
    Command = models.TextField(null = True, blank = True)
    Prompt = models.TextField(null = True, blank = True)
    Pass = models.TextField(null = True, blank = True)
    Fail = models.TextField(null = True, blank = True)
    Timeout = models.IntegerField(null = True, blank = True)
    Msg = models.TextField(null = True, blank = True)
    Comment = models.TextField(null = True, blank = True)
    Arch = models.ForeignKey(Architecture)

    class Meta:
        verbose_name = 'TestCommand'
        verbose_name_plural = 'TestCommands'

    def __str__ ( self ) :
        return "%s-%s" % (self.Arch.Name, self.Test)
