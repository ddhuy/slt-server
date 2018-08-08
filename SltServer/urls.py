from django.conf.urls import include, url

import views

urlpatterns = [
    url(r'^$', views.HomePage.as_view(), name = 'home'),
    url(r'^accounts/registration', views.RegistrationPage.as_view(), name = 'registration'),
    url(r'^accounts/', include('django.contrib.auth.urls')),
    url(r'^api/$', views.WebApiPage.as_view(), name = 'web_api'),
    url(r'^bench/', views.BenchMonitorPage.as_view(), name = 'bench'),
    url(r'^config/$', views.TestConfigPage.as_view(), name = 'config'),
    url(r'^config/(?P<rfid>\w+)/$', views.TestConfigPage.as_view(), name = 'config'),
    url(r'^command/$', views.TestCommandPage.as_view(), name = 'command'),
    url(r'^command/(?P<arch>\w+)/$', views.TestCommandPage.as_view(), name = 'command'),
    url(r'^lot/$', views.LotNumberPage.as_view(), name = 'lot_number'),
    url(r'^summary/(?P<arch>\w+)/(?P<mode>\w+)/$', views.SummaryPage.as_view(), name = 'summary'),
]