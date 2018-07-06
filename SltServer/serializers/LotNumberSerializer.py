from rest_framework import serializers

from SltServer.models import LotNumber


class LotNumberSerializer ( serializers.ModelSerializer ) :
    class Meta:
        model = LotNumber
        fields = '__all__'
