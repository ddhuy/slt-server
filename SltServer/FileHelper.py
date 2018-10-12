# '''
#  * Ampere Computing System Level Test
#  *
#  * Copyright (c) 2018, Ampere Computing
#  * Author: Huy Dang <huy.dang@amperecomputing.com>
#  *
#  *
# '''

import os, shutil, csv, string, random
from zipfile import *

#
# Check file path is exist
#
def isfile ( filepath ) :
    return os.path.isfile(filepath)

#
# Check directory is exist
#
def isdir ( dirname ) :
    return os.path.isdir(dirname)

#
# Rename dir
#
def rename ( old, new ) :
    return os.rename(old, new)

#
# Create empty text file if not exists
#
def create_file ( filepath ) :
    # split file name & path
    path = os.path.dirname(filepath)
    # create directory if it is not existed
    mkdir_p(path)
    # dump empty file
    open(filepath, 'wb').close()

#
# create directory recursively
#
def mkdir_p ( path ) :
    if path and (not os.path.isdir(path)):
        os.makedirs(path)

#
# remove a file
#
def rm ( filepath ) :
    return os.remove(filepath)

#
# remove directory recursively
#
def rmdir_r ( path ) :
    if os.path.exists(path) :
        shutil.rmtree(path)

#
# read file
#
def read_file ( filepath ) :
    content = ''
    if os.path.isfile(filepath) :
        with open(filepath, 'rb') as pfile :
            content = pfile.read()
    return content

#
# write file
#
def write_file ( filepath, content ) :
    with open(filepath, 'wb') as pfile :
        pfile.write(content)

#
# compress list of files to zip archive
#
def compress_files ( archive_path, archive_name, filelist ) :
    owd = os.getcwd()
    try :
        zip_filepath = archive_path + "/" + archive_name + ".zip"
        with ZipFile(zip_filepath, "w") as zfile :
            os.chdir(archive_path + "/..")
            for fname in filelist :
                data_filepath = archive_name + "/" + os.path.basename(fname)
                zfile.write(data_filepath)
    finally :
        os.chdir(owd)
    return zip_filepath

#
# get filename & extension, remove path
#
def extract_filename ( file_path ) :
    return os.path.basename(file_path)

#
# get file path only
#
def extract_filepath ( file_path ) :
    return os.path.dirname(file_path)

#
# get file extension
#
def extract_extension ( file_path ) :
    return os.path.splitext(os.path.basename(file_path))[1]

#
# get filename only without full path & extension
#
def remove_extension ( file_path ) :
    return os.path.splitext(file_path)[0]

#
# copy file from source to dest, act like cp command
#
def copytree ( src, dst ) :
    for item in os.listdir(src) :
        s = os.path.join(src, item)
        d = os.path.join(dst, item)
        if (os.path.isdir(s)) :
            mkdir_p(d)
            copytree(s, d)
        else :
            shutil.copy2(s, d)
