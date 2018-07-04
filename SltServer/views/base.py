from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.http import HttpResponse, JsonResponse
from django.views.generic import TemplateView

class BasePage ( LoginRequiredMixin, TemplateView ) :
    def __init__ ( self ) :
        self._funcdict = {}

    def post ( self, request, *args, **kwargs ) :
        req_action = request.POST.get('Action', '')
        for action in self._funcdict :
            if (action == req_action) :
                return self._funcdict[action](request)
        return JsonResponse(status = 404, data = {'error_msg': 'Request method not found'})