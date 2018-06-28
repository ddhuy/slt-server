from django.db import models

class LotNumber ( models.Model ) :
    ID = models.CharField(max_length = 255, primary_key = True)
    Number = models.CharField(max_length = 255)

    class Meta:
        verbose_name = 'LotNumber'
        verbose_name_plural = 'LotNumbers'

    def __str__ ( self ) :
        return "%s:%s" % (self._ID, self._Number)
