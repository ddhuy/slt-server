from django.db import models

class SltMode ( models.Model ) :
    Mode = models.CharField(max_length = 255, unique = True)
    Text = models.CharField(max_length = 255)

    SLT_MODE_CALIB = 1
    SLT_MODE_PROD = 2
    SLT_MODE_FA = 3

    ALL_DATA = None

    class Meta:
        verbose_name = 'SltMode'
        verbose_name_plural = 'SltModes'

    def __str__ ( self ) :
        return "%s" % self.Mode

    @classmethod
    def __all_data ( cls ) :
        if (cls.ALL_DATA == None) :
            cls.ALL_DATA = cls.objects.all()
        return cls.ALL_DATA

    @classmethod
    def GetName ( cls, slt_mode ) :
        for obj in cls.__all_data() :
            if (slt_mode.lower() == obj.Mode.lower()) :
                return slt_mode.lower()
        return None

    @classmethod
    def GetID ( cls, mode_name ) :
        for obj in cls.__all_data() :
            if (mode_name.lower() == obj.Mode.lower()) :
                return obj.id
        return None
