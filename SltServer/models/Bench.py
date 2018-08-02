from django.db import models
from django.contrib.auth.models import User

from SltServer.models import Architecture

class Bench ( models.Model ) :
    Architecture = models.ForeignKey(Architecture)
    Number = models.IntegerField(null = True, blank = True)
    Name = models.CharField(max_length = 255, null = True, blank = True)
    BoardSerial = models.CharField(max_length = 255, null = True, blank = True)
    SocketSerial = models.CharField(max_length = 255, null = True, blank = True)
    Operator = models.ForeignKey(User, null = True, blank = True)
    MacAddress = models.CharField(max_length = 255, null = True, blank = True)
    IpAddress = models.CharField(max_length = 255, null = True, blank = True)
    Status = models.CharField(max_length = 255, null = True, blank = True)
    HardwareInfo = models.TextField(null = True, blank = True)

    class Meta:
        verbose_name = 'Bench'
        verbose_name_plural = 'Benches'

    def __str__ ( self ) :
        return "%s" % self.Name
