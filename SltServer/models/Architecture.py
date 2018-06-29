from django.db import models

class Architecture ( models.Model ) :

    ARCH_STORM = 'storm'
    ARCH_SKYLARK = 'skylark'
    ARCH_AST2500 = 'ast2500'

    Name = models.CharField(max_length = 255)
    Description = models.CharField(max_length = 255)

    class Meta:
        verbose_name = 'Architecture'
        verbose_name_plural = 'Architectures'

    def __str__ ( self ) :
        return "%s" % self.Name
