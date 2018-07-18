var ACTIONS_BTN = null;
var TESTCFG_BTN = null;
var BOARDST_BTN = null;
var OPERATOR_ID = null;

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
                var index = $("table tbody tr:last-child").index();
                var row = '<tr class="test_plan_row" data-test-id="' + test.ID + '">' +
                            '<td>' + test.name + '</td>' +
                            '<td>' + BOARDST_BTN + '</td>' +
                            '<td>' + TESTCFG_BTN + '</td>' +
                            '<td>' + ACTIONS_BTN + '</td>' +
                          '</tr>';
                $("table").append(row);
                // $("table tbody tr").eq(index + 1).find(".add, .edit").toggle();
                $('[data-toggle="tooltip"]').tooltip();
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
                var index = $("table tbody tr:last-child").index();
                var row = '<tr class="test_plan_row" data-test-id="' + test.ID + '">' +
                            '<td>' + test.name + '</td>' +
                            '<td>' + BOARDST_BTN + '</td>' +
                            '<td>' + TESTCFG_BTN + '</td>' +
                            '<td>' + ACTIONS_BTN + '</td>' +
                          '</tr>';
                $("table").append(row);
                // $("table tbody tr").eq(index + 1).find(".add, .edit").toggle();
                $('[data-toggle="tooltip"]').tooltip();
            });
        },
        OnErrorCallback = function ( json_resp, Param ) {
        }
    );
}

$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip();
    $("#id_Operator").select2();

    // save static buttons at the beginning
    ACTIONS_BTN = $("table td:last-child").html();
    TESTCFG_BTN = $("table td:nth-last-child(2)").html();
    BOARDST_BTN = $("table td:nth-last-child(3)").html();

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
$(document).on("click", ".add-new", function(){
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
            var index = $("table tbody tr:last-child").index();
            var row = '<tr class="test_plan_row" data-test-id="' + test_id + '">' +
                        '<td><input type="text" class="form-control"></td>' +
                        '<td>' + BOARDST_BTN + '</td>' +
                        '<td>' + TESTCFG_BTN + '</td>' +
                        '<td>' + ACTIONS_BTN + '</td>' +
                      '</tr>';
            $("table").append(row);
            $("table tbody tr").eq(index + 1).find(".add, .edit").toggle();
            $('[data-toggle="tooltip"]').tooltip();
        },
        OnErrorCallback = function ( json_resp, Param ) {
        }
    );
});

// Add row on add button click
$(document).on("click", ".add", function() {
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
        $(this).parents("tr").find(".add, .edit").toggle();
        set_test_plans();
        refresh_test_plans();
        $(".add-new").removeAttr("disabled");
    }
});

// Edit row on edit button click
$(document).on("click", ".edit", function(){
    if (!OPERATOR_ID)
        return;

    $(this).parents("tr").find("td:first-child").each(function(){
        $(this).html('<input type="text" class="form-control" value="' + $(this).text() + '">');
    });     
    $(this).parents("tr").find(".add, .edit").toggle();
    $(".add-new").attr("disabled", "disabled");
});

// Delete row on delete button click
$(document).on("click", ".delete", function(){
    if (!OPERATOR_ID)
        return;
    $(this).parents("tr").remove();
    set_test_plans();
    refresh_test_plans();
    $(".add-new").removeAttr("disabled");
});
