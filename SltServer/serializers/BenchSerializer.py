from rest_framework import serializers

from SltServer.models import Bench

from .ArchitectureSerializer import ArchitectureSerializer
from .BenchHistorySerializer import BenchHistorySerializer
from .UserSerializer import UserSerializer

class BenchSerializer ( serializers.ModelSerializer ) :
    Architecture = ArchitectureSerializer()
    Operator = UserSerializer()

    class Meta:
        model = Bench
        fields = '__all__'
