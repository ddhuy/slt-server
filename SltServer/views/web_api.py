import os, httplib

from django.contrib.auth.models import User
from django.core.files.storage import FileSystemStorage
from django.http import JsonResponse
from django.shortcuts import render

from SltServer.models import Bench
from SltServer.logger import *
from SltServer.serializers import BenchSerializer, UserSerializer
from SltServer.settings import *
from SltServer.utils import *
from SltServer.views import BasePageNoAuth

class WebApiPage ( BasePageNoAuth ) :
    template_name = "web_api.html"

    def __init__ ( self ) :
        super(WebApiPage, self).__init__()
        self._funcdict = {
            'GetServerInfo': self.__GetServerInfo,
            'GetUserInfo': self.__GetUserInfo,
        }

    def get ( self, request, *args, **kwargs ) :
        return render(request, self.template_name)

    def __GetServerInfo ( self, request, *args, **kwargs ) :
        server_info = {
            'Version': ("%s.%s.%s" % (SLT_MAJOR_VERSION, SLT_MINOR_VERSION, SLT_REVISION_NUMBER)),
            'Timezone': get_system_timezone(),
        }
        return httplib.OK, server_info

    def __GetUserInfo ( self, request, *args, **kwargs ) :
        Rfid = request.POST.get('Rfid', None)
        if (Rfid is None) :
            return httplib.BAD_REQUEST, 'Rfid is not provided'
        try :
            operator = User.objects.get(profile__Rfid = Rfid)
            return httplib.OK, UserSerializer(operator).data
        except :
            return httplib.NOT_FOUND, 'Could not find User with Rfid %s' % Rfid