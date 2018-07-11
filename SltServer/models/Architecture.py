from django.db import models

class Architecture ( models.Model ) :
    ARCH_SKYLARK = 'skylark'
    ARCH_STORM   = 'storm'

    Name = models.CharField(max_length = 255)
    Description = models.CharField(max_length = 255)

    ALL_DATA = None

    class Meta:
        verbose_name = 'Architecture'
        verbose_name_plural = 'Architectures'

    def __str__ ( self ) :
        return "%s" % self.Name

    def natural_key ( self ) :
        return (self.Name, self.Description)

    @classmethod
    def __all_data ( cls ) :
        if (cls.ALL_DATA == None) :
            cls.ALL_DATA = cls.objects.all()
        return cls.ALL_DATA

    @classmethod
    def GetName ( cls, arch ) :
        for obj in cls.__all_data() :
            if (arch.lower() == obj.Name.lower()) :
                return arch.lower()
        return None

    @classmethod
    def GetAll ( cls ) :
        return cls.__all_data()