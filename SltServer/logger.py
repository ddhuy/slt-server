import os, sys, json, errno
import logging, logging.config

from SltServer import FileHelper

# Logging configuration
LOGGING = {
    "version" : 1,
    "disable_existing_logger" : False,
    "formatters" : {
        "verbose" : {
            "class" : "logging.Formatter",
            "format" : "[%(asctime)s][%(levelname)7s][%(filename)s:%(lineno)d] - %(message)s",
            "datefmt" : "%Y:%m:%d-%H:%M:%S"
        },
        "simple" : {
            "format" : "[%(filename)s:%(lineno)d] - %(message)s"
        }
    },
    "handlers" : {
        "filelog" : {
            "class" : "SltServer.SLT_FileHandlers.SLT_TimedRotatingFileHandler",
            "level" : "DEBUG",
            "formatter" : "verbose",
            "filename" : "Logs/slt-server.log",
            "interval" : 1,
            "when" : "h",
            "backupCount" : 24,
            "encoding" : "utf8"
        },
        "console" : {
            "class" : "logging.StreamHandler",
            "level" : "INFO",
            "formatter" : "simple",
        }
    },
    "loggers" : {
        # used to log all Django messages
        "django" : {
            "level" : "DEBUG",
            "handlers" : ["console", "filelog"],
            "propagate" : True
        },
        # used to log SLT messages
        "SLT" : {
            "level" : "DEBUG",
            "handlers" : ["console", "filelog"],
            "propagate" : True
        },
    },
}

class SLT_TimedRotatingFileHandler ( logging.handlers.TimedRotatingFileHandler ) :
    def __init__ ( self, filename, **kwargs ) :
        FileHelper.mkdir_p(FileHelper.extract_filepath(filename))
        super(SLT_TimedRotatingFileHandler, self).__init__(filename, **kwargs)

    def emit ( self, record ) :
        if (not FileHelper.isfile(self.baseFilename)) :
            FileHelper.create_file(self.baseFilename)
            self.doRollover()
        if (self.shouldRollover(record)) :
            self.doRollover()
        super(SLT_TimedRotatingFileHandler, self).emit(record)

class SLT_Logger ( object ) :
    logging.config.dictConfig(LOGGING)
    __logger = logging.getLogger('SLT')

    def __getattr__ ( self, Attr ) :
        try :
            return SLT_Logger.__logger.__getattr__(Attr)
        except (Exception) as ex :
            return SLT_Logger.__logger.__getattribute__(Attr)

#################
# Global LOGGER #
#################
LOG = SLT_Logger()
