var ACTIONS_BTN = null;
$(document).ready(function() {
    ACTIONS_BTN = $("#id_LotNumberTable td.seed-row").html();
});
$(document).on("click", ".new-lot", function(){
    var html = '<tr class="lot-row">' +
                '<td><input type="text" class="form-control lot-id"></td>' +
                '<td><input type="text" class="form-control lot-number"></td>' +
                '<td>' + ACTIONS_BTN + '</td>' +
              '</tr>';
    $(".new-lot").attr("disabled", "disabled");
    $("#id_LotNumberTable").append(html);
    var row = $("#id_LotNumberTable tbody tr:last-child");
    row.find(".accept-lot, .delete-lot").toggle();
    enable_qtips(row);
});
$(document).on("click", ".accept-lot", function() {
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
        var row = $(this).parents("tr");
        var lot_id = row.find('input.lot-id').val();
        var lot_number = row.find('input.lot-number').val();
        commit_json_data(
            URL = '/lot/',
            Data = {
                Action: 'SetLotNumber',
                LotId: lot_id,
                LotNumber: lot_number
            },
            Param = {},
            OnSuccessCallback = function ( json_resp, Param ) {
                input.each(function() {
                    $(this).parent("td").html($(this).val());
                });
                clear_qtips(row);
                row.find(".accept-lot, .delete-lot").toggle();
                $(".new-lot").removeAttr("disabled");
            },
            OnErrorCallback = function ( json_resp, Param ) {
                slt_dialog(json_resp.Data);
            }
        );
    }
});
$(document).on("click", ".delete-lot", function(){
    clear_qtips($(this).parents("td"));
    $(this).parents("tr").remove();
    $(".new-lot").removeAttr("disabled");
});
