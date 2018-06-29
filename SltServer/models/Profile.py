from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from django.contrib import admin

class Profile ( models.Model ) :
    USER_ROLE_ADM = 'A'
    USER_ROLE_DEV = 'D'
    USER_ROLE_OPR = 'O'
    USER_ROLE = (
        (USER_ROLE_ADM, 'Admin'),
        (USER_ROLE_DEV, 'Developer'),
        (USER_ROLE_OPR, 'Operator'),
    )

    user = models.OneToOneField(User, on_delete = models.CASCADE)
    DisplayName = models.CharField(max_length = 255)
    Rfid = models.IntegerField(unique = True, null = True, blank = True)
    Role = models.CharField(max_length = 255, choices = USER_ROLE, default = 'O')

    class Meta:
        verbose_name = 'Profile'
        verbose_name_plural = 'Profiles'

    def __str__ ( self ) :
        return "%s-%s" % (self.user.username, self.Rfid)

    def is_admin ( self ) :
        return self.Role == Profile.USER_ROLE_ADM

    def is_dev ( self ) :
        return self.Role == Profile.USER_ROLE_DEV

    def is_operator ( self ) :
        return self.Role == Profile.USER_ROLE_OPR

    def need_admin ( self ) :
        return (self.Role <= Profile.USER_ROLE_ADM)

    def need_dev ( self ) :
        return (self.Role <= Profile.USER_ROLE_DEV)

    def need_operator ( self ) :
        return (self.Role <= Profile.USER_ROLE_OPR)


class ProfileAdmin ( admin.ModelAdmin ) :
    list_display = ['DisplayName', 'Rfid', 'Role']


@receiver(post_save, sender = User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user = instance)

@receiver(post_save, sender = User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()