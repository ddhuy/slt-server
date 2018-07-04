/////////////////// Insert Function ///////////////////
$(function() {
    var ARCH = get_param_by_name('Arch');

    var add_dialog = $("#add_dialog").dialog({
        height: 'auto',
        width: 'auto',
        autoOpen: false,
        closeOnEscape:true,
        resizable:false,
        modal: true,
        show:'fade',
        close: function() {
            $("#i_test").val('');
            $("#i_mode").val('');
            $("#i_failstop").prop("checked", false);
            $("#i_prompt").val('');
            $("#i_command").val('');
            $("#i_pass").val('');
            $("#i_fail").val('');
            $("#i_timeout").val('');
            $("#i_msg").val('');
            $("#i_comments").val('');
        },
        buttons: {
            "Add": function() {
                var test = $("#i_test").val();
                var mode = $("#i_mode").val();
                var failstop = ($("#i_failstop").prop('checked')) ? 1 : 0;
                var prompt = $('#i_prompt').val();
                var command = $('#i_command').val();
                var pass = $('#i_pass').val();
                var fail = $('#i_fail').val();
                var timeout = $('#i_timeout').val();
                var msg = $('#i_msg').val();
                var comments = $("#i_comments").val();

                if(test == '' || mode == '') {
                    $("#d2").data('Message', 'Please fulfil all the required information!');
                    $("#d2").dialog("open");
                    return
                }//End if statement

                $.ajax({
                    type: 'post',
                    url: '/command/',
                    cache: false,
                    dataType: 'json',
                    data: { Action: 'InsertCommand', Arch: ARCH, Test: test, Mode: mode,
                            FailStop: failstop, Prompt: prompt, Command: command, Pass: pass,
                            Fail: fail, Timeout: timeout, Msg: msg, Comments: comments},
                    success: function(json_resp){
                        var resp = JSON.parse(JSON.stringify(json_resp));
                        if (resp.Errno == 0) {
                            location.reload();
                        } else {
                            $("#d2").data('Message', resp.Message);
                            $("#d2").dialog("open");
                        }
                    },
                    error: function(json_resp){
                        var resp = jQuery.parseJSON(json_resp.responseText);
                        $("#d2").data('Message', resp.Message);
                        $("#d2").dialog("open");
                    }
                });

                $(this).dialog("close");
            },
            "Cancel": function() {
                
                $(this).dialog("close");
            }
        }
    });

    $("#b1").click(function() {
        add_dialog.dialog("open");
    });
});

/////////////////// Edit Function ///////////////////
$(function() {
    var ARCH = get_param_by_name('Arch');
    var edit_dialog = $("#edit_dialog").dialog({
        height: 'auto',
        width: 'auto',
        autoOpen: false,
        closeOnEscape:true,
        resizable:false,
        modal: true,
        show:'fade',
        open: function() {
            CmdRow = $(this).data('Command');
            $("#u_id").val(CmdRow.attr('id'));
            $("#u_test").val($('.test', CmdRow).text());
            $("#u_mode").val($('.mode', CmdRow).text());
            $("#u_failstop").prop("checked", ($('.failstop', CmdRow).text() == '1' ? true : false));
            $("#u_prompt").val($('.prompt', CmdRow).text());
            $("#u_command").val($('.command', CmdRow).text());
            $("#u_pass").val($('.pass', CmdRow).text());
            $("#u_fail").val($('.fail', CmdRow).text());
            $("#u_timeout").val($('.timeout', CmdRow).text());
            $("#u_msg").val($('.msg', CmdRow).text());
            $("#u_comments").val($('.comments', CmdRow).text());
        },
        close: function() {
            $("#u_id").val('');
            $("#u_test").val('');
            $("#u_mode").val('');
            $("#u_failstop").prop("checked", false);
            $("#u_prompt").val('');
            $("#u_command").val('');
            $("#u_pass").val('');
            $("#u_fail").val('');
            $("#u_timeout").val('');
            $("#u_msg").val('');
            $("#u_comments").val('');
        },
        buttons: {
            "Update": function() {
                var id = $("#u_id").val();
                var test = $("#u_test").val();
                var mode = $("#u_mode").val();
                var failstop = ($("#u_failstop").prop('checked')) ? 1 : 0;
                var prompt = $('#u_prompt').val();
                var command = $('#u_command').val();
                var pass = $('#u_pass').val();
                var fail = $('#u_fail').val();
                var timeout = $('#u_timeout').val();
                var msg = $('#u_msg').val();
                var comments = $("#u_comments").val();

                if(test == '' || mode == '') {
                    $("#d2").data('Message', 'Please fulfil all the required information!');
                    $("#d2").dialog("open");
                    return
                }//End if statement

                $.ajax({
                    type: 'post',
                    url: '/command/',
                    cache: false,
                    dataType: 'json',
                    data: { Action: 'UpdateCommand', Arch: ARCH, ID: id, Test: test, Mode: mode,
                            FailStop: failstop, Prompt: prompt, Command: command, Pass: pass, Fail: fail,
                            Timeout: timeout, Msg: msg, Comments: comments },
                    success: function(json_resp) {
                        var resp = JSON.parse(JSON.stringify(json_resp));
                        if (resp.Errno == 0) {
                            location.reload();
                        } else {
                            $("#d2").data('Message', resp.Message);
                            $("#d2").dialog("open");
                        }
                    },
                    error: function(json_resp){
                        var resp = jQuery.parseJSON(json_resp.responseText);
                        $("#d2").data('Message', resp.Message);
                        $("#d2").dialog("open");
                    }
                });
            },
            "Cancel": function() {
                $(this).dialog("close");
            }
        }
    });

    $(".editTestCmd").click(function() {
        //get current selected command row
        var CmdRow = $(this).closest('tr.TestCommandRow');
        edit_dialog.data('Command', CmdRow);
        edit_dialog.dialog("open");
        return false;
    });
});

/////////////////// Delete Function ///////////////////
$(function() {
    var ARCH = get_param_by_name('Arch');
    var delete_dialog = $("#delete_dialog").dialog({
        height: 'auto',
        width: 'auto',
        autoOpen: false,
        closeOnEscape:true,
        resizable:false,
        modal: true,
        show:'fade',
        buttons: {
            "Delete": function() {
                var id = $(this).data('Command').attr('id');
                $.ajax({
                    type: 'post',
                    url: '/command/',
                    cache: false,
                    dataType: 'json',
                    data: { Action: 'DeleteCommand', ID: id, Arch: ARCH},
                    success: function(json_resp){
                        var resp = JSON.parse(JSON.stringify(json_resp));
                        if (resp.Errno == 0) {
                            location.reload();
                        } else {
                            $("#d2").data('Message', resp.Message);
                            $("#d2").dialog("open");
                        }
                    },
                    error: function(json_resp){
                        var resp = jQuery.parseJSON(json_resp.responseText);
                        $("#d2").data('Message', resp.Message);
                        $("#d2").dialog("open");
                    }
                });
            },
            "Cancel": function() {
                $(this).dialog("close");
            }
        }
    });

    $(".delTestCmd").click(function() {
        var CmdRow = $(this).closest('tr.TestCommandRow');
        delete_dialog.data('Command', CmdRow);
        delete_dialog.dialog("open");
        return false;
    });
});

/////////////////// Message Dialog ///////////////////
$(function() {
    var d2_dialog = $("#d2").dialog({
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
            var message = $("#d2").data('Message');
            $( "#MsgText" ).html(message);
        }
    });
});


////////////// Making Tooltip /////////////////////////
$(function() {
    $('a[title]').qtip({
        show: {
            delay: 1
        },
        hide: {
            delay: 0
        }
    });
    $('button').qtip({
        show: {
            delay: 1
        },
        hide: {
            delay: 0
        }
    });
    $('input[title]').qtip({
        show: {
            delay: 1
        },
        hide: {
            delay: 0
        }
    });
});
