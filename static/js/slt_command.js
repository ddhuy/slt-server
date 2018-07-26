function parse_test_command ( cmd_row, cmd_data ) {
    cmd_row.find('input[name="Test"]').val(cmd_data['Test']);
    cmd_row.find('input[name="Mode"]').val(cmd_data['Mode']);
    cmd_row.find('input[name="FailStop"]').val(cmd_data['FailStop']);
    cmd_row.find('input[name="Timeout"]').val(cmd_data['Timeout']);
    cmd_row.find('input[name="Prompt"]').val(cmd_data['Prompt']);
    cmd_row.find('input[name="Command"]').val(cmd_data['Command']);
    cmd_row.find('input[name="Pass"]').val(cmd_data['Pass']);
    cmd_row.find('input[name="Fail"]').val(cmd_data['Fail']);
    cmd_row.find('input[name="Msg"]').val(cmd_data['Msg']);
    cmd_row.find('input[name="Comment"]').val(cmd_data['Comment']);
}
$(document).ready(function() {
    enable_all_qtips();
});
$(document).on('click', '.new-command', function() {
});
$(document).on('click', '.accept-command', function() {
    var cmd_row = $(this).parents('.command-row');
    var input = cmd_row.find('input');
    var cmd_data = {};
    input.each(function() {
        cmd_data[$(this).attr('name')] = $(this).val();
    });
    commit_json_data(
        URL = '/command/',
        Data = {
            Action: 'UpdateCommand',
            Arch: ArchName,
            CommandId: cmd_row.attr('data-cmd-id'),
            Data: JSON.stringify(cmd_data)
        },
        Param = {},
        OnSuccessCallback = function ( json_resp, Param ) {
            parse_test_command(cmd_row, json_resp.Data);
            input.each(function() {
                $(this).attr('disabled', 'disabled');
            });
            cmd_row.find('.accept-command, .cancel-command, .edit-command, .delete-command').toggle();
        },
        OnErrorCallback = function ( json_resp, Param ) {
            slt_dialog(json_resp.Data);
        }
    );
});
$(document).on('click', '.cancel-command', function() {
    var cmd_row = $(this).parents('.command-row');
    var orig_data = JSON.parse(cmd_row.attr('data-orig-data'));
    parse_test_command(cmd_row, orig_data);
    cmd_row.find('input').each(function() {
        $(this).attr('disabled', 'disabled');
    });
    cmd_row.find('.accept-command, .cancel-command, .edit-command, .delete-command').toggle();
});
$(document).on('click', '.edit-command', function() {
    var cmd_row = $(this).parents('.command-row');
    var input = cmd_row.find('input');
    var orig_data = {};
    input.each(function() {
        orig_data[$(this).attr('name')] = $(this).val();
        $(this).removeAttr('disabled');
    });
    cmd_row.attr('data-orig-data', JSON.stringify(orig_data));
    cmd_row.find('.accept-command, .cancel-command, .edit-command, .delete-command').toggle();
});
$(document).on('click', '.delete-command', function() {
    var cmd_row = $(this).parents('.command-row');
    slt_confirm_dialog(
        Title = 'Delete Test Command',
        Message = 'Are you sure to delete this command?',
        YesFn = function() {
            commit_json_data(
                URL = '/command/',
                Data = {
                    Action: 'DeleteCommand',
                    Arch: ArchName,
                    CommandId: cmd_row.attr('data-cmd-id')
                },
                Param = {},
                OnSuccessCallback = function ( json_resp, Param ) {
                    clear_qtips(cmd_row);
                    cmd_row.remove();
                },
                OnErrorCallback = function ( json_resp, Param ) {
                    slt_dialog(json_resp.Data);
                }
            );
        },
        NoFn = function() {
        }
    );
});
