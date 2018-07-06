from rest_framework import serializers

from SltServer.models import SltMode


class SltModeSerializer ( serializers.ModelSerializer ) :
    class Meta:
        model = SltMode
        fields = '__all__'

