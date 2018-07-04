////////////////////////// Update Function ///////////////////////////////////
$(function() {
    //Create dialog Edite
    var edit_dialog = $("#edit_dialog").dialog({
        height: 'auto',
        width: 'auto',
        autoOpen: false,
        closeOnEscape:true,
        resizable:false,
        modal: true,
        show:'fade',
        close: function() {
            $("#u_userid").val('');
            $("#u_username").val('');
            $("#u_rfid").val('');
            $('#u_name').val('');
            $('#u_permission').val('');
            $("#u_status").prop('checked', false);
        },
        buttons: {
            "Update": function() {
                var userid = $("#u_userid").val();
                var username = $("#u_username").val();
                var rfid = $('#u_rfid').val();
                var file = $('#u_file').val();
                var name = $('#u_name').val();
                var permissionid = $('#u_permission').val();
                var statusid = ($("#u_status").prop('checked')) ? 1 : 2;
                if(username == '' || name == '' || permissionid == '' || statusid == ''){
                    $("#d2").data('Message', 'Please fulfil all the required information!');
                    $("#d2").dialog("open");
                    return;
                }//End if statement

                $.ajax({
                    type: 'post',
                    url: '/admin/usermgmt',
                    cache: false,
                    dataType: 'json',
                    data: { Action: 'UpdateUser', ID: userid, Username: username, Rfid: rfid, Name: name,
                            Permission: permissionid, Status: statusid, File: file },
                    success: function(json_resp) {
                        var resp = JSON.parse(JSON.stringify(json_resp));
                        if (resp.Errno == 0) {
                            location.reload();
                        } else {
                            $("#d2").data('Message', resp.Message);
                            $("#d2").dialog("open");
                        }
                    },
                    error: function(json_resp) {
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

    //when the edit link is clicked
    $(".edit").click(function() {
        //get closest book div
        var user = $(this).closest('.user');
        //set update dialog
        $('#edit_dialog input[name="u_userid"]').val(user.attr('id'));
        $('#edit_dialog input[name="u_username"]').val($('.username', user).html());
        $('#edit_dialog input[name="u_rfid"]').val($('.rfid', user).html());
        $('#edit_dialog input[name="u_name"]').val($('.name', user).html());
        $('#edit_dialog select[name="u_permission"]').val($('.permission', user).attr('name'));
        $('#u_status').prop('checked', ($('.status', user).attr('name') == '1') ? true : false);
        //open dialog
        edit_dialog.dialog('open');
        //stop default link action
        return false;
    });
});

////////////////////////// Insert Function ///////////////////////////////////
$(function () {
    $(".sub").click(function(){
        var id=$("#hidid").val();
        alert(id);
    })

    // Add New Dialog Open
    var add_dialog = $("#add_dialog").dialog({
        autoOpen: false,
        height: 'auto',
        width: 'auto',
        modal: true,
        closeOnEscape:true,
        resizable:false,
        show:'fade',
        open: function() {
            $("#i_username").val('');
            $("#i_password").val('');
            $("#i_rfid").val('');
            $('#i_name').val('');
            $('#i_permission').val('');
            $("#i_status").prop('checked', false);
        },
        buttons: {
            "Add": function() {
                var username = $("#i_username").val();
                var password = $("#i_password").val();
                var rfid = $('#i_rfid').val();
                var file = $('#i_file').val();
                var name = $('#i_name').val();
                var permissionid = $('#i_permission').val();
                var statusid = ($("#i_status").prop('checked')) ? 1 : 2;

                if(username == '' || password == '' || rfid == '' || file == ''
                    || name == '' || permissionid == '' || statusid == '') {
                    $("#d2").data('Message', 'Please fulfil all the required information!');
                    $("#d2").dialog("open");
                    return
                }//End if statement

                $.ajax({
                    type: 'post',
                    url: '/admin/usermgmt',
                    cache: false,
                    dataType: 'json',
                    data: { Action: 'InsertUser', Username: username, Password: password, Rfid: rfid,
                            Name: name, Permission: permissionid, Status: statusid, File: file},
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

    $("#b1").click(function(){
        add_dialog.dialog("open");
    });

});


////////////// Message Dialog /////////////////////////
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
                $("#id:first").focus();
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
