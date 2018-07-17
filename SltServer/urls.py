from django.conf.urls import include, url

import views

urlpatterns = [
    url(r'^$', views.HomePage.as_view(), name = 'home'),
    url(r'^config/$', views.TestConfigPage.as_view(), name = 'test_config'),
    url(r'^search/(?P<arch>\w+)/(?P<mode>\w+)/$', views.SearchPage.as_view(), name = 'search'),
    url(r'^accounts/', include('django.contrib.auth.urls')),
]
