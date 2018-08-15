from rest_framework import serializers

from SltServer.models import TestResultDetail

class TestResultDetailSerializer ( serializers.ModelSerializer ) :
    class Meta:
        model = TestResultDetail
        fields = '__all__'
