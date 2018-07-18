import os
import ConfigParser

class Ini_FileHelper ( object ):
    """INI_CONFIG_PARSER: parse .ini file"""
    def __init__ ( self, filename ):
        # Init ConfigParser
        self.Config = ConfigParser.ConfigParser()
        self.Config.read(filename)
    def get(self, section, option, default=None, type=None):
        if not self.Config.has_section(section) or not self.Config.has_option(section, option):
            return default
        else:
            try:
                if type is int:
                    return self.Config.getint(section, option)
                elif type is bool:
                    return self.Config.getboolean(section, option)
                elif type is float:
                    return self.Config.getfloat(section, option)
                elif type is list:
                    return self.Config.get(section, option).split(',')
                else:
                    return self.Config.get(section, option)
            except Exception, e:
                return default
    def set(self, section, option, value):
        if not self.Config.has_section(section):
            self.Config.add_section(section)
        self.Config.set(section, option, str(value))
        try:
            with open(self.filename, 'w') as configfile:
                self.Config.write(configfile)
        except Exception, e:
            LOG.error('Save config: [{section}.{option}.{val}] to {filename} error'.format(section=section,
                option=option,val=value,filename=self.filename))
            LOG.error(e)
            return -1
        return 0