function clear_bench_info ( ) {
    $('#id_BenchNumber').val();
    $('#id_Architecture').val();
    $('#id_BoardSerial').val();
    $('#id_SocketSerial').val();
    $('#id_HardwareInfo').val();
}

function display_bench_info ( bench_info ) {
    $('#id_BenchNumber').val(bench_info.Number);
    $('#id_Architecture').val(bench_info.Architecture.id);
    $('#id_BoardSerial').val(bench_info.BoardSerial);
    $('#id_SocketSerial').val(bench_info.SocketSerial);
    $('#id_HardwareInfo').val(bench_info.HardwareInfo);
}

$(document).on('click', '.edit_bench', function() {
    var bench_id = $(this).parents('tr').attr('id');
    var edit_bench_dlg = $('#id_BenchInfoDialog').dialog({
        width: 'auto',
        height: 'auto',
        modal: true,
        resizable: false,
        title: 'Edit Bench Infos',
        buttons: {
            'OK': function() {
                var bench_number = $('#id_BenchNumber').val();
                var arch_id = $('#id_Architecture').val();
                var board_serial = $('#id_BoardSerial').val();
                var socket_serial = $('#id_SocketSerial').val();
                var hardware_info = $('#id_HardwareInfo').val();
                commit_json_data(
                    URL = '/bench/',
                    Data = {
                        Action: 'SetBenchInfo',
                        BenchId: bench_id,
                        ArchId: arch_id,
                        BenchNumber: bench_number,
                        BoardSerial: board_serial,
                        SocketSerial: socket_serial,
                        HardwareInfo: hardware_info,
                    },
                    Param = {},
                    OnSuccessCallback = function ( json_resp, Param ) {
                        var bench_info = json_resp.Data;
                        display_bench_info(bench_info);
                    }
                );
                $(this).dialog('close');
            },
            'Cancel' : function() {
                $(this).dialog('close');
            }
        },
        open: function() {
            commit_json_data(
                URL = '/bench/',
                Data = {
                    Action: 'GetBenchInfo',
                    BenchId: bench_id
                },
                Param = {},
                OnSuccessCallback = function ( json_resp, Param ) {
                    var bench_info = json_resp.Data;
                    display_bench_info(bench_info);
                }
            );
        }
    });
    edit_bench_dlg.dialog('open');
});