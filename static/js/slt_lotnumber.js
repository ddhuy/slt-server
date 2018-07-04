/////////////////// Insert Function ///////////////////
$(function() {
    var add_dialog = $("#add_dialog").dialog({
        height: 'auto',
        width: 'auto',
        autoOpen: false,
        closeOnEscape:true,
        resizable:false,
        modal: true,
        show:'fade',
        open: function ( ) {

        },
        close: function() {
            $("#i_lotid").val('');
            $("#i_lotnumber").val('');
        },
        buttons: {
            "Add": function() {
                var lot_id = $("#i_lotid").val();
                var lot_number = $("#i_lotnumber").val();

                if (lot_id == '' || lot_number == '') {
                    $("#d2").data('Message', 'Please fulfil all the required information!');
                    $("#d2").dialog("open");
                    return
                }

                $.ajax({
                    type: 'post',
                    url: '/lotnumber/',
                    cache: false,
                    dataType: 'json',
                    data: { Action: 'InsertLot', LotId: lot_id, LotNumber: lot_number },
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

    $("#i_newlot").click(function() {
        add_dialog.dialog("open");
    });

    $("#i_genlot").click(function() {
        var lot_id = $("#i_lotid").val();
        if ((lot_id == null) || (lot_id == "")) {
            return;
        }
        $.ajax({
            type: 'post',
            url: '/lotnumber/',
            cache: false,
            dataType: 'json',
            data: { Action: 'GenerateLotNumber', LotId: lot_id },
            success: function(json_resp) {
                var resp = JSON.parse(JSON.stringify(json_resp));
                var Lot = resp.Data;
                if (resp.Errno == 0) {
                    $("#i_lotnumber").val(Lot.Number);
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
    });

});

/////////////////// Edit Function ///////////////////
$(function() {
    var edit_dialog = $("#edit_dialog").dialog({
        height: 'auto',
        width: 'auto',
        autoOpen: false,
        closeOnEscape:true,
        resizable:false,
        modal: true,
        show:'fade',
        open: function() {
            LotNumber_DataRow = $(this).data('LotNumber_DataRow');
            $("#u_id").val(LotNumber_DataRow.ID);
            $("#u_lotid").val(LotNumber_DataRow.LotId);
            $("#u_lotnumber").val(LotNumber_DataRow.LotNumber);
        },
        close: function() {
            $("#u_lotid").val('');
            $("#u_lotnumber").val('');
        },
        buttons: {
            "Update": function() {
                var id = $("#u_id").val();
                var lot_id = $("#u_lotid").val();
                var lot_number = $("#u_lotnumber").val();

                if (lot_id == '' || lot_number == '') {
                    $("#d2").data('Message', 'Please fulfil all the required information!');
                    $("#d2").dialog("open");
                    return;
                }

                $.ajax({
                    type: 'post',
                    url: '/lotnumber/',
                    cache: false,
                    dataType: 'json',
                    data: { Action: 'UpdateLot', ID: id, LotId: lot_id, LotNumber: lot_number },
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

    $(".editLot").click(function() {
        //get current selected command row
        var LotNumber_DataRow = $(this).closest('tr.LotNumber_DataRow');
        edit_dialog.data('LotNumber_DataRow', LotNumber_DataRow);
        edit_dialog.dialog("open");
        return false;
    });
});

/////////////////// Delete Function ///////////////////
$(function() {
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
                var id = $(this).data('LotNumber_DataRow').ID;
                $.ajax({
                    type: 'post',
                    url: '/lotnumer/',
                    cache: false,
                    dataType: 'json',
                    data: { Action: 'DeleteLot', ID: id },
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

    $(".removeLot").click(function() {
        var LotNumber_DataRow = $(this).closest('tr.LotNumber_DataRow');
        delete_dialog.data('LotNumber_DataRow', LotNumber_DataRow);
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
