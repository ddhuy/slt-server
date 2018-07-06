from rest_framework import serializers

from SltServer.models import TestMode


class TestModeSerializer ( serializers.ModelSerializer ) :
    class Meta:
        model = TestMode
        fields = '__all__'
