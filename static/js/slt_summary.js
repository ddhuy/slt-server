var test_result_tbl;

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

function convert_testenv ( testenv_str ) {
    try {
        if ((testenv_str == null) || (testenv_str == ""))
            return "";
        // try to valid the json string
        var testenv_obj = JSON.parse(testenv_str);
        var ret_str = "";
        // parse to string
        for (var k in testenv_obj) {
            if (testenv_obj.hasOwnProperty(k)) {
                ret_str += k + ": " + testenv_obj[k] + "<br/>";
            }
        }
        return ret_str;
    } catch (e) {
        return ""
    }
}

function convert_testenv_short ( testenv_str ) {
    try {
        if ((testenv_str == null) || (testenv_str == ""))
            return "";
        // try to valid the json string
        var testenv_obj = JSON.parse(testenv_str);
        var ret_str = "";
        // parse to string
        var testenv_short = ["CPU Clock"];
        for (var i in testenv_short) {
            var k = testenv_short[i];
            if (testenv_obj.hasOwnProperty(k)) {
                ret_str += k + ": " + testenv_obj[k] + "</br>";
            }
        }
        return ret_str;
    } catch (e) {
        return ""
    }
}

function build_summary_list_by_board ( search_results ) {

}

function build_summary_list_by_cpuid ( search_results ) {
    // clear the old list
    var summary_list = [];
    // Convert Search Results to local data list for later usage
    for (var i in search_results) {
        var result = search_results[i];
        var found = 0;
        for (var j in summary_list) {
            var summary = summary_list[j];
            if (summary.CPUID == result['CPUID'] && summary.LotNumber.ID == result['LotNumber'].ID) {
                summary.TotalResult = (summary.LatestResult == 'FAIL') ? 'FAIL' : summary.TotalResult;
                summary.Summary.push(result);
                found = 1;
                break;
            } // end if
        } // end summary_list loop
        if (found == 0) {
            summary_list.push({
                ID : result['id'],
                CPUID    : result['CPUID'],
                LotNumber : result['LotNumber'],
                LatestResult : result['Result'].toUpperCase(),
                TotalResult  : result['Result'].toUpperCase(),
                Summary : [result],
            });
        } // end if
    } // end search_results loop
    return summary_list;
}

function build_summary_list_by_lotnum ( search_results ) {
    // clear the old list
    var summary_list = [];
    // Convert Search Results to local data list for later usage
    for (var i in search_results) {
        var result = search_results[i];
        var found = 0;
        for (var j in summary_list) {
            var summary = summary_list[j];
            if (summary.LotNumber.ID == result['LotNumber'].ID) {
                // count nopass/nofail
                if (result['CPUID'] != summary.Summary[summary.Summary.length - 1].CPUID)
                    (result['Result'].toUpperCase() == "PASS") ? (++summary.NoPass) : (++summary.NoFail);
                summary.Summary.push(result);
                found = 1;
                break;
            } // end if
        } // end summary_list loop
        if (found == 0) {
            summary_list.push({
                ID : result['id'],
                LotNumber : result['LotNumber'],
                NoPass : (result['Result'].toUpperCase() == "PASS") ? 1 : 0,
                NoFail : (result['Result'].toUpperCase() == "FAIL") ? 1 : 0,
                Summary : [result],
            });
        } // end if
    } // end search_results loop
    return summary_list;
}

$('table').off('click', '.s_testdetails');
$('table').on('click', '.s_testdetails', function () {
    var test_result_id = $(this).attr("data-id");
    commit_json_data(
        URL = '/summary/' + ArchName +'/' + SummMode + '/',
        Data = {
            Action: 'GetTestResultDetails',
            Data: test_result_id
        },
        Param = {},
        OnSuccessCallback = function ( json_resp, Param ) {
            var testdetail_dlg = $("#TestDetail_Dlg").dialog({
                height: '400',
                width: 'auto',
                autoOpen: false,
                closeOnEscape:true,
                resizable:false,
                modal: true,
                show:'fade',
                buttons: {
                    "OK": function() {
                        $(this).dialog("close");
                    }
                },
                open: function() {
                    var TestDetail_Data = json_resp.Data;
                    for (i in TestDetail_Data) {
                        var row = "";
                        row += '<tr id=' + TestDetail_Data[i].id + '>';
                        row += '    <td title="Test">' + TestDetail_Data[i].Test + '</td>';
                        row += '    <td title="Pass">' + TestDetail_Data[i].Pass + '</td>';
                        row += '    <td title="Fail">' + TestDetail_Data[i].Fail + '</td>';
                        row += '    <td title="Executing time">' + hhmmss(TestDetail_Data[i].ExecutingTime) + '</td>';
                        row += '</tr>';
                        $("#TestDetail_Tbl").find('tbody').append(row);
                    }
                },
                close: function() {
                    $("#TestDetail_Tbl").find('tbody').empty();
                }
            });
            testdetail_dlg.dialog("open");
            // testdetail_dlg.dialog("option", "position", "center");
        },
        OnErrorCallback = function ( json_resp, Param ) {
            slt_dialog(json_resp.Data);
        }
    );
    return false;
});

$('table').off('click', '.s_testhistory');
$('table').on('click', '.s_testhistory', function () {
    var search_req = {};
    search_req['PartId'] = $(this).attr("data-cpuid");
    search_req['LotNum'] = $(this).attr("data-lotnum");

    commit_json_data(
        URL = '/summary/' + ArchName +'/' + SummMode + '/',
        Data = {
            Action: 'GetTestResult',
            Data: JSON.stringify(search_req)
        },
        Param = {},
        OnSuccessCallback = function ( json_resp, Param ) {
            var testhistory_dlg = $("#TestHistory_Dlg").dialog({
                height: '400',
                width: '850',
                autoOpen: false,
                closeOnEscape:true,
                resizable:false,
                modal: true,
                show:'fade',
                buttons: {
                    "OK": function() {
                        $(this).dialog("close");
                    }
                },
                open: function() {
                    var TestHistory_Data = json_resp.Data;
                    for (i in TestHistory_Data) {
                        var row = "";
                        row += '<tr id=' + TestHistory_Data[i].id + '>';
                        row += '    <td>' + TestHistory_Data[i].TestName + '</td>';
                        row += '    <td>' + TestHistory_Data[i].BenchNumber + '</td>';
                        row += '    <td>' + TestHistory_Data[i].Operator.first_name + '</td>';
                        if (TestHistory_Data[i].Result.toUpperCase() == 'PASS')
                            row += '    <td><div style="color:green;">PASS</div></td>';
                        else
                            row += '    <td><div style="color:red;">' + TestHistory_Data[i].Result + '</div></td>';
                        row += '    <td>' + TestHistory_Data[i].ExecutionDate + '</td>';
                        row += '    <td title="' + convert_testenv(TestHistory_Data[i].TestEnvironments) + '">' + convert_testenv_short(TestHistory_Data[i].TestEnvironments) + '</td>';
                        row += '<td style="text-align:center;">\
                                    <a title="Show test details" class="s_testdetails" href="" data-id="' + TestHistory_Data[i].id + '">Details</a> | \
                                    <a title="Download log file" class="s_downloadlog" href="?Action=DownloadLogFile&Rfid=' + TestHistory_Data[i].Rfid + '&Filename=' + TestHistory_Data[i].LogFilePath + '">Log</a>\
                                </td>';
                        row += '</tr>';
                        $("#TestHistory_Tbl").find('tbody').append(row);
                    }
                },
                close: function() {
                    $("#TestDetail_Tbl").find('tbody').empty();
                }
            });
            testhistory_dlg.dialog("open");
            // testhistory_dlg.dialog("option", "position", "center");
        },
        OnErrorCallback = function ( json_resp, Param ) {
            slt_dialog(json_resp.Data);
        }
    );
    return false;
});


function bind_search_result ( search_results ) {
    function format ( d ) {
        var Summaries = d.Summary;
        // draw table of cpu test result content
        var html_table = '<table>'
        html_table +=  '<tr><td style="text-align:center;">Test Name</td>'
                     + '<td style="text-align:center;">Bench</td>'
                     + '<td style="text-align:center;">Board</td>'
                     + '<td style="text-align:center;">Socket</td>'
                     + '<td style="text-align:center;">Mode</td>'
                     + '<td style="text-align:center;">Operator</td>'
                     + '<td style="text-align:center;">Result</td>'
                     + '<td style="text-align:center;">Date</td>'
                     + '<td style="text-align:center;">Environments</td>'
                     + '<td style="text-align:center;">Details</td>'
                     + '</tr><tr>';
        for (var i in Summaries) {
            var row = Summaries[i];
            html_table +=  '<td>' + row.TestName + '</td>'
                         + '<td>' + row.BenchNumber + '</td>'
                         + '<td>' + row.BoardSerial + '</td>'
                         + '<td>' + row.SocketSerial + '</td>'
                         + '<td>' + row.SltMode.Mode + '</td>'
                         + '<td>' + row.Operator.first_name + '</td>';
            if (row.Result.toUpperCase() == 'PASS')
                html_table += '<td style="text-align: center;"> <div style="color:green;">' + row.Result + '</div></td>';
            else
                html_table += '<td data-tooltip="' + row.Description.replace(/\"/g, '&quot;') + '" style="text-align: center;"><div style="color:red;">' + row.Result + '</div></td>';
            html_table += '<td>' + row.ExecutionDate + '</td>';
            html_table += '<td data-tooltip="' + convert_testenv(row.TestEnvironments) + '">' + convert_testenv_short(row.TestEnvironments) + '</td>';
            html_table += '<td style="text-align:center;">\
                               <a class="s_testdetails" href="" data-id="' + row.id + '">Details</a> | \
                               <a class="s_downloadlog" href="?Action=DownloadLogFile&Rfid=' + row.Rfid + '&Filename=' + row.LogFilePath + '">Log</a>\
                           </td>';
            html_table += '</tr>';
        }
        html_table += '</table>';
        return html_table;
    }

    /*****
     * Draw HTML table
     */
    var SummaryList = build_summary_list_by_cpuid(search_results);
    test_result_tbl.clear().draw();
    test_result_tbl.rows.add(SummaryList);
    test_result_tbl.columns.adjust().draw();

    // Add event listener for opening and closing details
    $('#SearchingSummary tbody').off('click', 'td.details-control');
    $('#SearchingSummary tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = test_result_tbl.row(tr);
        if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass('shown');
        } else {
            row.child(format(row.data())).show();
            enable_qtip();
            tr.addClass('shown');
        }
        return false;
    });

    return SummaryList;
} // end bind_search_result

function bind_search_result_production ( search_results ) {
    function format ( d ) {
        Summaries = d.Summary;
        var html_table =  '<table>'
                        + '  <tr>'
                        + '   <td style="text-align:center;">CPU ID</td>'
                        + '   <td style="text-align:center;">TEST</td>'
                        + '   <td style="text-align:center;">BENCH</td>'
                        + '   <td style="text-align:center;">OPERATOR</td>'
                        + '   <td style="text-align:center;">RESULT</td>'
                        + '   <td style="text-align:center;">DATE</td>'
                        + '   <td style="text-align:center;">ENVIRONMENTS</td>'
                        + '   <td style="text-align:center;">DETAILS</td>'
                        + '  </tr>';
        for (var j = 0; j < Summaries.length; ++j) {
            var row = Summaries[j];
            html_table +=  '<tr><td>' + row.CPUID + '</td>'
                         + '<td>' + row.TestName + '</td>'
                         + '<td>' + row.BenchNumber + '</td>'
                         + '<td>' + row.Operator.first_name + '</td>';

            if (row.Result.toUpperCase() == 'PASS')
                html_table += '<td style="text-align: center;"> <div style="color:green;">' + row.Result + '</div></td>';
            else
                html_table += '<td data-tooltip="' + row.Description.replace(/\"/g, '&quot;') + '" style="text-align: center;"><div style="color:red;">' + row.Result + '</div></td>';
            html_table += '<td>' + row.ExecutionDate + '</td>';
            html_table += '<td data-tooltip="' + convert_testenv(row.TestEnvironments) + '">' + convert_testenv_short(row.TestEnvironments) + '</td>';
            html_table += '<td style="text-align:center;">\
                                <a class="s_testdetails" href="" data-id="' + row.id + '">Details</a> | \
                                <a class="s_testhistory" href="" data-cpuid="' + row.CPUID + '" data-lotnum="' + row.LotNumber.Number + '">History</a> | \
                                <a class="s_downloadlog" href="?Action=DownloadLogFile&Rfid=' + row.Rfid + '&Filename=' + row.LogFilePath + '">Log</a>\
                            </td>';
            html_table += '</tr>'
        }
        html_table += '</table>'
        return html_table;
    }

    var SummaryList = build_summary_list_by_lotnum(search_results);
    test_result_tbl.clear().draw();
    test_result_tbl.rows.add(SummaryList);
    test_result_tbl.columns.adjust().draw();

    // Add event listener for opening and closing details
    $('#SearchingSummary tbody').off('click', 'td.details-control');
    $('#SearchingSummary tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = test_result_tbl.row(tr);
        if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            row.child(format(row.data())).show();
            enable_qtip();
            tr.addClass('shown');
        }
        return false;
    });

    return SummaryList;
}


function calculate_statistic_production ( SummaryList ) {
    var pass_part = 0, fail_part = 0;
    for (var i in SummaryList) {
        pass_part += SummaryList[i].NoPass;
        fail_part += SummaryList[i].NoFail;
    }
    /****
     * Update HTML: Part Count / No PASS / No FAIL / Total Result / Final Result
     */
    $("#PartCount").text(pass_part + fail_part);
    $("#PartPass").text(pass_part);
    $("#PartFail").text(fail_part);
}


/*****
 * Calculate data statistics
 */
function calculate_statistic ( SummaryList ) {
    var pass_part = 0, fail_part = 0;
    for (var i in SummaryList) {
        var summary = SummaryList[i];
        /*
         * count pass/fail parts
         */
        (summary.LatestResult === "PASS") ? pass_part++ : fail_part++;
    }

    /*
     * Update HTML: Part Count / No PASS / No FAIL
     */
    $("#PartCount").text(pass_part + fail_part);
    $("#PartPass").text(pass_part);
    $("#PartFail").text(fail_part);
}


$(document).ready(function() {
    var loading_dlg = $("#id_loading").dialog({
        height: 'auto',
        width: 'auto',
        autoOpen: false,
        resizable:false,
        closeOnEscape: true,
        modal: true,
        show:'fade',
        dialogClass: 'noTitleStuff',
    });
    $(".ui-dialog-titlebar").hide();
    $(document).ajaxStart(function () {
        loading_dlg.dialog('open');
    }).ajaxStop(function () {
        loading_dlg.dialog('close');
    });

    enable_select2($('#id_PartId'));
    enable_select2($('#id_LotNumber'));
    enable_select2($('#id_BenchNumber'));
    enable_select2($('#id_BoardSerial'));
    enable_select2($('#id_TestName'));
    enable_select2($('#id_Operator'));
    enable_select2($('#id_FailSign'));
    enable_select2($('#id_ExecDate'));
    enable_select2($('#id_TestEnvironments'));
    enable_select2($('#id_SocketSerial'));

    enable_qtip();

    clear_search();

    $('#id_Search').click(function() {
        var TestName = $('#id_TestName').val();
        var PartId = $('#id_PartId').val();
        var OperatorId = $('#id_Operator').val();
        var FromDate = $('#id_FromDate').val();
        var ToDate = $('#id_ToDate').val();
        var Result = $('#id_Result').val();
        var LotNumber = $('#id_LotNumber').val();
        var BenchNumber = $('#id_BenchNumber').val();
        var TestEnvironments = $('#id_TestEnvironments').val();
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
        if (LotNumber && LotNumber.length > 0)
            search_req['LotNumber'] = LotNumber;
        if (BenchNumber && BenchNumber.length > 0)
            search_req['BenchNumber'] = BenchNumber;
        if (TestEnvironments && TestEnvironments.length > 0)
            search_req['TestEnvironments'] = TestEnvironments;
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
        // var url = '/summary/?' + $.param(search_req);
        // window.history.pushState(', ', url); // Causes page to reload

        commit_json_data(
            URL = '/summary/' + ArchName +'/' + SummMode + '/',
            Data = {
                Action: 'GetTestResult',
                Data: JSON.stringify(search_req)
            },
            Param = {},
            OnSuccessCallback = function ( json_resp, Param ) {
                if (SummMode == SUMM_MODE_PRODUCTION) {
                    var summary_list = bind_search_result_production(json_resp.Data);
                    calculate_statistic_production(summary_list);
                } else {
                    var summary_list = bind_search_result(json_resp.Data);
                    calculate_statistic(summary_list);
                }
            },
            OnErrorCallback = function ( json_resp, Param ) {
                clear_search();
                slt_dialog(json_resp.Data);
        });

        return false;
    });

    if (SummMode == SUMM_MODE_PRODUCTION) {
        test_result_tbl = $("#SearchingSummary").DataTable({
            paging: false,
            searching: false,
            columns: [
                {
                    className: 'details-control',
                    orderable: false,
                    data: null,
                    defaultContent: '',
                    width: '3%',
                },
                {
                    data: 'LotNumber.ID',
                    render: function ( data, type, row, meta ) {
                        return '<b>Lot Number:&nbsp;</b>' + data;
                    }
                },
                {
                    data: 'NoPass',
                    render: function ( data, type, row, meta ) {
                        return '<b>PASS:&nbsp;</b>' + data;
                    }
                },
                {
                    data: 'NoFail',
                    render: function ( data, type, row, meta ) {
                        return '<b>FAIL:&nbsp;</b>' + data;
                    }
                },
            ],
            order: [[1, 'asc']],
        });
    } else {
        test_result_tbl = $("#SearchingSummary").DataTable({
            paging: false,
            searching: false,
            columns: [
                {
                    className: 'details-control',
                    orderable: false,
                    data: null,
                    defaultContent: '',
                    width: '3%',
                },
                {
                    data: 'CPUID',
                    render: function ( data, type, row, meta ) {
                        return '<b>Part Id:&nbsp;</b>' + data;
                    }
                },
                {
                    data: 'LotNumber.ID',
                    render: function ( data, type, row, meta ) {
                        return '<b>Lot Number:&nbsp;</b>' + data;
                    }
                },
                {
                    data: 'LatestResult',
                    render: function ( data, type, row, meta ) {
                        if (data.toUpperCase() == 'PASS')
                            return '<b>Final Result:&nbsp;</b><span style="color:green;">' + data + '</span>';
                        else
                            return '<b>Final Result:&nbsp;</b><span style="color:red;">' + data + '</span>';
                    }
                },
                {
                    data: 'TotalResult',
                    render: function ( data, type, row, meta ) {
                        if (data.toUpperCase() == 'PASS')
                            return '<b>Total Result:&nbsp;</b><span style="color:green;">' + data + '</span>';
                        else
                            return '<b>Total Result:&nbsp;</b><span style="color:red;">' + data + '</span>';
                    }
                },
            ],
            order: [[1, 'asc']],
        });
    }
});