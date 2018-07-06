from rest_framework import serializers

from SltServer.models import TestCommand


class TestCommandSerializer ( serializers.ModelSerializer ) :
    class Meta:
        model = TestCommand
        fields = '__all__'
