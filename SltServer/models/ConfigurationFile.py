import os, csv
import ConfigParser

from SltServer import FileHelper, Utils
from SltServer.Csv_FileHelper import Csv_FileHelper
from SltServer.Ini_FileHelper import Ini_FileHelper

CFG_BASE_DIR = 'Database'

class CsvFile ( object ) :
    def GetContent ( self ) :
        Filepath = self.GetFilepath()
        if (FileHelper.isfile(Filepath)) :
            return FileHelper.read_file(Filepath)
        return None
    def SetContent ( self, Content ) :
        Filepath = self.GetFilepath()
        FileHelper.create_file(Filepath)
        FileHelper.write_file(Filepath, Content)
    def GetData ( self ) :
        Filepath = self.GetFilepath()
        if (FileHelper.isfile(Filepath)) :
            return Csv_FileHelper.Read(Filepath)
        return None
    def SetData ( self, Data ) :
        Filepath = self.GetFilepath()
        FileHelper.create_file(Filepath)
        Csv_FileHelper.Write(Filepath, self.CSV_COLUMNS, Data)

class Ini_BoardSetting ( Ini_FileHelper ) :
    def __init__ ( self, Rfid, ID ) :
        self.Rfid = str(Rfid)
        self.ID = ID
        super(Ini_BoardSetting, self).__init__(self.GetFilepath())
    def GetFilepath ( self ) :
        return os.path.join(CFG_BASE_DIR, self.Rfid, self.ID + '.ini')
    def GetContent ( self ) :
        Filepath = self.GetFilepath()
        if (FileHelper.isfile(Filepath)) :
            return FileHelper.read_file(Filepath)
        return None
    def SetContent ( self, Content ) :
        Filepath = self.GetFilepath()
        FileHelper.create_file(Filepath)
        FileHelper.write_file(Filepath, Content)

class Csv_UserInformation ( CsvFile ) :
    CSV_COLUMNS = ['name','admin','display']
    FILENAME = 'menu_display.csv'
    def __init__ ( self, Rfid ) :
        self.Rfid = str(Rfid)
    def GetFilepath ( self ) :
        return os.path.join(CFG_BASE_DIR, self.Rfid, self.FILENAME)

class Csv_BoardList ( CsvFile ) :
    CSV_COLUMNS = ['name','config']
    FILENAME = 'board_list.csv'
    def __init__ ( self, Rfid ) :
        self.Rfid = str(Rfid)
    def GetFilepath ( self ) :
        return os.path.join(CFG_BASE_DIR, self.Rfid, self.FILENAME)
    def CreateItem ( self, **kwargs ) :
        item = dict((k, None) for k in self.CSV_COLUMNS)
        item['name'] = kwargs['Name']
        item['config'] = kwargs['ID'] + '.ini'
        return item
    def GetData ( self ) :
        data = super(Csv_BoardList, self).GetData()
        if (data) :
            for d in data :
                d['ID'] = FileHelper.remove_extension(d['config'])
        return data

class Csv_MenuDisplay ( CsvFile ) :
    CSV_COLUMNS = ['display','mode','test_cfg','second_test_cfg','error_table1','error_table2','enable']
    FILENAME = 'menu_display.csv'
    def __init__ ( self, Rfid, ID ) :
        self.Rfid = str(Rfid)
        self.ID = ID
    def GetFilepath ( self ) :
        return os.path.join(CFG_BASE_DIR, self.Rfid, self.ID, self.FILENAME)