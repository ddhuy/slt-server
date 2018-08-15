from rest_framework import serializers

from SltServer.models import BenchHistory

class BenchHistorySerializer ( serializers.ModelSerializer ) :
    class Meta:
        model = BenchHistory
        fields = '__all__'
