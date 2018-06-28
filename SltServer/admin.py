# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin
from django.utils.translation import ugettext_lazy

# Register your models here.
from .models import *
admin.site.register(Architecture)
admin.site.register(LotNumber)
admin.site.register(Profile)
admin.site.register(SltMode)
admin.site.register(TestCommand)
admin.site.register(TestMode)
admin.site.register(TestResultDetail)
admin.site.register(TestResult)

admin.site.index_title = ugettext_lazy('SLT')
admin.site.site_title = ugettext_lazy('Administration Site')
admin.site.site_header = ugettext_lazy('Administration Site')
