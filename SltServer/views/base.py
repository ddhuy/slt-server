import time, httplib

from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.http import HttpResponse, JsonResponse
from django.views.generic import TemplateView
from rest_framework.renderers import JSONRenderer

from SltServer.logger import *

class BasePage ( LoginRequiredMixin, TemplateView ) :
    def __init__ ( self ) :
        self._funcdict = {}
        self._JSONRenderer = JSONRenderer()

    def post ( self, request, *args, **kwargs ) :
        req_action = request.POST.get('Action', '')
        for action in self._funcdict :
            if (action == req_action) :
                s = time.clock()
                http_resp, post_resp = self._funcdict[action](request, *args, **kwargs)
                e = time.clock()
                LOG.info('POST process time: %f', e - s)
                # json_resp = self._JSONRenderer.render(post_resp)
                return JsonResponse(status = http_resp, data = {'Data': post_resp})
        return JsonResponse(status = httplib.NOT_FOUND, data = {'Data': 'Request method not found'})