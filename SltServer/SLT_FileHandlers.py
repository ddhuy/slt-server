import logging
from SltServer import FileHelper

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
