import httplib, json

from django import forms
from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect
from django.views.generic import TemplateView

from SltServer.logger import *

class SignUpForm ( UserCreationForm ):
    first_name = forms.CharField(max_length = 30, required = False, help_text='Optional.')
    last_name = forms.CharField(max_length = 30, required = False, help_text='Optional.')
    email = forms.EmailField(max_length = 254, help_text = 'Required. Inform a valid email address.')

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'password1', 'password2', )

class RegistrationPage ( TemplateView ) :
    template_name = "registration/registration_form.html"

    # init POST controller functions
    def __init__ ( self ) :
        super(RegistrationPage, self).__init__()

    def get ( self, request, *args, **kwargs ) :
        return render(request, self.template_name)

    def post ( self, request, *args, **kwargs ) :
        form = SignUpForm(request.POST)
        if (form.is_valid()) :
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username = username, password = raw_password)
            login(request, user)
            return redirect('home')