from django.contrib.auth.models import User
from rest_framework import serializers

class UserSerializer ( serializers.ModelSerializer ) :
    class Meta :
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'is_staff', 'is_active', 'profile')
        depth = 1
