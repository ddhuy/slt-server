from rest_framework import serializers

from SltServer.models import Architecture
class ArchitectureSerializer ( serializers.ModelSerializer ) :
    class Meta:
        model = Architecture
        fields = '__all__'

from SltServer.models import LotNumber
class LotNumberSerializer ( serializers.ModelSerializer ) :
    class Meta:
        model = LotNumber
        fields = '__all__'

from SltServer.models import Profile
class ProfileSerializer ( serializers.ModelSerializer ) :
    class Meta:
        model = Profile
        fields = '__all__'

from SltServer.models import SltMode
class SltModeSerializer ( serializers.ModelSerializer ) :
    class Meta:
        model = SltMode
        fields = '__all__'

from SltServer.models import TestCommand
class TestCommandSerializer ( serializers.ModelSerializer ) :
    class Meta:
        model = TestCommand
        fields = '__all__'

from SltServer.models import TestMode
class TestModeSerializer ( serializers.ModelSerializer ) :
    class Meta:
        model = TestMode
        fields = '__all__'

from SltServer.models import TestResultDetail
class TestResultDetailSerializer ( serializers.ModelSerializer ) :
    class Meta:
        model = TestResultDetail
        fields = '__all__'

from django.contrib.auth.models import User
class UserSerializer ( serializers.ModelSerializer ) :
    class Meta :
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'is_staff', 'is_active')

from SltServer.models import TestResult
class TestResultSerializer ( serializers.ModelSerializer ) :
    Operator = UserSerializer()
    Details = TestResultDetailSerializer(many = True)

    class Meta:
        model = TestResult
        fields = '__all__'
        depth = 1 # nested serialization