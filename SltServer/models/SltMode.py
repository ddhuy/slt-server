from django.db import models

class SltMode ( models.Model ) :
    Mode = models.CharField(max_length = 255, unique = True)
    Text = models.CharField(max_length = 255)

    class Meta:
        verbose_name = 'SltMode'
        verbose_name_plural = 'SltModes'

    def __str__ ( self ) :
        return "%s" % self._Mode
