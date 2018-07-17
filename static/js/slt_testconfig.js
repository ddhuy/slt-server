var ACTIONS_BTN = null;
var TESTCFG_BTN = null;
var BOARDST_BTN = null;
var OPERATOR_ID = null;

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
    // request board settings & test configs from server

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
    // send create new test plan to server
    commit_json_data();
    // UI jobs: create new html row & add it into table
    $(this).attr("disabled", "disabled");
    var index = $("table tbody tr:last-child").index();
    var row = '<tr>' +
        '<td><input type="text" class="form-control" name="description" id="description"></td>' +
        '<td>' + TESTCFG_BTN + '</td>' +
        '<td>' + BOARDST_BTN + '</td>' +
        '<td>' + ACTIONS_BTN + '</td>' +
    '</tr>';
    $("table").append(row);     
    $("table tbody tr").eq(index + 1).find(".add, .edit").toggle();
    $('[data-toggle="tooltip"]').tooltip();
});
$(document).on("click", ".add", function(){
    if (!OPERATOR_ID)
        return;

    var empty = false;
    var input = $(this).parents("tr").find('input[type="text"]');
    input.each(function(){
        if(!$(this).val()){
            $(this).addClass("error");
            empty = true;
        } else{
            $(this).removeClass("error");
        }
    });
    $(this).parents("tr").find(".error").first().focus();
    if(!empty){
        input.each(function(){
            $(this).parent("td").html($(this).val());
        });         
        $(this).parents("tr").find(".add, .edit").toggle();
        $(".add-new").removeAttr("disabled");
        // commit json: add new test or edit existing test
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
    $(".add-new").removeAttr("disabled");
});
