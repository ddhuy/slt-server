from django.conf.urls import include, url

import SLT.settings
import views

urlpatterns = [
    url(r'^$', views.HomePage.as_view(), name = 'home'),
    url(r'^accounts/', include('django.contrib.auth.urls')),
]
