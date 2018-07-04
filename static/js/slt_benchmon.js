var all_board_info = null;
var get_data_success = false;
var timeout = 0;

$(document).ready(function() {
    // get data from server
    get_data();
    // count online/offline time each 1s
    var intervalId = setInterval(count_timeup, 1000);
});

function count_timeup() {
    // polling get data every 30s
    if (timeout++ == 30) {
        timeout = 0;
        get_data();
    }

    if (get_data_success == true) {
        // remove old existed data
        if ($('#BoardInfoTable').find('tbody').length != 0) {
            $("#BoardInfoTable").find('tbody').empty();
        }
        // sort list of data: online boards appear first
        sort_online_board(all_board_info);
        // add new data
        for (info in all_board_info) {
            all_board_info[info]['Uptime'] += 1;
            bind_data(all_board_info[info]);
        }
    }
}

function sort_online_board ( lsboards ) {
    for (var i = 0; i < lsboards.length - 1; ++i) {
        if (lsboards[i]['Status'] == 'Disconnected') {
            for (var j = i + 1; j < lsboards.length; ++j) {
                if (lsboards[j]['Status'] == 'Connected') {
                    var tmp = lsboards[i];
                    lsboards[i] = lsboards[j];
                    lsboards[j] = tmp;
                    break;
                }
            }
        }
    }
}

function get_data() {
    // send POST to get board info
    $.ajax({
        type: 'post',
        url: '/bench',
        cache: false,
        dataType: 'json',
        data: { Action : 'GetAllBoardInfo' },
        success: function(json_resp) {
            resp = JSON.parse(JSON.stringify(json_resp));
            // check data error
            if (resp.Errno != 0) {
                get_data_success = false;
                $("#d2").data('Message', all_board_info.Message);
                $("#d2").dialog('open');
                return;
            } else {
                get_data_success = true;
                all_board_info = resp.Data;
            }
        },
        error: function(json_resp) {
            // var resp = jQuery.parseJSON(json_resp.responseText);
            if (json_resp.responseText != "") {
                $("#d2").data('Message', json_resp.responseText);
                $("#d2").dialog("open");
            } else {
                // timeout when send message to server.
                // $("#d2").data('Message', "Server is shutdown!");
                // $("#d2").dialog("open");
            }
        }
    });
}

function bind_data (board_info) {
    var row = "";
    row += '<tr class="BoardInfoRow" id="' + board_info['ID'] + '">';
    row += '    <td style="display:none;text-align:center;" class="BoardId">' + $.trim(board_info['ID']) + '</td>';
    row += '    <td style="text-align:center;" class="BenchName">' + $.trim(board_info['BenchName']) + '</td>';
    row += '    <td style="text-align:center;" class="BenchNo">' + $.trim(board_info['BenchNum']) + '</td>';
    row += '    <td style="text-align:center;" class="ArchId">' + $.trim(board_info['Arch']) + '</td>';
    row += '    <td style="text-align:center;" class="BoardSerial">' + $.trim(board_info['BoardSerial']) + '</td>';
    row += '    <td style="text-align:center;" class="SocketSerial">' + $.trim(board_info['SocketSerial']) + '</td>';
    row += '    <td style="text-align:center;" class="Operator">' + $.trim(board_info['Operator']) + '</td>';
    row += '    <td style="text-align:center;" class="MacAddr">' + $.trim(board_info['MacAddr']) + '</td>';
    row += '    <td style="text-align:center;" class="IpAddr">' + $.trim(board_info['IpAddr']) + '</td>';
    row += '    <td style="text-align:center;" class="Status">';
    if ($.trim(board_info['Status']) == 'Connected')
        row += '<p style="color:green;">' + $.trim(board_info['Status']) + '</br> (' + hhmmss($.trim(board_info['Uptime'])) +')' + '</p>';
    else
        row += '<p style="">' + $.trim(board_info['Status']) + '</p>';
    row += '    </td>';
    row += '    <td style="text-align:center;">';
    if ($.trim(board_info['Status']) == 'Connected') {
        row += '        <a class="editBoardSetting" title="Edit Board Setting." href="#"><i class="icon-pencil"></i></a>';
        row += '        &nbsp;|&nbsp;';
    }
    row += '        <a class="getBoardHistory" title="Show History." href="#"><i class="icon-time"></i></a>';
    row += '    </td>';
    row += '</tr>';
    $("#BoardInfoTable").find('tbody').append(row);

    var new_tr = $("#BoardInfoTable").find('tbody tr:last');
    new_tr.data("HardwareInfo", board_info.HardwareInfo);
}

/////////////////// Edit Function ///////////////////
$(function() {
    var old_arch_id, old_bench, old_board_serial, old_socket_serial, old_hardware_info;
    var edit_dialog = $("#editBoardInfo_Dlg").dialog({
        height: 'auto',
        width: 'auto',
        autoOpen: false,
        closeOnEscape:true,
        resizable:false,
        modal: true,
        show:'fade',
        open: function() {
            var BoardInfo_TR = $(this).data('BoardInfo_TR');
            var MacAddr = $('.MacAddr', BoardInfo_TR).text();
            var ArchId  = $('.ArchId', BoardInfo_TR).text();
            var BenchNo = $('.BenchNo', BoardInfo_TR).text();
            var BoardSerial = $('.BoardSerial', BoardInfo_TR).text();
            var SocketSerial = $('.SocketSerial', BoardInfo_TR).text();
            var BenchName = $('.BenchName', BoardInfo_TR).text();
            var HardwareInfo = BoardInfo_TR.data("HardwareInfo");

            $("#txtMacAddr").val(MacAddr);
            $("#txtArchId").val(ArchId);
            $("#txtBenchNo").val(BenchNo);
            $("#txtBoardSerialId").val(BoardSerial);
            $("#txtSocketSerialId").val(SocketSerial);
            $("#txtHardwareInfoId").val(HardwareInfo);
            old_arch_id = ArchId;
            old_bench_no = BenchNo;
            old_board_serial = BoardSerial;
            old_socket_serial = SocketSerial;
            old_hardware_info = HardwareInfo;
            $(this).dialog("option", "title", "Edit " + BenchName);
        },
        close: function() {
            $("#txtBenchNo").val('');
            $("#txtArchId").val('');
            $("#txtBoardSerialId").val('');
            $("#txtSocketSerialId").val('');
        },
        buttons: {
            "Update": function() {
                var MacAddr = $("#txtMacAddr").val();
                var BenchNo = $("#txtBenchNo").val();
                var ArchId  = $("#txtArchId").val();
                var BoardSerial  = $("#txtBoardSerialId").val();
                var SocketSerial  = $("#txtSocketSerialId").val();
                var HardwareInfo  = $("#txtHardwareInfoId").val();

                // if(BenchNo == '' || ArchId == '' || BoardSerial == '' || SocketSerial == '' ) {
                //     $("#d2").data('Message', 'Please fulfill all the required information!');
                //     $("#d2").dialog("open");
                //     return
                // }

                // update architectgure & bench num
                if ((ArchId != old_arch_id)
                    || (BenchNo != old_bench_no)
                    || (BoardSerial != old_board_serial)
                    || (SocketSerial != old_socket_serial)
                    || (HardwareInfo != old_hardware_info)) {
                    $.ajax({
                        type: 'post',
                        url: '/bench',
                        cache: false,
                        dataType: 'json',
                        data:
                        {
                            Action: 'EditBenchInfo',
                            MacAddr: MacAddr,
                            Arch: ArchId,
                            BenchNum: BenchNo,
                            BoardSerial: BoardSerial,
                            SocketSerial: SocketSerial,
                            HardwareInfo: HardwareInfo
                        },
                        success: function(json_resp) {
                            var resp = JSON.parse(JSON.stringify(json_resp));
                            if (resp.Errno == 0) {
                                get_data();
                                edit_dialog.dialog("close");
                            } else {
                                $("#d2").data("Message", resp.Message);
                                $("#d2").dialog("open");
                            }
                        },
                        error: function(json_resp) {
                            var resp = jQuery.parseJSON(json_resp.responseText);
                            // var resp = jQuery.parseJSON(json_resp);
                            $("#d2").data('Message', resp.Message);
                            $("#d2").dialog("open");
                        }
                    });
                }

                $(this).dialog("close");
            },
            "Cancel": function() {
                $(this).dialog("close");
            }
        }
    });

    $("#BoardInfoTable").on('click', '.editBoardSetting', function() {
        var BoardInfo_TR = $(this).closest('tr.BoardInfoRow');
        edit_dialog.data('BoardInfo_TR', BoardInfo_TR);
        edit_dialog.dialog("open");
        return false;
    });
});

/////////////////// BoardHistory Function ///////////////////
$(function() {
    var history_dlg = $("#getBoardHistory_Dlg").dialog({
        height: 'auto',
        width: 'auto',
        autoOpen: false,
        closeOnEscape:true,
        resizable:false,
        modal: true,
        show:'fade',
        open: function() {
            var BoardInfo = $(this).data('BoardInfo');
            var BoardId = BoardInfo.BoardId;
            $.ajax({
                type: 'post',
                url: '/bench',
                cache: false,
                dataType: 'json',
                data: {Action:'GetBoardHistory', ID:BoardId},
                success: function(json_resp){
                    var resp = JSON.parse(JSON.stringify(json_resp));
                    if (resp.Errno == 0) {
                        // add new data
                        var RespData = resp.Data;
                        for (brd in RespData) {
                            bind_history(RespData[brd]);
                        }
                        history_dlg.dialog('option','position','center');
                    } else {
                        $("#d2").data('Message', resp.Message);
                        $("#d2").dialog("open");
                    }
                },
                error: function(json_resp){
                    // var resp = jQuery.parseJSON(json_resp.responseText);
                    var resp = jQuery.parseJSON(json_resp);
                    $("#d2").data('Message', resp.Message);
                    $("#d2").dialog("open");
                }
            });
        },
        close: function() {
            // remove old existed data
            if ($('#BoardHistoryTable').find('tbody').length != 0) {
                $("#BoardHistoryTable").find('tbody').empty();
            }

        },
        buttons: {
            "OK": function() {
                $(this).dialog("close");
            }
        }
    });

    $("#BoardInfoTable").on('click', '.getBoardHistory', function() {
        var BoardInfoRow = $(this).closest('tr.BoardInfoRow');
        BoardId = BoardInfoRow.attr('id');
        history_dlg.data('BoardInfo', {BoardId : BoardId});
        history_dlg.dialog("open");
        return false;
    });
});

function bind_history (brd_history) {
    var row = "";
    row += '<tr class="BoardHistoryRow" id="' + brd_history['ID'] + '">';
    row += '    <td style="text-align:center;" class="Event">' + $.trim(brd_history['Event']) + '</td>';
    row += '    <td style="text-align:center;" class="OldValue">' + $.trim(brd_history['Desc']) + '</td>';
    row += '    <td style="text-align:center;" class="Datetime">' + $.trim(brd_history['Datetime']) + '</td>';
    row += '</tr>';
    $("#BoardHistoryTable").find('tbody').append(row);
}

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
            $("#MsgText").html(message);
        }
    });
});

/////////////////// Import/Export Hardware Info Function ///////////////////
$(function () {
    var dom_hwinfo_dlg = document.createElement("input");
    dom_hwinfo_dlg.setAttribute("type", "file");
    dom_hwinfo_dlg.setAttribute("accept", ".ini");
    dom_hwinfo_dlg.onchange = function(e) {
        // no file selected
        if (!e || e.target.files.length <= 0)
            return;
        import_hwinfo_ini(e.target.files[0]);
    };
    dom_hwinfo_dlg.onclick = function() {
        this.value = null; // using DOM element itself
    };

    $("#editBoardInfo_Dlg").on("click", "#uid_ImportHwInfo", function() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            dom_hwinfo_dlg.click();
        } else {
            $("#uid_MsgDlg").data("Message", "This browser does not support File API");
            $("#uid_MsgDlg").dialog("open");
        }
        return false;
    });

    function import_hwinfo_ini ( fd ) {
        // read & parse ini file
        var file_reader = new FileReader();
        file_reader.readAsText(fd);
        file_reader.onload = function (e) {
            var cfg_content = e.target.result;
            $("#txtHardwareInfoId").val(cfg_content);
        };
    }
})