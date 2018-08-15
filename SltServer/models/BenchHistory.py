from django.db import models
from django.contrib.auth.models import User

from SltServer.models import Bench


###################################
# BENCH event history description #
###################################
BENCH_EVT_SYSTEM_INIT   = 1
BENCH_EVT_USER_CHANGE   = 2
BENCH_EVT_CFG_INVALID   = 3
BENCH_EVT_STATUS_CHANGE = 4
BENCH_EVT_USER_INVALID  = 5
BENCH_EVT_BENCH_UPDATED = 6

BENCH_EVT_DESC = { BENCH_EVT_SYSTEM_INIT    : 'System Init',
                   BENCH_EVT_USER_CHANGE    : 'User Changed',
                   BENCH_EVT_CFG_INVALID    : 'Invalid Test Configuration',
                   BENCH_EVT_STATUS_CHANGE  : 'Connection changed',
                   BENCH_EVT_USER_INVALID   : 'Invalid User',
                   BENCH_EVT_BENCH_UPDATED  : 'Bench update', }

class BenchHistory ( models.Model ) :
    Bench = models.ForeignKey(Bench, related_name = 'Histories')
    EventId = models.IntegerField(null = True, blank = True)
    Description = models.TextField(null = True, blank = True)
    Datetime = models.DateTimeField(auto_now_add = True)

    class Meta:
        verbose_name = 'BenchHistory'
        verbose_name_plural = 'BenchHistories'

    def __str__ ( self ) :
        return "%s:%d" % (self.Bench.Name, self.EventId)
