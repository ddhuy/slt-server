import os, csv
import ConfigParser

from SltServer import FileHelper, utils
from SltServer.logger import *
from SltServer.Csv_FileHelper import Csv_FileHelper
from SltServer.Ini_FileHelper import Ini_FileHelper

CFG_BASE_DIR = 'Database'

class CsvFile ( object ) :
    def GetContent ( self ) :
        Filepath = self.GetFilepath()
        if (FileHelper.isfile(Filepath)) :
            return FileHelper.read_file(Filepath)
        return ''
    def SetContent ( self, Content ) :
        Filepath = self.GetFilepath()
        FileHelper.create_file(Filepath)
        FileHelper.write_file(Filepath, Content)
    def GetData ( self ) :
        Filepath = self.GetFilepath()
        if (FileHelper.isfile(Filepath)) :
            return Csv_FileHelper.Read(Filepath)
        LOG.warn('File not found %s', self.GetFilepath())
        return []
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
        return ''
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
    def GetData ( self, ArchName = None ) :
        boards_list = []
        data = super(Csv_BoardList, self).GetData()
        if (data) :
            for d in data :
                board = {}
                board['ID'] = FileHelper.remove_extension(d['config'])
                IniFile = Ini_BoardSetting(self.Rfid, board['ID'])
                board['Filename'] = FileHelper.extract_filename(IniFile.GetFilepath())
                board['IniData'] = IniFile.GetContent()
                board['Text'] = d['name']
                if (ArchName is None) :
                    boards_list.append(board)
                elif (ArchName.lower() == Ini_FileHelper(IniFile.GetFilepath()).get('BOARD_CONFIG','Arch').lower()) :
                    boards_list.append(board)
        return boards_list

class Csv_MenuDisplay ( CsvFile ) :
    CSV_COLUMNS = ['display','mode','test_cfg','second_test_cfg','error_table1','error_table2','enable']
    FILENAME = 'menu_display.csv'
    def __init__ ( self, Rfid, ID ) :
        self.Rfid = str(Rfid)
        self.ID = ID
    def GetFilepath ( self ) :
        return os.path.join(CFG_BASE_DIR, self.Rfid, self.ID, self.FILENAME)
    def CreateItem ( self, **kwargs ) :
        item = dict((k, None) for k in self.CSV_COLUMNS)
        item = kwargs
        item['ID'] = kwargs['ID']
        item['test_cfg'] = kwargs['ID'] + '_TestCfg.csv'
        item['second_test_cfg'] = kwargs['ID'] + '_TestCfg2.csv'
        item['error_table1'] = kwargs['ID'] + '_Error1.csv'
        item['error_table2'] = kwargs['ID'] + '_Error2.csv'
        return item
    def GetData ( self ) :
        data = super(Csv_MenuDisplay, self).GetData()
        if (data) :
            for d in data :
                d['ID'] = d['test_cfg'].split('_')[0]
        return data

class Csv_TestConfiguration1 ( CsvFile ) :
    CSV_COLUMNS = ['test','mode','fail_stop','prompt','cmd','pass','fail','timeout','msg','comments']
    FILENAME = ''
    def __init__ ( self, Rfid, TestPlanId, TestSuiteId ) :
        self.Rfid = str(Rfid)
        self.TestPlanId = TestPlanId
        self.TestSuiteId = TestSuiteId
    def GetFilepath ( self ) :
        return os.path.join(CFG_BASE_DIR, self.Rfid, self.TestPlanId, self.TestSuiteId + '_TestCfg.csv')
    def CreateItem ( self, **kwargs ) :
        item = dict((k, None) for k in self.CSV_COLUMNS)
        item = kwargs
        return item

class Csv_TestConfiguration2 ( Csv_TestConfiguration1 ) :
    def GetFilepath ( self ) :
        return os.path.join(CFG_BASE_DIR, self.Rfid, self.TestPlanId, self.TestSuiteId + '_TestCfg2.csv')

class Csv_ErrorMonitor1 ( Csv_TestConfiguration1 ) :
    CSV_COLUMNS = ['name','type','expected','result','timeout','msg']
    FILENAME = ''
    def GetFilepath ( self ) :
        return os.path.join(CFG_BASE_DIR, self.Rfid, self.TestPlanId, self.TestSuiteId + '_Error1.csv')

class Csv_ErrorMonitor2 ( Csv_ErrorMonitor1 ) :
    def GetFilepath ( self ) :
        return os.path.join(CFG_BASE_DIR, self.Rfid, self.TestPlanId, self.TestSuiteId + '_Error2.csv')
