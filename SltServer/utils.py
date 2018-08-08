# '''
#  * Ampere Computing System Level Test
#  *
#  * Copyright (c) 2018, Ampere Computing
#  * Author: Huy Dang <huy.dang@amperecomputing.com>
#  *
#  *
# '''

import os, sys, string, random
import socket

from SltServer.logger import *

def try_parse ( data, cls ) :
    try :
        if (data) :
            return cls(data)
        else :
            return cls()
    except Exception as ex :
        LOG.exception(ex)
        return None

#
# generate id
#
PATTERN_ASCII = 0x01
PATTERN_DIGIT = 0x02
def generate_id ( size = 8, pattern = PATTERN_ASCII | PATTERN_DIGIT ) :
    chars = ""
    if (pattern & PATTERN_ASCII) :
        chars = chars + string.ascii_uppercase
    if (pattern & PATTERN_DIGIT) :
        chars = chars + string.digits
    if (chars != "") :
        return "".join(random.choice(chars) for _ in range(size))
    return ""

#
# get system timezone
#
def get_system_timezone ( ) :
    # detect timezone from /etc/timezone
    if (os.path.exists('/etc/timezone')) :
        try :
            tz = file('/etc/timezone').read().strip()
            return tz
        except Exception as ex :
            LOG.exception(ex)
    # detect timezone from /etc/localtime
    if (os.path.exists('/etc/localtime')) :
        try :
            tz = '/'.join(os.readlink('/etc/localtime').split('/')[-2:])
            return tz
        except Exception as ex :
            LOG.exception(ex)
    # cannot detect timezone
    LOG.error('Cannot detect timezone')
    return None

def get_active_ip ( ) :
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(('8.8.8.8', 80))
    ip_addr = s.getsockname()[0]
    s.close()
    return ip_addr