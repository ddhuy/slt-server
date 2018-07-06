from rest_framework import serializers

from .TestResultDetailSerializer import TestResultDetailSerializer
from .UserSerializer import UserSerializer

from SltServer.models import TestResult


class TestResultSerializer ( serializers.ModelSerializer ) :
    Operator = UserSerializer()
    Details = TestResultDetailSerializer(many = True)

    class Meta:
        model = TestResult
        fields = '__all__'
        depth = 1 # nested serialization