import os, csv
import ConfigParser

from SltServer import FileHelper, Utils
from SltServer.Csv_FileHelper import Csv_FileHelper

CFG_BASE_DIR = 'Database'

class CsvFile ( object ) :
    def __init__ ( self, Rfid ) :
        self.Rfid = Rfid
    def GetCsv ( self ) :
        Filepath = self.GetFilepath()
        return FileHelper.read_file(Filepath)
    def SetCsv ( self, Content ) :
        Filepath = self.GetFilepath()
        if (not FileHelper.isfile(Filepath)) :
            FileHelper.create_file(Filepath)
        FileHelper.write_file(Filepath, Content)
    def GetData ( self ) :
        Filepath = self.GetFilepath()
        return Csv_FileHelper.Read(Filepath)
    def SetData ( self, Data ) :
        Filepath = self.GetFilepath()
        if (not FileHelper.isfile(Filepath)) :
            FileHelper.create_file(Filepath)
        Csv_FileHelper.Write(Filepath, self.CSV_COLUMNS, Data)

class Csv_UserInformation ( CsvFile ) :
    CSV_COLUMNS = ['name','admin','display']
    FILENAME = 'menu_display.csv'
    def __init__ ( self, Rfid ) :
        super(Csv_UserInformation, self).__init__(Rfid)
    def GetFilepath ( self ) :
        return os.path.join(CFG_BASE_DIR, str(self.Rfid), self.FILENAME)

class Csv_BoardList ( CsvFile ) :
    CSV_COLUMNS = ['name','config']
    FILENAME = 'board_list.csv'
    def __init__ ( self, Rfid ) :
        super(Csv_BoardList, self).__init__(Rfid)
    def GetFilepath ( self ) :
        return os.path.join(CFG_BASE_DIR, str(self.Rfid), self.FILENAME)
    def CreateItem ( self, **kwargs ) :
        item = dict((k, None) for k in self.CSV_COLUMNS)
        item['name'] = kwargs['Name']
        item['config'] = kwargs['ID'] + '.ini'
        return item
    def GetData ( self ) :
        data = super(Csv_BoardList, self).GetData()
        for d in data :
            d['ID'] = FileHelper.remove_extension(d['config'])
        return data

class Csv_MenuDisplay ( CsvFile ) :
    CSV_COLUMNS = ['display','mode','test_cfg','second_test_cfg','error_table1','error_table2','enable']
    FILENAME = 'menu_display.csv'
    def __init__ ( self, Rfid, ID ) :
        super(Csv_MenuDisplay, self).__init__(Rfid)
        self.ID = ID
    def GetFilepath ( self ) :
        return os.path.join(CFG_BASE_DIR, str(self.Rfid), self.ID, self.FILENAME)