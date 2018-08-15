var OPERATOR_ID = null;

var TEST_PLAN_ACTIONS_BTN = null;
var TEST_PLAN_TESTCFG_BTN = null;
var TEST_PLAN_BOARDST_BTN = null;

var TEST_SUITE_ENABLE_TEST = null;
var TEST_SUITE_SLT_MODES = null;
var TEST_SUITE_TESTCFG1_BTN = null;
var TEST_SUITE_TESTCFG2_BTN = null;
var TEST_SUITE_ERROR1_BTN = null;
var TEST_SUITE_ERROR2_BTN = null;
var TEST_SUITE_ACTIONS_BTN = null;

var TEST_STEP_TEST_INPUT = null;
var TEST_STEP_MODE_INPUT = null;
var TEST_STEP_FAILSTOP_INPUT = null;
var TEST_STEP_PROMPT_INPUT = null;
var TEST_STEP_COMMAND_INPUT = null;
var TEST_STEP_PASS_INPUT = null;
var TEST_STEP_FAIL_INPUT = null;
var TEST_STEP_TIMEOUT_INPUT = null;
var TEST_STEP_MESSAGE_INPUT = null;
var TEST_STEP_ACTIONS_BTN = null;

var ERRMON_NAME_INPUT = null;
var ERRMON_TYPE_INPUT = null;
var ERRMON_EXPECTED_INPUT = null;
var ERRMON_RESULT_INPUT = null;
var ERRMON_TIMEOUT_INPUT = null;
var ERRMON_MESSAGE_INPUT = null;

var current_test_plan_id = null;
var current_test_plan_name = null;
var current_test_suite_id = null;
var current_test_suite_name = null;

function read_text_file ( filetype, callback )
{
    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        var boardini_dlg = document.createElement("input");
        boardini_dlg.setAttribute("type", "file");
        boardini_dlg.setAttribute("accept", filetype);
        boardini_dlg.onchange = function(e) {
            if (!e || e.target.files.length <= 0)
                return;
            var file_reader = new FileReader();
            file_reader.onload = function (e) {
                var file_content = e.target.result;
                callback(file_content);
            };
            file_reader.readAsText(e.target.files[0]);
        };
        boardini_dlg.onclick = function() {
            this.value = null; // using DOM element itself
        };
        boardini_dlg.click();
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }
}

$(document).ready(function() {
    $("#id_Operator").select2({
        minimumResultsForSearch: Infinity
    });
    enable_all_qtips();

    TEST_PLAN_ACTIONS_BTN = $("#id_TestPlansTable td:last-child").html();
    TEST_PLAN_TESTCFG_BTN = $("#id_TestPlansTable td:nth-last-child(2)").html();
    TEST_PLAN_BOARDST_BTN = $("#id_TestPlansTable td:nth-last-child(3)").html();

    TEST_SUITE_ENABLE_TEST = $("#id_TestSuitesTable td:nth-child(1)").html();
    TEST_SUITE_SLT_MODES = $("#id_TestSuitesTable td:nth-child(3)").html();
    TEST_SUITE_TESTCFG1_BTN = $("#id_TestSuitesTable td:nth-child(4)").html();
    TEST_SUITE_TESTCFG2_BTN = $("#id_TestSuitesTable td:nth-child(5)").html();
    TEST_SUITE_ERROR1_BTN = $("#id_TestSuitesTable td:nth-child(6)").html();
    TEST_SUITE_ERROR2_BTN = $("#id_TestSuitesTable td:nth-child(7)").html();
    TEST_SUITE_ACTIONS_BTN = $("#id_TestSuitesTable td:nth-child(8)").html();

    TEST_STEP_TEST_INPUT = $("#id_TestStepsTable td:nth-child(1)").html();
    TEST_STEP_MODE_INPUT = $("#id_TestStepsTable td:nth-child(2)").html();
    TEST_STEP_FAILSTOP_INPUT = $("#id_TestStepsTable td:nth-child(3)").html();
    TEST_STEP_PROMPT_INPUT = $("#id_TestStepsTable td:nth-child(4)").html();
    TEST_STEP_COMMAND_INPUT = $("#id_TestStepsTable td:nth-child(5)").html();
    TEST_STEP_PASS_INPUT = $("#id_TestStepsTable td:nth-child(6)").html();
    TEST_STEP_FAIL_INPUT = $("#id_TestStepsTable td:nth-child(7)").html();
    TEST_STEP_TIMEOUT_INPUT = $("#id_TestStepsTable td:nth-child(8)").html();
    TEST_STEP_MESSAGE_INPUT = $("#id_TestStepsTable td:nth-child(9)").html();
    TEST_STEP_ACTIONS_BTN = $("#id_TestStepsTable td:nth-child(10)").html();

    ERRMON_NAME_INPUT = $("#id_ErrorMonitorTable td:nth-child(1)").html();
    ERRMON_TYPE_INPUT = $("#id_ErrorMonitorTable td:nth-child(2)").html();
    ERRMON_EXPECTED_INPUT = $("#id_ErrorMonitorTable td:nth-child(3)").html();
    ERRMON_RESULT_INPUT = $("#id_ErrorMonitorTable td:nth-child(4)").html();
    ERRMON_TIMEOUT_INPUT = $("#id_ErrorMonitorTable td:nth-child(5)").html();
    ERRMON_MESSAGE_INPUT = $("#id_ErrorMonitorTable td:nth-child(6)").html();
});

/***************************************
 * TEST PLANS
 ***************************************/
function set_test_plans ( ) {
    // All data is filled, commit request to add new test plan
    var data = $('.test-plan-row').map(function() {
        return {
            'ID': $(this).attr('data-test-plan-id'),
            'Name': $(this).children('td:first').text()
        }
    }).get();
    var req_data = {
        'OperatorId': OPERATOR_ID,
        'TestPlans': data
    };
    commit_json_data(
        URL = '/config/',
        Data = {
            Action: 'SetTestPlans',
            Data: JSON.stringify(req_data),
        },
        Param = {},
        OnSuccessCallback = function ( json_resp, Param ) {
            $("tr.test-plan-row").remove();
            var test_plans = json_resp.Data;
            test_plans.forEach(function(test) {
                var html = '<tr class="test-plan-row" data-test-plan-id="' + test.ID + '">' +
                            '<td>' + test.name + '</td>' +
                            '<td>' + TEST_PLAN_BOARDST_BTN + '</td>' +
                            '<td>' + TEST_PLAN_TESTCFG_BTN + '</td>' +
                            '<td>' + TEST_PLAN_ACTIONS_BTN + '</td>' +
                          '</tr>';
                $("#id_TestPlansTable").append(html);
                var row = $("#id_TestPlansTable tbody tr:last-child");
                enable_qtips(row);
            });
        },
        OnErrorCallback = function ( json_resp, Param ) {
        }
    );
}
function refresh_test_plans () {
    commit_json_data(
        URL = '/config/',
        Data = {
            Action: 'GetTestPlans',
            OperatorId: OPERATOR_ID
        },
        Param = {},
        OnSuccessCallback = function ( json_resp, Param ) {
            $("tr.test-plan-row").remove();
            var test_plans = json_resp.Data;
            test_plans.forEach(function(test) {
                var row = '<tr class="test-plan-row" data-test-plan-id="' + test.ID + '">' +
                            '<td>' + test.Text + '</td>' +
                            '<td>' + TEST_PLAN_BOARDST_BTN + '</td>' +
                            '<td>' + TEST_PLAN_TESTCFG_BTN + '</td>' +
                            '<td>' + TEST_PLAN_ACTIONS_BTN + '</td>' +
                          '</tr>';
                $("#id_TestPlansTable").append(row);
                var row = $("#id_TestPlansTable tbody tr:last-child");
                enable_qtips(row);
            });
        },
        OnErrorCallback = function ( json_resp, Param ) {
        }
    );
}
// Listen to selection change event then request data from server
$(document).on("change", "#id_Operator", function() {
    OPERATOR_ID = $("#id_Operator").val();
    if (!OPERATOR_ID)
        return false;
    refresh_test_plans();
});
// Import data from CSV files
$(document).on("click", "#id_ImportCsv", function() {
    if (!OPERATOR_ID)
        return false;
    return false;
});
// Request server to download settings/suites
$(document).on("click", "#id_ExportCsv", function() {
    if (!OPERATOR_ID)
        return false;
    return false;
});

// Append table with add row form on add new button click
$(document).on("click", ".new-test-plan", function() {
    if (!OPERATOR_ID)
        return false;
    // send generate new test plan id to server
    commit_json_data(
        URL = '/config/',
        Data = {
            Action: 'GenerateTestId',
            Data: JSON.stringify({'OperatorId': OPERATOR_ID}),
        },
        Param = {},
        OnSuccessCallback = function ( json_resp, Param ) {
            var test_id = json_resp.Data;
            // UI jobs: create new html row & add it into table
            var index = $("#id_TestPlansTable tbody tr:last-child").index();
            var html = '<tr class="test-plan-row" data-test-plan-id="' + test_id + '">' +
                        '<td><input type="text" class="form-control"></td>' +
                        '<td>' + TEST_PLAN_BOARDST_BTN + '</td>' +
                        '<td>' + TEST_PLAN_TESTCFG_BTN + '</td>' +
                        '<td>' + TEST_PLAN_ACTIONS_BTN + '</td>' +
                       '</tr>';
            $("#id_TestPlansTable").append(html);
            $(".new-test-plan").attr("disabled", "disabled");
            var row = $("#id_TestPlansTable tbody tr:last-child");
            row.find(".accept-test-plan, .edit-test-plan").toggle();
            enable_qtips(row);
        },
        OnErrorCallback = function ( json_resp, Param ) {
        }
    );
});

// Add row on add button click
$(document).on("click", ".accept-test-plan", function() {
    if (!OPERATOR_ID)
        return false;
    // check required data is filled or not
    var empty = false;
    var input = $(this).parents("tr").find('input[type="text"]');
    input.each(function() {
        if(!$(this).val()) {
            $(this).addClass("error");
            empty = true;
        } else {
            $(this).removeClass("error");
        }
    });
    $(this).parents("tr").find(".error").first().focus();
    if(!empty) {
        input.each(function() {
            $(this).parent("td").html($(this).val());
        });
        set_test_plans();
        refresh_test_plans();
        $(this).parents("tr").find(".accept-test-plan, .edit-test-plan").toggle();
        $(".new-test-plan").removeAttr("disabled");
    }
});

// Edit row on edit button click
$(document).on("click", ".edit-test-plan", function(){
    if (!OPERATOR_ID)
        return false;

    $(this).parents("tr").find("td:first-child").each(function() {
        $(this).html('<input type="text" class="form-control" value="' + $(this).text() + '">');
    });
    $(this).parents("tr").find(".accept-test-plan, .edit-test-plan").toggle();
    $(".new-test-plan").attr("disabled", "disabled");
});

// Delete row on delete button click
$(document).on("click", ".delete-test-plan", function(){
    if (!OPERATOR_ID)
        return false;
    $(this).parents("tr").remove();
    $(".new-test-plan").removeAttr("disabled");
    set_test_plans();
    refresh_test_plans();
});

/***************************************
 * BOARD SETTING
 ***************************************/
// Open board settings dialog for editing
$(document).on("click", ".edit-board-settings", function() {
    var tr = $(this).parents("tr");
    current_test_plan_id = tr.attr('data-test-plan-id');
    current_test_plan_name = tr.children("td:first").text();

    var boardsettings_dlg = $("#id_BoardSettingsDialog").dialog({
        width: 'auto',
        height: 'auto',
        modal: true,
        resizable: false,
        title: 'Edit Board Ini Settings',
        buttons: {
            'OK': function() {
                commit_json_data(
                    URL = '/config/',
                    Data = {
                        Action: 'SetBoardSettings',
                        OperatorId: OPERATOR_ID,
                        TestPlanId: current_test_plan_id,
                        BoardSettings: $("#id_BoardSettingsText").val(),
                    },
                    Param = {},
                    OnSuccessCallback = function ( json_resp, Param ) {
                        var board_settings = json_resp.Data;
                        $('#id_BoardSettingsText').val(board_settings);
                    },
                    OnErrorCallback = function ( json_resp, Param ) {
                        $('#id_BoardSettingsText').val(json_resp);
                    }
                );
                $(this).dialog('close');
            },
            'Cancel' : function() {
                $(this).dialog('close');
            }
        },
        open: function() {
            $('#id_BoardSettingsTitle').html(current_test_plan_name);
            $("#id_BoardSettingsText").val('DATA IS LOADING...');
            // set export link
            var href =  "/config/?Action=ExportBoardSettings"
                      + "&OperatorId=" + OPERATOR_ID
                      + "&TestPlanId=" + current_test_plan_id;
            $("a#id_ExportBoardSetting").attr({"href": href});
            // request board settings
            commit_json_data(
                URL = '/config/',
                Data = {
                    Action: 'GetBoardSettings',
                    OperatorId: OPERATOR_ID,
                    TestPlanId: current_test_plan_id,
                },
                Param = {},
                OnSuccessCallback = function ( json_resp, Param ) {
                    var board_settings = json_resp.Data;
                    $('#id_BoardSettingsText').val(board_settings);
                },
                OnErrorCallback = function ( json_resp, Param ) {
                    $('#id_BoardSettingsText').val(json_resp);
                }
            );
        }
    });
    boardsettings_dlg.dialog('open');
});
$(document).on("click", "#id_ImportBoardSetting", function() {
    if (!OPERATOR_ID)
        return false;
    read_text_file('.ini', function ( board_settings ) {
        commit_json_data(
            URL = '/config/',
            Data = {
                Action: 'ParseBoardSettings',
                Data: board_settings
            },
            Param = {},
            OnSuccessCallback = function ( json_resp, Param ) {
                var board_settings = json_resp.Data;
                $('#id_BoardSettingsText').val(board_settings);
            },
            OnErrorCallback = function ( json_resp, Param ) {
            }
        );
    });
    return false;
});

/***************************************
 * TEST SUITES
 ***************************************/
function add_test_suite_row ( test_suite_id, test_suite_name = null, slt_mode = null, enable = null ) {
    var index = $("#id_TestSuitesTable tbody tr:last-child").index();
    var html = '<tr class="test-suite-row" data-test-suite-id="' + test_suite_id + '">' + 
               '<td class="control-button">' + TEST_SUITE_ENABLE_TEST + '</td>';
    if (test_suite_name == null)
        html += '<td><input type="text" class="form-control"></td>';
    else
        html += '<td>' + test_suite_name + '</td>';
    html += '<td class="control-button">' + TEST_SUITE_SLT_MODES + '</td>' +
            '<td class="control-button">' + TEST_SUITE_TESTCFG1_BTN + '</td>' +
            '<td class="control-button">' + TEST_SUITE_TESTCFG2_BTN + '</td>' +
            '<td class="control-button">' + TEST_SUITE_ERROR1_BTN + '</td>' +
            '<td class="control-button">' + TEST_SUITE_ERROR2_BTN + '</td>' +
            '<td class="control-button">' + TEST_SUITE_ACTIONS_BTN + '</td>' +
           '</tr>';
    $("#id_TestSuitesTable").append(html);
    var row = $("#id_TestSuitesTable tbody tr:last-child");
    enable_qtips(row);
    if (slt_mode)
        row.find('select.sltmodes-selection').val(parseInt(slt_mode));
    if (enable)
        row.find('input[type="checkbox"]').prop("checked", parseInt(enable) ? true : false);
    if (test_suite_name == null)
        $(".new-test-suite").attr("disabled", "disabled");
    return index;
}
// Open dialog for modifying test suites
$(document).on("click", ".edit-test-suites", function() {
    var tr = $(this).parents("tr");
    current_test_plan_id = tr.attr('data-test-plan-id');
    current_test_plan_name = tr.children("td:first").text();

    var testsuites_dlg = $("#id_TestSuitesDialog").dialog({
        width: 'auto',
        height: '650',
        modal: true,
        resizable: false,
        title: 'Edit Test Suites',
        buttons: {
            'OK': function() {
                var test_suites = $('.test-suite-row').map(function() {
                    return {
                        'ID': $(this).attr('data-test-suite-id'),
                        'display': $(this).children('td:nth-child(2)').text(),
                        'mode': $(this).find('select.sltmodes-selection').val(),
                        'enable': $(this).find('input[type="checkbox"]').prop("checked") ? 1 : 0
                    }
                }).get();

                commit_json_data(
                    URL = '/config/',
                    Data = {
                        Action: 'SetTestSuites',
                        OperatorId: OPERATOR_ID,
                        TestPlanId: current_test_plan_id,
                        TestSuites: JSON.stringify(test_suites)
                    },
                    Param = {},
                    OnSuccessCallback = function ( json_resp, Param ) {
                    },
                    OnErrorCallback = function ( json_resp, Param ) {
                    }
                );
                $(this).dialog('close');
            },
            'Cancel' : function() {
                $(this).dialog('close');
            }
        },
        open: function() {
            $('#id_TestSuitesTitle').html(current_test_plan_name);
            $('tr.test-suite-row').remove();
            $(".new-test-suite").removeAttr("disabled");
            commit_json_data(
                URL = '/config/',
                Data = {
                    Action: 'GetTestSuites',
                    OperatorId: OPERATOR_ID,
                    TestPlanId: current_test_plan_id,
                },
                Param = {},
                OnSuccessCallback = function ( json_resp, Param ) {
                    var test_suites = json_resp.Data;
                    test_suites.forEach(function(test) {
                        add_test_suite_row(test.ID, test.display, test.mode, test.enable)
                    });
                },
                OnErrorCallback = function ( json_resp, Param ) {
                }
            );
        }
    });
    testsuites_dlg.dialog('open');
});
$(document).on("click", ".new-test-suite", function() {
    if (!OPERATOR_ID)
        return false;
    // send generate new test plan id to server
    commit_json_data(
        URL = '/config/',
        Data = {
            Action: 'GenerateTestId',
            Data: JSON.stringify({'OperatorId': OPERATOR_ID}),
        },
        Param = {},
        OnSuccessCallback = function ( json_resp, Param ) {
            var test_suite_id = json_resp.Data;
            // UI jobs: create new html row & add it into table
            var index = add_test_suite_row(test_suite_id);
            $("#id_TestSuitesTable tbody tr").eq(index + 1).find(".accept-test-suite, .edit-test-suite").toggle();
        },
        OnErrorCallback = function ( json_resp, Param ) {
        }
    );
});
$(document).on("click", ".accept-test-suite", function() {
    if (!OPERATOR_ID)
        return false;
    // check required data is filled or not
    var empty = false;
    var input = $(this).parents("tr").find('input[type="text"]');
    input.each(function() {
        if(!$(this).val()) {
            $(this).addClass("error");
            empty = true;
        } else {
            $(this).removeClass("error");
        }
    });
    $(this).parents("tr").find(".error").first().focus();
    if(!empty) {
        input.each(function() {
            $(this).parent("td").html($(this).val());
        });
        $(this).parents("tr").find(".accept-test-suite, .edit-test-suite").toggle();
        $(".new-test-suite").removeAttr("disabled");
    }
});
$(document).on("click", ".edit-test-suite", function(){
    if (!OPERATOR_ID)
        return false;

    $(this).parents("tr").find("td:nth-child(2)").each(function(){
        $(this).html('<input type="text" class="form-control" value="' + $(this).text() + '">');
    });     
    $(this).parents("tr").find(".accept-test-suite, .edit-test-suite").toggle();
    $(".new-test-suite").attr("disabled", "disabled");
});
$(document).on("click", ".delete-test-suite", function(){
    if (!OPERATOR_ID)
        return false;
    $(this).parents("tr").remove();
    $(".new-test-suite").removeAttr("disabled");
});
$(document).on("click", "#id_ImportTestSuites", function(){
    if (!OPERATOR_ID)
        return false;
});
$(document).on("click", "#id_ExportTestSuites", function(){
    if (!OPERATOR_ID)
        return false;
});


/***************************************
 * TEST 1 & TEST 2
 ***************************************/
function add_test_step_row ( test_data = null ) {
    var html = '<tr class="test-step-rows">' + 
                 '<td>' + TEST_STEP_TEST_INPUT + '</td>' +
                 '<td>' + TEST_STEP_MODE_INPUT + '</td>' +
                 '<td class="control-button">' + TEST_STEP_FAILSTOP_INPUT + '</td>' +
                 '<td>' + TEST_STEP_PROMPT_INPUT + '</td>' +
                 '<td>' + TEST_STEP_COMMAND_INPUT + '</td>' +
                 '<td>' + TEST_STEP_PASS_INPUT + '</td>' +
                 '<td>' + TEST_STEP_FAIL_INPUT + '</td>' +
                 '<td>' + TEST_STEP_TIMEOUT_INPUT + '</td>' +
                 '<td>' + TEST_STEP_MESSAGE_INPUT + '</td>' +
                 '<td class="control-button">' + TEST_STEP_ACTIONS_BTN + '</td>' +
              '</tr>';
    $("#id_TestStepsTable").append(html);
    var row = $("#id_TestStepsTable tbody tr:last-child");
    var input = row.find('input');
    input.each(function() {
        $(this).css({
            'border-radius': '5px',
            'font-size': '12px',
            'height': '22px',
            'padding-top': '0',
            'padding-bottom': '0',
            'padding-left': '5px',
        });
    });
    enable_qtips(row);

    if (test_data) {
        if (test_data.test)
            row.find('select.ts-test-selection').val(test_data.test);
        if (test_data.mode)
            row.find('select.ts-run-mode').val(test_data.mode);
        if (test_data.fail_stop)
            row.find('input.ts-fail-stop').prop("checked", parseInt(test_data.fail_stop) ? true : false);
        if (test_data.prompt)
            row.find('input.ts-prompt').val(test_data.prompt);
        if (test_data.cmd)
            row.find('input.ts-command').val(test_data.cmd);
        if (test_data.pass)
            row.find('input.ts-pass').val(test_data.pass);
        if (test_data.fail)
            row.find('input.ts-fail').val(test_data.fail);
        if (test_data.timeout)
            row.find('input.ts-timeout').val(parseInt(test_data.timeout));
        if (test_data.message)
            row.find('input.ts-msg').val(parseInt(test_data.message));
    }
}
function handle_teststeps_dialog ( cfg, test_plan_id, test_suite_id, test_suite_name ) {
    var test_dlg = $('#id_TestStepsDialog').dialog({
        width: '1400',
        height: '700',
        modal: true,
        resizable: false,
        closeOnEscape: true,
        title: 'Edit Test Steps',
        buttons: {
            'OK': function() {
                var test_steps = $('#id_TestStepsTable tbody tr.test-step-rows').map(function() {
                    return {
                        'test': $(this).find('select.ts-test-selection').val(),
                        'mode': $(this).find('select.ts-run-mode').val(),
                        'fail_stop': $(this).find('input.ts-fail-stop').prop("checked") ? 1 : 0,
                        'prompt': $(this).find('input.ts-prompt').val(),
                        'cmd': $(this).find('input.ts-command').val(),
                        'pass': $(this).find('input.ts-pass').val(),
                        'fail': $(this).find('input.ts-fail').val(),
                        'timeout': $(this).find('input.ts-timeout').val(),
                        'msg': $(this).find('input.ts-msg').val()
                    }
                }).get();
                commit_json_data(
                    URL = '/config/',
                    Data = {
                        Action: 'SetTestSteps',
                        OperatorId: OPERATOR_ID,
                        TestPlanId: test_plan_id,
                        TestSuiteId: test_suite_id,
                        TestSteps: JSON.stringify(test_steps),
                        CfgNumber: cfg
                    },
                    Param = {},
                    OnSuccessCallback = function ( json_resp, Param ) {
                    },
                    OnErrorCallback = function ( json_resp, Param ) {
                    }
                );
                $(this).dialog('close');
            },
            'Cancel': function() {
                $(this).dialog('close');
            }
        },
        open: function() {
            $('#id_TestStepsTitle').html(test_suite_name);
            $('tr.test-step-rows').remove();
            commit_json_data(
                URL = '/config/',
                Data = {
                    Action: 'GetTestSteps',
                    OperatorId: OPERATOR_ID,
                    TestPlanId: test_plan_id,
                    TestSuiteId: test_suite_id,
                    CfgNumber: cfg
                },
                Param = {},
                OnSuccessCallback = function ( json_resp, Param ) {
                    var test_steps = json_resp.Data;
                    test_steps.forEach(function(test) {
                        add_test_step_row(test);
                    });
                },
                OnErrorCallback = function ( json_resp, Param ) {
                }
            );
        }
    });
    test_dlg.data('CfgNumber', cfg).dialog('open');
}
$(document).on('click', '.edit-test-1', function() {
    current_test_suite_id = $(this).parents('tr').attr('data-test-suite-id');
    current_test_suite_name = $(this).parents('tr').children('td:nth-child(2)').text();
    handle_teststeps_dialog(1, current_test_plan_id, current_test_suite_id, current_test_suite_name); 
});
$(document).on('click', '.edit-test-2', function() {
    current_test_suite_id = $(this).parents('tr').attr('data-test-suite-id');
    current_test_suite_name = $(this).parents('tr').children('td:nth-child(2)').text();
    handle_teststeps_dialog(2, current_test_plan_id, current_test_suite_id, current_test_suite_name);
});
$(document).on('click', '.new-test-step', function() {
    if (!OPERATOR_ID)
        return false;
    add_test_step_row();
});
$(document).on('click', '.delete-test-step', function() {
    if (!OPERATOR_ID)
        return false;
    $(this).parents("tr").remove();
});
$(document).on('click', '#id_ImportTestSteps', function() {
    if (!OPERATOR_ID)
        return false;
    read_text_file('.csv', function ( test_steps ) {
        commit_json_data(
            URL = '/config/',
            Data = {
                Action: 'ParseTestSteps',
                OperatorId: OPERATOR_ID,
                Data: test_steps,
                CfgNumber: $('#id_TestStepsDialog').data('CfgNumber')
            },
            Param = {},
            OnSuccessCallback = function ( json_resp, Param ) {
                $('tr.test-step-rows').remove();
                var test_steps = json_resp.Data;
                test_steps.forEach(function(test) {
                    add_test_step_row(test);
                });
            },
            OnErrorCallback = function ( json_resp, Param ) {
            }
        );
    });
    return false;
});
$(document).on('click', '#id_ExportTestSteps', function() {
    if (!OPERATOR_ID)
        return false;
});

/***************************************
 * ERROR MONITOR 1 & 2
 ***************************************/
function import_error_rules ( error_rules ) {
}
function export_error_rules ( ) {
}
function add_monitor_row ( monitor_rule ) {
    var html = '<tr class="monitor-rows">' + 
                 '<td>' + ERRMON_NAME_INPUT + '</td>' +
                 '<td>' + ERRMON_TYPE_INPUT + '</td>' +
                 '<td>' + ERRMON_EXPECTED_INPUT + '</td>' +
                 '<td>' + ERRMON_RESULT_INPUT + '</td>' +
                 '<td>' + ERRMON_TIMEOUT_INPUT + '</td>' +
                 '<td>' + ERRMON_MESSAGE_INPUT + '</td>' +
                 '<td class="control-button">' + TEST_STEP_ACTIONS_BTN + '</td>' +
               '</tr>';
    $("#id_ErrorMonitorTable").append(html);
    var row = $("#id_ErrorMonitorTable tbody tr:last-child");
    var input = row.find('input');
    input.each(function() {
        $(this).css({
            'border-radius': '5px',
            'font-size': '12px',
            'height': '22px',
            'padding-top': '0',
            'padding-bottom': '0',
            'padding-left': '5px',
        });
    });
    enable_qtips(row);

    if (monitor_rule) {
        if (monitor_rule.name)
            row.find('input.em-name').val(monitor_rule.name);
        if (monitor_rule.type)
            row.find('input.em-type').val(monitor_rule.type);
        if (monitor_rule.expected)
            row.find('input.em-expected').val(monitor_rule.expected);
        if (monitor_rule.result)
            row.find('input.ts-result').val(monitor_rule.result);
        if (monitor_rule.timeout)
            row.find('input.ts-timeout').val(monitor_rule.timeout);
        if (monitor_rule.msg)
            row.find('input.ts-msg').val(monitor_rule.msg);
    }
}
function handle_errormonitor_dialog ( number, test_plan_id, test_suite_id, test_suite_name ) {
    var errmon_dlg = $("#id_ErrorMonitorDialog").dialog({
        width: '1000',
        height: '700',
        modal: true,
        resizable: false,
        closeOnEscape: true,
        title: 'Edit Error Monitor',
        buttons: {
            'OK': function() {
                var monitor_rules = $('#id_ErrorMonitorTable tbody tr.monitor-rows').map(function() {
                    return {
                        'name': $(this).find('input.em-name').val(),
                        'type': $(this).find('input.em-type').val(),
                        'expected': $(this).find('input.em-expected').val(),
                        'result': $(this).find('input.em-result').val(),
                        'timeout': $(this).find('input.em-timeout').val(),
                        'msg': $(this).find('input.em-msg').val(),
                    }
                }).get();
                commit_json_data(
                    URL = '/config/',
                    Data = {
                        Action: 'SetErrorMonitor',
                        OperatorId: OPERATOR_ID,
                        TestPlanId: test_plan_id,
                        TestSuiteId: test_suite_id,
                        MonitorRules: JSON.stringify(monitor_rules),
                        Number: number
                    },
                    Param = {},
                    OnSuccessCallback = function ( json_resp, Param ) {
                    },
                    OnErrorCallback = function ( json_resp, Param ) {
                    }
                );
                $(this).dialog('close');
            },
            'Cancel': function() {
                $(this).dialog('close');
            }
        },
        open: function() {
            $('#id_ErrorMonitorTitle').html(test_suite_name);
            $('tr.monitor-rows').remove();
            commit_json_data(
                URL = '/config/',
                Data = {
                    Action: 'GetErrorMonitor',
                    OperatorId: OPERATOR_ID,
                    TestPlanId: test_plan_id,
                    TestSuiteId: test_suite_id,
                    Number: number
                },
                Param = {},
                OnSuccessCallback = function ( json_resp, Param ) {
                    var monitor_rules = json_resp.Data;
                    monitor_rules.forEach(function(test) {
                        add_monitor_row(test);
                    });
                },
                OnErrorCallback = function ( json_resp, Param ) {
                }
            );
        }
    });
}
$(document).on('click', '.edit-error-1', function() {
    current_test_suite_id = $(this).parents('tr').attr('data-test-suite-id');
    current_test_suite_name = $(this).parents('tr').children('td:nth-child(2)').text();
    handle_errormonitor_dialog(1, current_test_plan_id, current_test_suite_id, current_test_suite_name);
});
$(document).on('click', '.edit-error-2', function() {
    current_test_suite_id = $(this).parents('tr').attr('data-test-suite-id');
    current_test_suite_name = $(this).parents('tr').children('td:nth-child(2)').text();
    handle_errormonitor_dialog(2, current_test_plan_id, current_test_suite_id, current_test_suite_name);
});
$(document).on('click', '.new-monitor-rule', function() {
    if (!OPERATOR_ID)
        return false;
    add_monitor_row();
});
$(document).on('click', '.delete-monitor-rule', function() {
    if (!OPERATOR_ID)
        return false;
    $(this).parents("tr").remove();
});
$(document).on('click', '#id_ImportErrorMonitor', function() {
    if (!OPERATOR_ID)
        return false;
});
$(document).on('click', '#id_ExportErrorMonitor', function() {
    if (!OPERATOR_ID)
        return false;
});
