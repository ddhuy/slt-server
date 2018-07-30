import httplib, json

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render

from django.contrib.auth.models import User
from SltServer.models import Architecture, TestCommand, TestMode
from SltServer.logger import *
from SltServer.serializers import TestCommandSerializer
from SltServer.views import BasePage

class TestCommandPage ( BasePage ) :
    template_name = "command.html"

    # init POST controller functions
    def __init__ ( self ) :
        super(TestCommandPage, self).__init__()
        self._funcdict = {
            'DeleteCommand' : self.__DeleteCommand,
            'UpdateCommand' : self.__UpdateCommand,
        }

    def get ( self, request, *args, **kwargs ) :
        arch = Architecture.objects.filter(Name = kwargs['arch']).first()
        commands = TestCommand.objects.filter(Arch__id = arch.id)
        test_modes = TestMode.objects.all()
        return render(request, self.template_name, {'ArchName': arch.Name,'Commands': commands, 'TestModes': test_modes})

    def __InsertCommand ( self, request, *args, **kwargs ) :
        pass

    def __DeleteCommand ( self, request, *args, **kwargs ) :
        Id = request.POST.get('CommandId', None)
        if (Id == None) :
            return httplib.BAD_REQUEST, 'User must provide Command ID'
        Cmd = TestCommand.objects.filter(id = Id).first()
        if (Cmd) :
            Cmd.delete()
            return httplib.OK, TestCommandSerializer(Cmd).data
        return httplib.NOT_FOUND, 'Test Command ID not found'

    def __UpdateCommand ( self, request, *args, **kwargs) :
        Id = request.POST.get('CommandId', None)
        if (Id == None) :
            return httplib.BAD_REQUEST, 'User must provide Command ID'
        Data = json.loads(request.POST.get('Data', None))
        if (Data == None) :
            return httplib.BAD_REQUEST, 'Command Data is empty'
        Cmd = TestCommand.objects.filter(id = Id).first()
        if (Cmd) :
            Cmd.Test = Data['Test']
            Cmd.Mode = TestMode.objects.get(id = int(Data['Mode']))
            Cmd.FailStop = int(Data['FailStop'])
            Cmd.Timeout = int(Data['Timeout'])
            Cmd.Prompt = Data['Prompt']
            Cmd.Command = Data['Command']
            Cmd.Pass = Data['Pass']
            Cmd.Fail = Data['Fail']
            Cmd.Msg = Data['Msg']
            Cmd.Comment = Data['Comment']
            LOG.info(Cmd)
            Cmd.save()
            return httplib.OK, TestCommandSerializer(Cmd).data
        return httplib.NOT_FOUND, 'Test Command ID not found'
