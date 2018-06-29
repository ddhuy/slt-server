from django.db import models

class TestMode ( models.Model ) :
    Mode = models.CharField(max_length = 255, unique = True)
    Text = models.CharField(max_length = 255)

    class Meta:
        verbose_name = 'TestMode'
        verbose_name_plural = 'TestModes'

    def __str__ ( self ) :
        return "%s" % self.Mode
