# from django.db import models

# CFG_BASE_DIR = 'Database/Firmwares'

# class SwInfoItem ( models.Model ):
#     CSV_COLUMNS = ['name','file']
#     FILENAME = 'menu_display.csv'
#     def __init__ ( self ) :
#         pass
#     def GetFilepath ( self ) :
#         return os.path.join(CFG_BASE_DIR, self.Rfid, self.ID, self.FILENAME)
#     def CreateItem ( self, **kwargs ) :
#         item = dict((k, None) for k in self.CSV_COLUMNS)
#         item = kwargs
#         return item    

# class BoardSoftware ( models.Model ) :
#     VersionName = models.CharField(max_length = 255, primary_key = True)
#     ReleaseDate = models.DateTimeField()
#     StorageServerIp = models.CharField(max_length = 255)
#     StorageUsername = models.CharField(max_length = 255)
#     StoragePassword = models.CharField(max_length = 255)
#     StorageProtocol = models.CharField(max_length = 255)
#     ParentDirectory = models.CharField(max_length = 255)


#     class Meta:
#         verbose_name = 'LotNumber'
#         verbose_name_plural = 'LotNumbers'

#     def __str__ ( self ) :
#         return "%s:%s" % (self.ID, self.Number)


#     CSV_COLUMNS = ['sw_version','release_date','protocol','address','username','password','parent_dir']
#     FILENAME = 'swinfo.csv'
#     def __init__ ( self, arch_name ) :
#         self.ArchName = lower(arch_name)
#     def GetFilepath ( self ) :
#         return os.path.join(CFG_BASE_DIR, self.ArchName, self.FILENAME)
#     def CreateItem ( self, **kwargs ) :
#         item = dict((k, None) for k in self.CSV_COLUMNS)
#         item = kwargs
#         return item
#     def GetSoftwareInfos ( self ) :
#         sw_infos = self.GetData()
#         for swinfo in sw_infos :
#             swinfo['SwInfos'] = self.GetSoftwareInfo(self.ArchName, swinfo['SwVersion'])
#             swinfo['HashInfos'] = self.GetHashInfo(self.ArchName, swinfo['SwVersion'])
#             if (not swinfo['ParentDir']) :
#                 swinfo['ParentDir'] = _getSwPath(self.ArchName, '')
#             if (not swinfo['Address']) :
#                 swinfo['Address'] = Utils.get_active_ip()
#         return sw_infos