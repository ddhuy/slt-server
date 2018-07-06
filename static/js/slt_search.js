function clear_search() {
    $("#id_TestNanme").val('');
    $("#id_PartId").val('');
    $("#id_Slt").val('');
    $("#id_Operator").val('');
    $("#id_FromDate").val('');
    $("#id_ToDate").val('');
    $("#id_Result").val('');
    $("#id_LotNum").val('');
    $("#id_BenchNum").val('');
    $("#id_BoardSerial").val('');
}

function enable_select2 ( element_id ) {
    element_id.select2({
        tags: true,
        createTag: function ( params ) {
            var term = $.trim(params.term);
            if (element_id.filter(function() { return $(this).text === term; }).length === 0) {
                return {
                    id: term,
                    text: term,
                    newTag: true
                };
            }
            else
                return null;
        }
    });
}

function enable_qtip ( element_id, qtip_text ) {
    $('[data-tooltip != ""]').qtip({ // Grab all elements with a non-blank data-tooltip attr.
        content: {
            attr: 'data-tooltip' // Tell qTip2 to look inside this attr for its content
        },
        position: {
            target: 'mouse', // Track the mouse as the positioning target
            adjust: { x: 5, y: 5 } // Offset it slightly from under the mouse
        }
    })
}

function enable_datepicker ( element_id ) {
    // element_id.datepicker({
    //     firstDay: 1
    // });
}

$(document).ready(function() {
    $(document).ajaxStart(function () {
        $('#id_loading').show();
    }).ajaxStop(function () {
        $('#id_loading').hide();
    });

    enable_select2($('#id_PartId'));
    enable_select2($('#id_LotNum'));
    enable_select2($('#id_BenchNum'));
    enable_select2($('#id_BoardSerial'));
    enable_select2($('#id_TestName'));
    enable_select2($('#id_Operator'));
    enable_select2($('#id_FailSign'));
    enable_select2($('#id_ExecDate'));
    enable_select2($('#id_TestEnv'));
    enable_select2($('#id_SocketSerial'));

    enable_qtip($('#id_PartId'), 'ECID & CPUID');

    enable_datepicker($("#id_FromDate"));
    enable_datepicker($("#id_ToDate"))

    clear_search();

    $('#id_Search').click(function() {
        var TestName = $('#id_TestName').val();
        var PartId = $('#id_PartId').val();
        var OperatorId = $('#id_Operator').val();
        var FromDate = $('#id_FromDate').val();
        var ToDate = $('#id_ToDate').val();
        var Result = $('#id_Result').val();
        var LotNum = $('#id_LotNum').val();
        var BenchNum = $('#id_BenchNum').val();
        var TestEnv = $('#id_TestEnv').val();
        var BoardSerial = $('#id_BoardSerial').val();
        var SocketSerial = $('#id_SocketSerial').val();

        var search_req = {};
        if (TestName && TestName.length > 0)
            search_req['TestName'] = TestName;
        if (PartId && PartId.length > 0)
            search_req['PartId'] = PartId;
        if (OperatorId && OperatorId.length > 0)
            search_req['Operator'] = OperatorId;
        if (Result && Result.length > 0)
            search_req['Result'] = Result;
        if (FromDate && FromDate.length > 0)
            search_req['From'] = FromDate;
        if (ToDate && ToDate.length > 0)
            search_req['To'] = ToDate;
        if (LotNum && LotNum.length > 0)
            search_req['LotNum'] = LotNum;
        if (BenchNum && BenchNum.length > 0)
            search_req['BenchNum'] = BenchNum;
        if (TestEnv && TestEnv.length > 0)
            search_req['TestEnvironments'] = TestEnv;
        if (BoardSerial && BoardSerial.length > 0)
            search_req['BoardSerial'] = BoardSerial;
        if (SocketSerial && SocketSerial.length > 0)
            search_req['SocketSerial'] = SocketSerial;

        // var queryString = location.search.substring(1);
        // var re = /([^&=]+)=([^&]*)/g, m;
        // Creates a map with the query string parameters
        // while (m = re.exec(queryString)) {
        //     search_req[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        // }

        /*
         * Replace the query portion of the URL.
         * jQuery.param() -> create a serialized representation of an array or
         *     object, suitable for use in a URL query string or Ajax request.
         */
        // var url = '/search/?' + $.param(search_req);
        // window.history.pushState(', ', url); // Causes page to reload

        commit_json_data(
            URL = '/search/' + ArchName +'/' + SummMode + '/',
            Data = {
                Action: 'GetTestResult',
                Data: JSON.stringify(search_req)                
            },
            Param = {},
            OnSuccessCallback = function ( json_resp, Param ) {
                if (json_resp.Errno == 0) {
                    // if (ViewMode == VM_PRODUCTION) {
                    //     var summary_list = bind_search_result_production(json_resp.Data);
                    //     calculate_statistic_production(summary_list);
                    // } else {
                    //     var summary_list = bind_search_result(json_resp.Data);
                    //     calculate_statistic(summary_list);
                    // }
                } else {
                    clear_search();
                    slt_dialog(json_resp.Message);
                }
            },
            OnErrorCallback = function ( json_resp, Param ) {
                clear_search();
                slt_dialog(json_resp.Message);
            });

        return false;
    });
});