from rest_framework import serializers

from SltServer.models import Architecture

class ArchitectureSerializer ( serializers.ModelSerializer ) :
    class Meta:
        model = Architecture
        fields = '__all__'