from django.conf.urls import include, url

import views

urlpatterns = [
    url(r'^$', views.HomePage.as_view(), name = 'home'),
    url(r'^accounts/', include('django.contrib.auth.urls')),
    url(r'^config/$', views.TestConfigPage.as_view(), name = 'config'),
    url(r'^config/(?P<rfid>\w+)/$', views.TestConfigPage.as_view(), name = 'config'),
    url(r'^command/$', views.TestCommandPage.as_view(), name = 'command'),
    url(r'^command/(?P<arch>\w+)/$', views.TestCommandPage.as_view(), name = 'command'),
    url(r'^lot/$', views.LotNumberPage.as_view(), name = 'lot_number'),
    url(r'^search/(?P<arch>\w+)/(?P<mode>\w+)/$', views.SearchPage.as_view(), name = 'search'),
]