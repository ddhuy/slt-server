from django.db import models

from .Architecture import Architecture
from .TestMode import TestMode

class TestCommand ( models.Model ) :
    Test = models.CharField(max_length = 255)
    Mode = models.ForeignKey(TestMode)
    FailStop = models.BooleanField(default = False)
    Command = models.TextField()
    Prompt = models.TextField()
    Pass = models.TextField()
    Fail = models.TextField()
    Timeout = models.IntegerField()
    Msg = models.TextField()
    Comment = models.TextField()
    Arch = models.ForeignKey(Architecture)

    class Meta:
        verbose_name = 'TestCommand'
        verbose_name_plural = 'TestCommands'

    def __str__ ( self ) :
        return "%s-%s" % (self.Test, self.Arch.Name)
