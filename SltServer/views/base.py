from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.http import HttpResponse, JsonResponse
from django.views.generic import TemplateView

class BasePage ( LoginRequiredMixin, TemplateView ) :
    def post ( self, request, *args, **kwargs ) :
        req_action = request.POST.get('Action', '')
        for action in self._funcdict :
            print(action, req_action)
            if (action == req_action) :
                return self._funcdict[action](request, *args, **kwargs)
        return JsonResponse(status = 404, data = {'errno': 404,'Message': 'Request method not found'})