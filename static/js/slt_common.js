///////////////////////// CONSTANT /////////////////////////
const VM_PRODUCTION     = 1;
const VM_NON_PRODUCTION = 0;

const SUMM_MODE_CALIBRATION = "calibration";
const SUMM_MODE_PRODUCTION  = "production";
const SUMM_MODE_FA          = "fa";


const SLT_MODE_CALIBRATION = 1;
const SLT_MODE_PRODUCTION  = 2;
const SLT_MODE_FA          = 3;

const SLT_MODES = ["", "Calibration", "Production", "FA"]

var csrftoken = Cookies.get('csrftoken');

$("#id_dialog").dialog({
    autoOpen: false,
    height: 'auto',
    width: 'auto',
    modal: true,
    closeOnEscape:true,
    resizable:false,
    show:'fade',
    buttons: {
        "OK": function() {
            $(this).dialog("close");
        }
    },
    open: function() {
        var message = $(this).data('Message');
        $( "#MsgText" ).html(message);
    }
});

function slt_dialog ( msg ) {
    $('#id_dialog').data('Message', msg);
    $('#id_dialog').dialog("open");
}

/** 
 * Get parameter value from URL
 */
function get_param_by_name ( name, url = null ) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex   = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/*
 * convert second to hh:mm:ss string format
 */
function hhmmss ( second ) {
    var sec_num = parseInt(second);
    var h = Math.floor(sec_num / 3600);
    var m = Math.floor(sec_num % 3600 / 60);
    var s = Math.floor(sec_num % 3600 % 60);
    if (h < 10) h = '0' + h;
    if (m < 10) m = '0' + m;
    if (s < 10) s = '0' + s;
    return h + ':' + m + ':' + s;
}

/*
 * Delay ms microseconds
 */
function delay ( ms ) {
    // cheat code wait for sometime
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
        end = new Date().getTime();
    }
}


/**
 * Read & parse INI data
 */
function parse_ini ( data ) {
    var regex = {
        section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
        param: /^\s*([^=]+?)\s*=\s*(.*?)\s*$/,
        comment: /^\s*;.*$/
    };
    var value = {};
    var lines = data.split(/[\r\n]+/);
    var section = null;
    lines.forEach( function(line) {
        if (regex.comment.test(line)) {
            return;
        } else if (regex.param.test(line)) {
            var match = line.match(regex.param);
            if (section) {
                value[section][match[1]] = match[2];
            } else {
                value[match[1]] = match[2];
            }
        } else if (regex.section.test(line)) {
            var match = line.match(regex.section);
            value[match[1]] = {};
            section = match[1];
        } else if (line.length == 0 && section) {
            section = null;
        };
    });
    return value;
}

/**
 * Get param value from INI configuration
 */
function get_ini_param ( data, section, param ) {
    var ini_data = null, value = null;
    if (data) {
        ini_data = parse_ini(data);
        value = ini_data[section][param];
    }
    return value;
}

function getJsonFromUrl ( hashBased ) {
    var query;
    if(hashBased) {
        var pos = location.href.indexOf("?");
    if(pos==-1) return [];
        query = location.href.substr(pos+1);
    } else {
        query = location.search.substr(1);
    }
    var result = {};
    query.split("&").forEach(function(part) {
        if(!part) return;
        part = part.split("+").join(" "); // replace every + with space, regexp-free version
        var eq = part.indexOf("=");
        var key = eq>-1 ? part.substr(0,eq) : part;
        var val = eq>-1 ? decodeURIComponent(part.substr(eq+1)) : "";
        var from = decodeURIComponent(key).indexOf("[");
        if(from==-1)
            result[decodeURIComponent(key)] = val;
        else {
            var to = decodeURIComponent(key).indexOf("]",from);
            var index = decodeURIComponent(key.substring(from+1,to));
            key = decodeURIComponent(key.substring(0,from));
            if(!result[key]) result[key] = [];
            if(!index) result[key].push(val);
            else result[key][index] = val;
        }
    });
    return result;
}

function select2_set_options ( options, select2_obj ) {
    if (!options || !select2_obj)
        return false;
    for (var i = 0; i < options.length; ++i) {
        var opt = new Option(options[i], options[i], true, true);
        if (select2_obj.filter(function() {
            return $(this).val() === opt;
        }).length === 0) {
            select2_obj.append(opt).trigger('change');
        } else {
            select2_obj.val(opt).trigger('change');
        }
    }
    return true;
}

function commit_json_data ( URL = "",
                            Data = {},
                            Param = {},
                            OnSuccessCallback = null,
                            OnErrorCallback = null ) {
    $.ajax({
        type     : "POST",
        url      : URL,
        cache    : true,
        data     : Data,
        dataType : "json",
        success: function ( response ) {
            if (OnSuccessCallback) {
                var json_resp = response;
                OnSuccessCallback(json_resp, Param);
            }
        },
        error: function ( response ) {
            var json_resp = response.responseJSON;
            if (OnErrorCallback && json_resp)
                OnErrorCallback(json_resp, Param);
            else {
                slt_dialog(json_resp);
            }
        }
    });
}

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});


function slt_confirm_dialog( Title, Message, YesFn, NoFn ) {
    $('<div></div>').appendTo('body')
    .html('<div><h6>' + Message + '?</h6></div>')
    .dialog({
        modal: true, title: Title, zIndex: 10000, autoOpen: true,
        width: 'auto', resizable: false,
        buttons: {
            Yes: function () {
                if (YesFn)
                    YesFn();
                $(this).dialog("close");
            },
            No: function () {
                if (NoFn)
                    NoFn();
                $(this).dialog("close");
            }
        },
        close: function (event, ui) {
            $(this).remove();
        }
    });
}

function enable_qtips ( container ) {
    container.find('[data-tooltip != ""]').each(function () {
        $(this).qtip({
            content: {
                attr: 'data-tooltip'
            },
            position: {
                target: 'mouse',
                adjust: { x: 5, y: 5 }
            }
        });
    });
}
function clear_qtips ( container ) {
    container.find('[data-tooltip != ""]').each(function() {
        $(this).qtip("destroy", true);
    });
}
function enable_all_qtips ( ) {
    $('[data-tooltip != ""]').qtip({ // Grab all elements with a non-blank data-tooltip attr.
        content: {
            attr: 'data-tooltip' // Tell qTip2 to look inside this attr for its content
        },
        position: {
            target: 'mouse', // Track the mouse as the positioning target
            adjust: { x: 5, y: 5 } // Offset it slightly from under the mouse
        }
    });
}
