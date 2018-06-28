from django.http import HttpResponse
from django.shortcuts import render
from django.contrib.auth.views import LoginView

class LoginPage ( LoginView ) :
    template_name = "login.html"
