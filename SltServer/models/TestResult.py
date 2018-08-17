import collections, bisect, ast

from django.contrib.auth.models import User
from django.db import models
from django.db.models import Count, Q
from django.utils import timezone

from .Architecture import Architecture
from .LotNumber import LotNumber
from .SltMode import SltMode

from SltServer.logger import *



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
    LotNumber = models.ForeignKey(LotNumber, blank = True, null = True)
    BenchNumber = models.CharField(max_length = 255, blank = True, null = True)
    TestName = models.CharField(max_length = 255, blank = True, null = True)
    DutMode = models.CharField(max_length = 255, choices = DUT_MODES, blank = True, null = True)
    SltMode = models.ForeignKey(SltMode, blank = True, null = True, related_name = 'SltMode')
    Result = models.CharField(max_length = 255, blank = True, null = True)
    Operator = models.ForeignKey(User, blank = True, null = True, related_name = 'Operator')
    Rfid = models.IntegerField(blank = True, null = True)
    BoardSerial = models.CharField(max_length = 255, blank = True, null = True)
    SocketSerial = models.CharField(max_length = 255, blank = True, null = True)
    ExecutionDate = models.DateTimeField(auto_now_add = True)
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
            disp_str = '[%s-%s] %s-%s-%s' % (self.Arch.Name, self.id, self.ECID1, self.ECID2, self.CPUID)
        elif (self.Arch.Name == Architecture.ARCH_STORM) :
            disp_str = '[%s-%s] %s-%s-%s-%s' % (self.Arch.Name, self.id, self.ECID1, self.ECID2, self.ECID3, self.ECID4)
        else :
            disp_str = 'Unknown CPU Architecture'
        return disp_str

    # Parsing PartId to ECID & CPUID.
    # PartId pattern: [ECID1-ECID2-]CPUID
    #
    # PartId regrex examples:
    #   0x113-, 0x113--, 0x113-*, 0x113-*-*
    #   -> ECID1
    #
    #   -0x114-, -0x114-, *-0x114-*
    #   -> ECID2
    #
    #   115, -115, --115, *-115, *-*-115
    #   -> CPUID
    #
    #   0x113-0x114-115
    #   -> ECID1, ECID2 & CPUID
    @classmethod
    def parse_skylark_partid ( cls, search_req, partid ) :
        ids = list(reversed(partid.split('-')))
        if (len(ids) >= 1 and (ids[0] != '' or ids[0] != '*')) :
            search_req['CPUID'].append(ids[0])
        if (len(ids) >= 2 and (ids[1] != '' or ids[1] != '*')) :
            search_req['ECID2'].append(ids[1])
        if (len(ids) >= 3 and (ids[2] != '' or ids[2] != '*')) :
            search_req['ECID1'].append(ids[2])
        return search_req

    @classmethod
    def parse_storm_partid ( cls, search_req, partid ) :
        ids = partid.split('-')
        if (len(ids) >= 1 and (ids[0] != '' or ids[0] != '*')) :
            search_req['ECID1'].append(ids[0])
        if (len(ids) >= 2 and (ids[1] != '' or ids[1] != '*')) :
            search_req['ECID2'].append(ids[1])
        if (len(ids) >= 3 and (ids[2] != '' or ids[2] != '*')) :
            search_req['ECID3'].append(ids[2])
        if (len(ids) >= 4 and (ids[2] != '' or ids[2] != '*')) :
            search_req['ECID4'].append(ids[3])
        return search_req


    @classmethod
    def CollectTestEnvironments ( cls, arch_name ) :
        ls_testresults = cls.objects.filter(Arch = Architecture.objects.get(Name = arch_name.lower()).id)
        ls_testresults = ls_testresults.filter(~Q(TestEnvironments = None)).values('TestEnvironments')
        test_envs = {}
        for test_result in ls_testresults:
            try:
                env = ast.literal_eval(test_result['TestEnvironments'])
                for k, v in env.iteritems() :
                    if (not test_envs.has_key(k.strip())) :
                        test_envs[k.strip()] = [v.strip()]
                    elif (v.strip() not in test_envs[k.strip()]) :
                        bisect.insort(test_envs[k.strip()], v.strip())
            except Exception as e:
                LOG.exception("Cannot convert test environment: ", e)
        return collections.OrderedDict(sorted(test_envs.items(), key = lambda t: t[0]))

    @classmethod
    def ToSearchRequest ( cls, arch_name, in_data ) :
        search_req = in_data
        if (in_data.get('PartId', 0)) :
            search_req['CPUID'] = []
            search_req['ECID1'] = search_req['ECID2'] = search_req['ECID3'] = search_req['ECID4'] = []
            for partid in in_data['PartId'] :
                if (arch_name.lower() == Architecture.ARCH_SKYLARK.lower()) :
                    parse_skylark_partid(search_req, partid)
                elif (arch_name.lower() == Architecture.ARCH_STORM.lower()) :
                    parse_storm_partid(search_req, partid)
        if (in_data.get('Result', 0)) :
            search_req['FailSign'] = []
            for i in xrange(0, len(in_data['Result'])) :
                if ((in_data['Result'][i].lower() == 'pass') or (in_data['Result'][i].lower() == 'fail')) :
                    search_req.Result = in_data['Result'][i].upper()
                else :
                    search_req['FailSign'].append(in_data['Result'][i])
        return search_req

    @classmethod
    def GetTestResult ( cls, arch_name, summ_mode, search_req ) :
        ls_testresults = cls.objects.filter(Arch = Architecture.objects.get(Name = arch_name.lower()).id)
        if (search_req.get('ECID1', 0) and len(search_req['ECID1']) > 0) :
            ls_testresults = ls_testresults.filter(ECID1__in = search_req['ECID1'])
        if (search_req.get('ECID2', 0) and len(search_req['ECID2']) > 0) :
            ls_testresults = ls_testresults.filter(ECID2__in = search_req['ECID2'])
        if (search_req.get('ECID3', 0) and len(search_req['ECID3']) > 0) :
            ls_testresults = ls_testresults.filter(ECID3__in = search_req['ECID3'])
        if (search_req.get('ECID4', 0) and len(search_req['ECID4']) > 0) :
            ls_testresults = ls_testresults.filter(ECID4__in = search_req['ECID4'])
        if (search_req.get('CPUID', 0) and len(search_req['CPUID']) > 0) :
            ls_testresults = ls_testresults.filter(CPUID__in = search_req['CPUID'])
        if (search_req.get('LotNumber', 0) and len(search_req['LotNumber']) > 0) :
            ls_testresults = ls_testresults.filter(LotNumber__in = search_req['LotNumber'])
        if (search_req.get('BenchNumber', 0) and len(search_req['BenchNumber']) > 0) :
            ls_testresults = ls_testresults.filter(BenchNumber__in = search_req['BenchNumber'])
        if (search_req.get('TestName', 0) and len(search_req['TestName']) > 0) :
            ls_testresults = ls_testresults.filter(TestName__in = search_req['TestName'])
        if (search_req.get('SocketSerial', 0) and len(search_req['SocketSerial']) > 0) :
            ls_testresults = ls_testresults.filter(SocketSerial__in = search_req['SocketSerial'])
        if (search_req.get('BoardSerial', 0) and len(search_req['BoardSerial']) > 0) :
            ls_testresults = ls_testresults.filter(BoardSerial__in = search_req['BoardSerial'])
        if (search_req.get('TestEnvironments', 0) and len(search_req['TestEnvironments']) > 0) :
            ls_testresults = ls_testresults.filter(TestEnvironments__in = search_req['TestEnvironments'])
        if (search_req.get('Result', 0)) :
            ls_testresults = ls_testresults.filter(Result = search_req['Result'])
        if (search_req.get('FailSign', 0) and len(search_req['FailSign']) > 0) :
            ls_testresults = ls_testresults.filter(Description__in = search_req['FailSign'])
        if (search_req.get('Operator', 0) and len(search_req['Operator']) > 0) :
            ls_testresults = ls_testresults.filter(Operator__in = search_req['Operator'])

        if (SltMode.GetID(summ_mode) == SltMode.SLT_MODE_PROD) :
            ls_testresults = ls_testresults.filter(SltMode = SltMode.SLT_MODE_PROD)
        elif (search_req.get('SltMode', 0)) :
            ls_testresults = ls_testresults.filter(SltMode = search_req['SltMode'])
        else :
            ls_testresults = ls_testresults.filter(~Q(SltMode = SltMode.SLT_MODE_PROD))

        if (search_req.get('From', 0)) :
            ls_testresults = ls_testresults.filter(ExecutionDate__gte = search_req['From'])
        if (search_req.get('To', 0)) :
            ls_testresults = ls_testresults.filter(ExecutionDate__lte = search_req['To'])

        if (SltMode.GetID(summ_mode) == SltMode.SLT_MODE_PROD) :
            ls_testresults.query.group_by = ['CPUID', 'SltMode', 'TestName', 'LotNumber']
            # ls_testresults = ls_testresults.annotate(NoRun = Count('CPUID'))
        ls_testresults = ls_testresults.order_by('CPUID')
        ls_testresults = ls_testresults.order_by('-ExecutionDate')

        return ls_testresults
