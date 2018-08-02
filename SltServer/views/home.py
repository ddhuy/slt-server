from django.shortcuts import render

from SltServer.settings import *
from SltServer.views import BasePage

class HomePage ( BasePage ) :
    template_name = "home.html"

    def get ( self, request ) :
        return render(  request,
                        self.template_name,
                        {
                            'MAJOR_VERSION': SLT_MAJOR_VERSION,
                            'MINOR_VERSION': SLT_MINOR_VERSION,
                            'REVISION': SLT_REVISION_NUMBER
                        })