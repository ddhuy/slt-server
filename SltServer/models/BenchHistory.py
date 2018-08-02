from django.db import models
from django.contrib.auth.models import User

from SltServer.models import Bench

class BenchHistory ( models.Model ) :
    Bench = models.ForeignKey(Bench, related_name = 'Histories')
    EventId = models.IntegerField(null = True, blank = True)
    Description = models.TextField(null = True, blank = True)
    Datetime = models.DateTimeField(auto_now_add = True)

    class Meta:
        verbose_name = 'BenchHistory'
        verbose_name_plural = 'BencheHistories'

    def __str__ ( self ) :
        return "%s:%d" % (self.Bench.Name, self.EventId)
