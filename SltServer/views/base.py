import time, httplib

from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.views.generic import TemplateView
from rest_framework.renderers import JSONRenderer

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from SltServer.logger import *

class BasePage ( LoginRequiredMixin, TemplateView ) :
    def __init__ ( self ) :
        self._funcdict = {}
        # self._JSONRenderer = JSONRenderer()

    def post ( self, request, *args, **kwargs ) :
        req_action = request.POST.get('Action', '')
        for action in self._funcdict :
            if (action == req_action) :
                s = time.clock()
                http_status, post_resp = self._funcdict[action](request, *args, **kwargs)
                e = time.clock()
                LOG.info('[%s][%d] time: %f', action, http_status, e - s)
                # json_resp = self._JSONRenderer.render(post_resp)
                return JsonResponse(status = http_status, data = {'Data': post_resp})
        return JsonResponse(status = httplib.NOT_FOUND, data = {'Data': 'Request method not found'})

@method_decorator(csrf_exempt, name='dispatch')
class BasePageNoAuth ( TemplateView ) :
    def __init__ ( self ) :
        self._funcdict = {}
        self._JSONRenderer = JSONRenderer()

    def post ( self, request, *args, **kwargs ) :
        req_action = request.POST.get('Action', '')
        for action in self._funcdict :
            if (action == req_action) :
                s = time.clock()
                http_status, post_resp = self._funcdict[action](request, *args, **kwargs)
                e = time.clock()
                LOG.info('[%s][%d] time: %f', action, http_status, e - s)
                # json_resp = self._JSONRenderer.render(post_resp)
                return JsonResponse(status = http_status, data = {'Data': post_resp})
        return JsonResponse(status = httplib.NOT_FOUND, data = {'Data': 'Request method not found'})
