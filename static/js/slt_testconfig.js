var ACTIONS_BTN = null;
var TESTCFG_BTN = null;
var BOARDST_BTN = null;
var OPERATOR_ID = null;

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

function set_test_plans ( ) {
    // All data is filled, commit request to add new test plan
    var data = $('.test_plan_row').map(function() {
        return {
            'ID': $(this).attr('data-test-id'),
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
            Action: 'SetTestPlan',
            Data: JSON.stringify(req_data),
        },
        Param = {},
        OnSuccessCallback = function ( json_resp, Param ) {
            $("tr.test_plan_row").remove();
            var test_plans = json_resp.Data;
            test_plans.forEach(function(test) {
                var index = $("#id_TestPlansTable tbody tr:last-child").index();
                var row = '<tr class="test_plan_row" data-test-id="' + test.ID + '">' +
                            '<td>' + test.name + '</td>' +
                            '<td>' + BOARDST_BTN + '</td>' +
                            '<td>' + TESTCFG_BTN + '</td>' +
                            '<td>' + ACTIONS_BTN + '</td>' +
                          '</tr>';
                $("#id_TestPlansTable").append(row);
                // $("table tbody tr").eq(index + 1).find(".accept-test-plan, .edit-test-plan").toggle();
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
            Action: 'GetTestPlan',
            OperatorId: OPERATOR_ID
        },
        Param = {},
        OnSuccessCallback = function ( json_resp, Param ) {
            $("tr.test_plan_row").remove();
            var test_plans = json_resp.Data;
            test_plans.forEach(function(test) {
                var index = $("#id_TestPlansTable tbody tr:last-child").index();
                var row = '<tr class="test_plan_row" data-test-id="' + test.ID + '">' +
                            '<td>' + test.name + '</td>' +
                            '<td>' + BOARDST_BTN + '</td>' +
                            '<td>' + TESTCFG_BTN + '</td>' +
                            '<td>' + ACTIONS_BTN + '</td>' +
                          '</tr>';
                $("#id_TestPlansTable").append(row);
                enable_qtip();
            });
        },
        OnErrorCallback = function ( json_resp, Param ) {
        }
    );
}

$(document).ready(function() {
    enable_qtip();
    $("#id_Operator").select2();

    // save static buttons at the beginning
    ACTIONS_BTN = $("#id_TestPlansTable td:last-child").html();
    TESTCFG_BTN = $("#id_TestPlansTable td:nth-last-child(2)").html();
    BOARDST_BTN = $("#id_TestPlansTable td:nth-last-child(3)").html();

});

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
// Request server to download settings/configurations
$(document).on("click", "#id_ExportCsv", function(){
    if (!OPERATOR_ID)
        return;
});

// Append table with add row form on add new button click
$(document).on("click", ".new-test-plan", function(){
    if (!OPERATOR_ID)
        return;
    // send generate new test plan id to server
    var add_new_btn = $(this);
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
            add_new_btn.attr("disabled", "disabled");
            var index = $("#id_TestPlansTable tbody tr:last-child").index();
            var row = '<tr class="test_plan_row" data-test-id="' + test_id + '">' +
                        '<td><input type="text" class="form-control"></td>' +
                        '<td>' + BOARDST_BTN + '</td>' +
                        '<td>' + TESTCFG_BTN + '</td>' +
                        '<td>' + ACTIONS_BTN + '</td>' +
                      '</tr>';
            $("#id_TestPlansTable").append(row);
            $("#id_TestPlansTable tbody tr").eq(index + 1).find(".accept-test-plan, .edit-test-plan").toggle();
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
        $(this).parents("tr").find(".accept-test-plan, .edit-test-plan").toggle();
        set_test_plans();
        refresh_test_plans();
        $(".add-new").removeAttr("disabled");
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
    $(".add-new").attr("disabled", "disabled");
});

// Delete row on delete button click
$(document).on("click", ".delete-test-plan", function(){
    if (!OPERATOR_ID)
        return;
    $(this).parents("tr").remove();
    set_test_plans();
    refresh_test_plans();
    $(".add-new").removeAttr("disabled");
});

// Open board settings dialog for editing
$(document).on("click", ".edit-board-settings", function() {
    var tr = $(this).parents("tr");
    var test_plan_id = tr.attr('data-test-id');
    var test_plan_name = tr.children("td:first").text();

    var boardsettings_dlg = $("#id_BoardSettingsDialog").dialog({
        width: 'auto',
        height: 'auto',
        modal: true,
        resizable: false,
        title: 'Edit Board Ini Settings',
        buttons: {
            'OK': function() {
                $(this).dialog('close');
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

// Open test configurations dialog for modifying test suites
$(document).on("click", ".edit-test-configurations", function() {
    var tr = $(this).parents("tr");
    var test_plan_id = tr.attr('data-test-id');
    var test_plan_name = tr.children("td:first").text();
    alert(test_plan_id + ': ' + test_plan_name);
});
