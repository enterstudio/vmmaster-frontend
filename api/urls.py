# -*- coding: utf-8 -*-

from django.conf.urls import url, include
from rest_framework import routers
import views

API_VERSION = 'v1'

router = routers.DefaultRouter()
router.register(r'%s/sessions' % API_VERSION, views.SessionList)

urlpatterns = [
    url(r'^%s/platforms$' % API_VERSION, views.Platforms.as_view()),
    url(r'^%s/user/token' % API_VERSION, views.GetToken.as_view()),
    url(r'^%s/user/generate_token' % API_VERSION, views.GenerateToken.as_view()),
    url(r'^', include(router.urls)),
    url(r'^%s/session/(?P<pk>[0-9]+)/$' % API_VERSION, views.SessionDetail.as_view()),
]
