from rest_framework import serializers

from SltServer.models import Bench

class BenchSerializer ( serializers.ModelSerializer ) :
    class Meta:
        model = Bench
        fields = '__all__'
