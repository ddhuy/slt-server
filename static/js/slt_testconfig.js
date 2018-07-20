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

function enable_qtip ( ) {
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

$(document).ready(function() {
    $("#id_Operator").select2({
        minimumResultsForSearch: Infinity
    });
    enable_qtip();

    // test plans buttons
    TEST_PLAN_ACTIONS_BTN = $("#id_TestPlansTable td:last-child").html();
    TEST_PLAN_TESTCFG_BTN = $("#id_TestPlansTable td:nth-last-child(2)").html();
    TEST_PLAN_BOARDST_BTN = $("#id_TestPlansTable td:nth-last-child(3)").html();
    // test suites buttons
    TEST_SUITE_ENABLE_TEST = $("#id_TestSuitesTable td:nth-child(1)").html();
    TEST_SUITE_SLT_MODES = $("#id_TestSuitesTable td:nth-child(3)").html();
    TEST_SUITE_TESTCFG1_BTN = $("#id_TestSuitesTable td:nth-child(4)").html();
    TEST_SUITE_TESTCFG2_BTN = $("#id_TestSuitesTable td:nth-child(5)").html();
    TEST_SUITE_ERROR1_BTN = $("#id_TestSuitesTable td:nth-child(6)").html();
    TEST_SUITE_ERROR2_BTN = $("#id_TestSuitesTable td:nth-child(7)").html();
    TEST_SUITE_ACTIONS_BTN = $("#id_TestSuitesTable td:nth-child(8)").html();

});

/***************************************
 * TEST SUITE
 ***************************************/
function set_test_plans ( ) {
    // All data is filled, commit request to add new test plan
    var data = $('.test_plan_row').map(function() {
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
            $("tr.test_plan_row").remove();
            var test_plans = json_resp.Data;
            test_plans.forEach(function(test) {
                var row = '<tr class="test_plan_row" data-test-plan-id="' + test.ID + '">' +
                            '<td>' + test.name + '</td>' +
                            '<td>' + TEST_PLAN_BOARDST_BTN + '</td>' +
                            '<td>' + TEST_PLAN_TESTCFG_BTN + '</td>' +
                            '<td>' + TEST_PLAN_ACTIONS_BTN + '</td>' +
                          '</tr>';
                $("#id_TestPlansTable").append(row);
                enable_qtip();
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
            $("tr.test_plan_row").remove();
            var test_plans = json_resp.Data;
            test_plans.forEach(function(test) {
                var row = '<tr class="test_plan_row" data-test-plan-id="' + test.ID + '">' +
                            '<td>' + test.name + '</td>' +
                            '<td>' + TEST_PLAN_BOARDST_BTN + '</td>' +
                            '<td>' + TEST_PLAN_TESTCFG_BTN + '</td>' +
                            '<td>' + TEST_PLAN_ACTIONS_BTN + '</td>' +
                          '</tr>';
                $("#id_TestPlansTable").append(row);
                enable_qtip();
            });
        },
        OnErrorCallback = function ( json_resp, Param ) {
        }
    );
}
// Listen to selection change event then request data from server
$(document).on("change", "#id_Operator", function(){
    OPERATOR_ID = $("#id_Operator").val();
    if (!OPERATOR_ID)
        return;
    refresh_test_plans()
});
// Import data from CSV files
$(document).on("click", "#id_ImportCsv", function(){
    if (!OPERATOR_ID)
        return;
});
// Request server to download settings/suites
$(document).on("click", "#id_ExportCsv", function(){
    if (!OPERATOR_ID)
        return;
});

// Append table with add row form on add new button click
$(document).on("click", ".new-test-plan", function(){
    if (!OPERATOR_ID)
        return;
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
            var row = '<tr class="test_plan_row" data-test-plan-id="' + test_id + '">' +
                        '<td><input type="text" class="form-control"></td>' +
                        '<td>' + TEST_PLAN_BOARDST_BTN + '</td>' +
                        '<td>' + TEST_PLAN_TESTCFG_BTN + '</td>' +
                        '<td>' + TEST_PLAN_ACTIONS_BTN + '</td>' +
                      '</tr>';
            $("#id_TestPlansTable").append(row);
            $("#id_TestPlansTable tbody tr").eq(index + 1).find(".accept-test-plan, .edit-test-plan").toggle();
            $(".new-test-plan").attr("disabled", "disabled");
            enable_qtip();
        },
        OnErrorCallback = function ( json_resp, Param ) {
        }
    );
});

// Add row on add button click
$(document).on("click", ".accept-test-plan", function() {
    if (!OPERATOR_ID)
        return;
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
        return;

    $(this).parents("tr").find("td:first-child").each(function(){
        $(this).html('<input type="text" class="form-control" value="' + $(this).text() + '">');
    });
    $(this).parents("tr").find(".accept-test-plan, .edit-test-plan").toggle();
    $(".new-test-plan").attr("disabled", "disabled");
});

// Delete row on delete button click
$(document).on("click", ".delete-test-plan", function(){
    if (!OPERATOR_ID)
        return;
    $(this).parents("tr").remove();
    $(".new-test-plan").removeAttr("disabled");
    set_test_plans();
    refresh_test_plans();
});

// Open board settings dialog for editing
$(document).on("click", ".edit-board-settings", function() {
    var tr = $(this).parents("tr");
    var test_plan_id = tr.attr('data-test-plan-id');
    var test_plan_name = tr.children("td:first").text();

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
                        TestPlanId: test_plan_id,
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
            $('#id_BoardSettingsTitle').html(test_plan_name);
            $("#id_BoardSettingsText").val('DATA IS LOADING...');
            commit_json_data(
                URL = '/config/',
                Data = {
                    Action: 'GetBoardSettings',
                    OperatorId: OPERATOR_ID,
                    TestPlanId: test_plan_id,
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

/***************************************
 * TEST SUITES
 ***************************************/
function add_test_suite_row ( test_suite_id, test_suite_name = null, slt_mode = null, enable = null ) {
    var index = $("#id_TestSuitesTable tbody tr:last-child").index();
    var row = '<tr class="test_suite_row" data-test-suite-id="' + test_suite_id + '">' + 
               '<td class="control-button">' + TEST_SUITE_ENABLE_TEST + '</td>';
    if (test_suite_name == null)
        row += '<td><input type="text" class="form-control"></td>';
    else
        row += '<td>' + test_suite_name + '</td>';
    row += '<td class="control-button">' + TEST_SUITE_SLT_MODES + '</td>' +
           '<td class="control-button">' + TEST_SUITE_TESTCFG1_BTN + '</td>' +
           '<td class="control-button">' + TEST_SUITE_TESTCFG2_BTN + '</td>' +
           '<td class="control-button">' + TEST_SUITE_ERROR1_BTN + '</td>' +
           '<td class="control-button">' + TEST_SUITE_ERROR2_BTN + '</td>' +
           '<td class="control-button">' + TEST_SUITE_ACTIONS_BTN + '</td>' +
          '</tr>';
    $("#id_TestSuitesTable").append(row);
    enable_qtip();
    if (slt_mode)
        $("#id_TestSuitesTable tbody tr").eq(index + 1).find('select[class="sltmodes-selection"]').val(slt_mode);
    if (enable)
        $("#id_TestSuitesTable tbody tr").eq(index + 1).find('input[type="checkbox"]').prop("checked", enable ? true : false);
    if (test_suite_name == null)
        $(".new-test-suite").attr("disabled", "disabled");
    return index;
}
// Open dialog for modifying test suites
$(document).on("click", ".edit-test-suites", function() {
    var tr = $(this).parents("tr");
    var test_plan_id = tr.attr('data-test-plan-id');
    var test_plan_name = tr.children("td:first").text();

    var testsuites_dlg = $("#id_TestSuitesDialog").dialog({
        width: 'auto',
        height: 'auto',
        modal: true,
        resizable: false,
        title: 'Edit Test Suites',
        buttons: {
            'OK': function() {
                var test_suites = $('.test_suite_row').map(function() {
                    return {
                        'ID': $(this).attr('data-test-suite-id'),
                        'display': $(this).children('td:nth-child(2)').text(),
                        'mode': $(this).find('select[class="sltmodes-selection"]').val(),
                        'enable': $(this).find('input[type="checkbox"]').prop("checked") ? 1 : 0
                    }
                }).get();

                commit_json_data(
                    URL = '/config/',
                    Data = {
                        Action: 'SetTestSuites',
                        OperatorId: OPERATOR_ID,
                        TestPlanId: test_plan_id,
                        TestSuites: JSON.stringify(test_suites)
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
                $(this).dialog('close');
            },
            'Cancel' : function() {
                $(this).dialog('close');
            }
        },
        open: function() {
            $('#id_TestSuitesTitle').html(test_plan_name);
            $('tr.test_suite_row').remove();
            commit_json_data(
                URL = '/config/',
                Data = {
                    Action: 'GetTestSuites',
                    OperatorId: OPERATOR_ID,
                    TestPlanId: test_plan_id,
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
$(document).on("click", ".new-test-suite", function(){
    if (!OPERATOR_ID)
        return;
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
        return;
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
        return;

    $(this).parents("tr").find("td:nth-child(2)").each(function(){
        $(this).html('<input type="text" class="form-control" value="' + $(this).text() + '">');
    });     
    $(this).parents("tr").find(".accept-test-suite, .edit-test-suite").toggle();
    $(".new-test-suite").attr("disabled", "disabled");
});
$(document).on("click", ".delete-test-suite", function(){
    if (!OPERATOR_ID)
        return;
    $(this).parents("tr").remove();
    $(".new-test-suite").removeAttr("disabled");
});
