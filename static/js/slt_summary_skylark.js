var SummaryList = [];
var ViewMode;

try {
    param = get_param_by_name("Screened");
    ViewMode = parseInt(param);
} catch (err) {
    ViewMode = VM_NON_PRODUCTION;
    console.log(err);
}

//==== To show data when page initially loads.
$(document).ready(function () {
    $(document).ajaxStart(function () {
        $("#loading").show();
    }).ajaxStop(function () {
        $("#loading").hide();
    });

    // if (ViewMode == VM_PRODUCTION) {
    //     $("#s_ViewMode").hide();
    // } else {
    //     $("#s_ViewMode").show();
    // }

    clear_search();

    $('a.Download').click(function(e) {
        e.stopPropagation();
        e.preventDefault();
        return false;
    });

    $("#s_Operator").select2({
        placeholder: 'Enter any Operator Name',
    });

    $("#s_TestName").select2({
        placeholder: 'Enter any Test Name',
        tags: true,
        closeOnSelect: true,
        createTag: function ( params ) {
            var term = $.trim(params.term);
            if ($('#s_TestName option').filter(function() { return $(this).text() === term; }).length === 0)
                return {
                    id: term,
                    text: term,
                    newTag: true
                };
            else
                return null;
        }
    });

    $("#s_CpuId").select2({
        placeholder: 'Enter any CPU ID',
        tags: true,
        closeOnSelect: true,
        createTag: function ( params ) {
            var term = $.trim(params.term);
            if ($('#s_CpuId option').filter(function() { return $(this).text() === term; }).length === 0)
                return {
                    id: term,
                    text: term,
                    newTag: true
                };
            else
                return null;
        }
    });

    $("#s_LotNum").select2({
        placeholder: 'Enter any Lot number',
        tags: true,
        closeOnSelect: true,
        createTag: function ( params ) {
            var term = $.trim(params.term);
            if ($('#s_LotNum option').filter(function() { return $(this).text() === term; }).length === 0)
                return {
                    id: term,
                    text: term,
                    newTag: true
                };
            else
                return null;
        }
    });

    $("#s_BenchNum").select2({
        placeholder: 'Enter any Bench Number',
        tags: true,
        closeOnSelect: true,
        createTag: function ( params ) {
            var term = $.trim(params.term);
            if ($('#s_BenchNum option').filter(function() { return $(this).text() === term; }).length === 0)
                return {
                    id: term,
                    text: term,
                    newTag: true
                };
            else
                return null;
        }
    });

    $("#s_BoardSerial").select2({
        placeholder: 'Enter any Board Serial',
        tags: true,
        closeOnSelect: true,
        createTag: function ( params ) {
            var term = $.trim(params.term);
            if ($('#s_BoardSerial option').filter(function() { return $(this).text() === term; }).length === 0)
                return {
                    id: term,
                    text: term,
                    newTag: true
                };
            else
                return null;
        }
    });

    $("#s_Result").select2({
        placeholder: 'Enter any Failture Signature',
        tags: true,
        closeOnSelect: true,
        createTag: function ( params ) {
            var term = $.trim(params.term);
            if ($('#s_Result option').filter(function() {
                return $(this).text() === term;
            }).length === 0)
                return {
                    id: term,
                    text: term,
                    newTag: true
                };
            else
                return null;
        }
    });

    $("#s_TestEnv").select2({
        placeholder: 'Enter any Environment Text',
        tags: true,
        closeOnSelect: true,
        createTag: function ( params ) {
            var term = $.trim(params.term);
            if ($('#s_TestEnv option').filter(function() {
                return $(this).text() === term;
            }).length === 0)
                return {
                    id: term,
                    text: term,
                    newTag: true
                };
            else
                return null;
        }
    });
    $("#s_ExeFrom").datepicker({ dateFormat: 'yy/mm/dd' });
    $("#s_ExeTo").datepicker({ dateFormat: 'yy/mm/dd' });

    $("#s_Slt").select2();

    ////////////// Making Tooltip /////////////////////////
    $('a[title]').qtip({
        show: {
            delay: 1
        },
        hide: {
            delay: 0
        }
    });
    $('button').qtip({
        show: {
            delay: 1
        },
        hide: {
            delay: 0
        }
    });
    $('input[title]').qtip({
        show: {
            delay: 1
        },
        hide: {
            delay: 0
        }
    });

//==== Statistics function
    function bind_stat_data ( stat_data ) {

        if ($('#StatisticsTable').find('tbody').length != 0) { // remove table if it exists
            $("#StatisticsTable").find('tbody').empty();
        }

        // sort data increasing by LotNum
        stat_data.sort( function(a, b) {
            return (a.LotNum > b.LotNum) ? 1 : (a.LotNum < b.LotNum) ? -1 : 0;
        });

        // show data to html
        for (var i in stat_data) {
            var total = stat_data[i].NoPass + stat_data[i].NoFail
            var percent_pass = (stat_data[i].NoPass) / total;
            var percent_fail = (stat_data[i].NoFail) / total;

            var row = "";
            row += '<tr id=' + stat_data[i].LotNum + '>';
            row += '    <td title="Lot Number">' + stat_data[i].LotNum + '</td>';
            row += '    <td title="Total">' + total + '</td>';
            row += '    <td title="Pass">' + stat_data[i].NoPass + ' (' + Math.round(percent_pass * 100) + '%)</td>';
            row += '    <td title="Fail">' + stat_data[i].NoFail + ' (' + Math.round(percent_fail * 100) + '%)</td>';
            row += '</tr>';
            $("#StatisticsTable").find('tbody').append(row);
        }
    }

    // Create dialog
    var statistics_dialog = $("#statistics_dialog").dialog({
        height: 'auto',
        width: 'auto',
        autoOpen: false,
        closeOnEscape:true,
        resizable:false,
        modal: true,
        show:'fade',
        open: function () {
            if (ViewMode == VM_PRODUCTION)
                stat_data = SummaryList;
            else {
                // build stat_data list
                var stat_data = [];
                for (var i in SummaryList) {
                    var f = 0;
                    for (var j in stat_data) {
                        if (stat_data[j].LotNum == SummaryList[i].LotNum) {
                            (SummaryList[i].LatestResult == "PASS") ? (++stat_data[j].NoPass) : (++stat_data[j].NoFail);
                            f = 1;
                        }
                    }
                    if (f == 0)
                        stat_data.push({
                            LotNum : SummaryList[i].LotNum,
                            NoPass : (SummaryList[i].LatestResult == "PASS") ? 1 : 0,
                            NoFail : (SummaryList[i].LatestResult == "FAIL") ? 1 : 0,
                        });
                }
            }
            bind_stat_data(stat_data);
            statistics_dialog.dialog("option", "position", "center");
        },
        close: function() {
        },
        buttons: {
            "Close": function() {
                $(this).dialog("close");
            }
        }
    });

    $("#s_Statistics").click(function() {
        statistics_dialog.dialog("open");
    });

    $("#s_Report").click(function() {

        if (ViewMode == VM_PRODUCTION) {
            var ProdReport = get_prod_reports(SummaryList);
            // format the Production report
            // var prod_time  = "From " + ProdReport.FromDate + " To " + ProdReport.ToDate + "\r\n";
            var prod_report = "------ PRODUCTION -------\r\n";
            for (var i in ProdReport.Reports) {
                var Report = ProdReport.Reports[i];
                prod_report += "[LOT " + Report.LotNum + "]: total " + Report.TotalParts + " parts screened\r\n";
                prod_report += "    - PASS: " + Report.PassParts.NoParts + "/" + Report.TotalParts + "\r\n";
                if (Report.PassParts.RerunPartId.length) {
                    prod_report += "        + Re-run: " + Report.PassParts.NoRerun + "\r\n";
                    prod_report += "            Part Id: ";
                    for (var j in Report.PassParts.RerunPartId) {
                        prod_report += Report.PassParts.RerunPartId[j] + ", ";
                    }
                    prod_report += "\r\n";
                }

                prod_report += "    - FAIL: " + Report.FailParts.NoParts + "/" + Report.TotalParts + "\r\n";
                var sorted_keys = Object.keys(Report.FailParts.BINs).sort();
                for (var j in sorted_keys) {
                    var B = Report.FailParts.BINs[sorted_keys[j]];
                    prod_report += "        + " + B.Desc + ": " + B.NoParts + " parts\r\n";
                    prod_report += "            Part Id: ";
                    for (var k in B.PartId) {
                        prod_report += B.PartId[k] + ", ";
                    }
                    prod_report += "\r\n";
                }
                prod_report += "\r\n";
            }

            // Generate file
            var a = window.document.createElement("a");
            a.href = window.URL.createObjectURL(new Blob([prod_report],
                                                {type: "text/plain"}));
            a.download = "Report.txt";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

        } else {
            var FaReport = get_fa_reports(SummaryList);
            // format the FA report
            var fa_time = "From " + FaReport.FromDate + " To " + FaReport.ToDate + "\r\n";
            var fa_report = "------ FA -------\r\n";
            for (var i in FaReport.Reports) {
                var Report = FaReport.Reports[i];
                fa_report += "[LOT " + Report.LotNum + "]: total " + Report.TotalParts + " parts screened\r\n";
                for (var j in Report.Conditions) {
                    var Cond = Report.Conditions[j];
                    fa_report += "    + Conditions: " + Cond.TestEnv + "\r\n";
                    fa_report += "        - " + Cond.NoPassParts + "/" + Report.TotalParts + ": Pass\r\n";
                    fa_report += "        - " + Cond.NoFailParts + "/" + Report.TotalParts + ": Fail\r\n";
                    var sorted_keys = Object.keys(Cond.Bins).sort();
                    for (var k in sorted_keys) {
                        var B = Cond.Bins[sorted_keys[k]];
                        fa_report += "            + " + B.Desc + ": " + B.NoParts + " occurrences\r\n";
                    }
                }
                fa_report += "\r\n";
            }

            // Generate file
            var a = window.document.createElement("a");
            a.href = window.URL.createObjectURL(new Blob([fa_time, fa_report],
                                                {type: "text/plain"}));
            a.download = "Report.txt";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    });


//==== search function

    $(".s_testhistory").live('click', function() {
        var cpu_id = $(this).data('cpuid');
        var lot_num =  $(this).data('lotnum');
        var testhistory_dlg = $("#TestHistory_Dlg").dialog({
            height: 'auto',
            width: 'auto',
            autoOpen: false,
            closeOnEscape: true,
            resizable: false,
            modal: true,
            show:'fade',
            buttons: {
                "OK": function() {
                    $(this).dialog("close");
                }
            },
            open: function() {
                var TestHistory_Data = $(this).data("TestHistory_Data");
                var tableRef = document.getElementById('TestHistory_Tbl').getElementsByTagName('tbody')[0];
                for (i in TestHistory_Data) {
                    var row = "";
                    row += '<tr id=' + TestHistory_Data[i].ID + '>';
                    row += '    <td>' + TestHistory_Data[i].TestName + '</td>';
                    row += '    <td>' + TestHistory_Data[i].BenchNum + '</td>';
                    row += '    <td>' + TestHistory_Data[i].SocketSerial + '</td>';
                    row += '    <td>' + TestHistory_Data[i].Operator + '</td>';
                    if (TestHistory_Data[i].Result.toUpperCase() == 'PASS')
                        row += '    <td><div style="color:green;">PASS</div></td>';
                    else
                        row += '    <td><div style="color:red;">' + TestHistory_Data[i].Result + '</div></td>';
                    row += '    <td>' + TestHistory_Data[i].ExecDate + '</td>';
                    row += '    <td title="' + convert_testenv(TestHistory_Data[i].TestEnvironments) + '">' + convert_testenv_short(TestHistory_Data[i].TestEnvironments) + '</td>';
                    row += '<td style="text-align:center;">\
                                <a class="s_testdetail" href="#">Details</a> | \
                                <a title="Download log file" href="file/?Action=DownloadLogFile&Rfid=' + TestHistory_Data[i].Rfid + '&Filename=' + TestHistory_Data[i].Log + '">Log</a>\
                            </td>';
                    row += '</tr>';

                    // Insert a row in the table at the last row
                    var newRow   = tableRef.insertRow(tableRef.rows.length);
                    newRow.innerHTML = row;
                    newRow.TestDetail_Data = $.parseJSON('[' + TestHistory_Data[i].Details + ']');
                }
                testhistory_dlg.dialog("option", "position", "center");
            },
            close: function() {
                $("#TestHistory_Tbl").find('tbody').empty();
            }
        });

        var search_req = {};
        search_req['Arch'] = get_param_by_name('Arch');
        search_req['SltMode'] = SLT_MODE_PRODUCTION;
        search_req['CpuId'] = [cpu_id];
        search_req['LotNum'] = [lot_num];

        $.ajax({
            type: "POST",
            url: "/summary",
            data: { Action: 'GetTestHistory',
                    Arch: search_req['Arch'],
                    Data: JSON.stringify(search_req)
                  },
            dataType: "json",
            cache: true,
            success: function (response) {
                var resp = JSON.parse(JSON.stringify(response));
                if (resp.Errno == 0) {
                    testhistory_dlg.data('TestHistory_Data', resp.Data);
                    testhistory_dlg.dialog("open");
                } else {
                    clear_search();
                    $("#d2").data('Message', resp.Message);
                    $("#d2").dialog("open");
                }
            },
            error: function (response) {
                var resp = jQuery.parseJSON(response.responseText);
                $("#d2").data('Message', resp.Message);
                $("#d2").dialog("open");
            },
        });

        return false;
    });

    $(".s_testdetail").live('click', function() {
        var testdetail_dlg = $("#TestDetail_Dlg").dialog({
            height: 'auto',
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
                var TestDetail_TR = $(this).data("TestDetail_TR");
                var TestDetail_Data = TestDetail_TR.prop("TestDetail_Data");
                for (i in TestDetail_Data) {
                    var row = "";
                    row += '<tr id=' + TestDetail_Data[i].ID + '>';
                    row += '    <td title="Test">' + TestDetail_Data[i].Test + '</td>';
                    row += '    <td title="Pass">' + TestDetail_Data[i].Pass + '</td>';
                    row += '    <td title="Fail">' + TestDetail_Data[i].Fail + '</td>';
                    row += '    <td title="Executing time">' + hhmmss(TestDetail_Data[i].ExecTime) + '</td>';
                    row += '</tr>';
                    $("#TestDetail_Tbl").find('tbody').append(row);
                }
                testdetail_dlg.dialog("option", "position", "center");
            },
            close: function() {
                $("#TestDetail_Tbl").find('tbody').empty();
            }
        });
        testdetail_dlg.data('TestDetail_TR', $(this).closest("tr"));
        testdetail_dlg.dialog("open");
        return false;
    });

    $(".collapsed-button").live('click', function () {
        var id = $(this).data("summaryid");
        var tab_cpu = document.getElementById(id);
        var collapsed_btn = document.getElementById("collapsed_" + id);

        if (tab_cpu.style.display == "none") {
            tab_cpu.style.display = "table";
            collapsed_btn.innerHTML = "<li class='icon-minus'></li>";
        } else {
            tab_cpu.style.display = "none";
            collapsed_btn.innerHTML = "<li class='icon-plus'></li>";
        }

        return false;
    });

    $(".cpu_stat").live('click', function() {
        var cpu_id = $(this).data("summaryid");
        // Create dialog
        var part_statistics_dialog = $("#part_statistics_dialog").dialog({
            height: 'auto',
            width: 'auto',
            autoOpen: false,
            closeOnEscape:true,
            resizable:false,
            modal: true,
            show:'fade',
            open: function() {
                var num_pass = 0, num_fail = 0;
                var Total = 0, Result = '';
                for (var i in SummaryList) {
                    var summary = SummaryList[i];
                    if (summary.ID == cpu_id) {
                        for (var j in summary.Summary) {
                            Result = summary.Summary[j].Result;
                            if (Result === 'PASS')
                                num_pass++;
                            else
                                num_fail++;
                        }
                    }
                }
                Total = num_pass + num_fail
                if ($('#CPUStatisticsTable').find('tbody').length != 0)
                    $("#CPUStatisticsTable").find('tbody').empty();
                var row  = "<tr>";
                    row += "    <td>" + Total + "</td>";
                    row += "    <td>" + num_pass + " (" + Math.round((num_pass / Total) * 100) + "%)</td>";
                    row += "    <td>" + num_fail + " (" + Math.round((num_fail / Total) * 100) + "%)</td>";
                    row += "    <td>" + Result + "</td>";
                    row += "</tr>";
                $("#CPUStatisticsTable").find('tbody').append(row);
            },
            close: function() {
            },
        });
        part_statistics_dialog.dialog("open");
    });

    $("#s_Search").click(function() {
        var TestName = $("#s_TestName").val();
        var CpuId = $("#s_CpuId").val();
        var Slt = $("#s_Slt").val();
        var OperatorId = $("#s_Operator").val();
        var ExeFrom = $("#s_ExeFrom").val();
        var ExeTo = $("#s_ExeTo").val();
        var Result = $("#s_Result").val();
        var LotNum = $("#s_LotNum").val();
        var BenchNum = $("#s_BenchNum").val();
        var TestEnv = $("#s_TestEnv").val();
        var BoardSerial = $("#s_BoardSerial").val();

        var search_req = {};
        search_req['Screened'] = (ViewMode == VM_PRODUCTION) ? 1 : 0;
        search_req['Arch'] = get_param_by_name('Arch');
        if (ViewMode == VM_PRODUCTION)
            search_req['SltMode'] = $("#s_Slt > option:contains('Production')").val();
        else if (Slt && Slt.length > 0)
            search_req['SltMode'] = Slt;

        if (TestName && TestName.length > 0)
            search_req['TestName'] = TestName;
        if (CpuId && CpuId.length > 0)
            search_req['CpuId'] = CpuId;
        if (OperatorId && OperatorId.length > 0)
            search_req['Operator'] = OperatorId;
        if (Result && Result.length > 0)
            search_req['Result'] = Result;
        if (ExeFrom && ExeFrom.length > 0)
            search_req['From'] = ExeFrom;
        if (ExeTo && ExeTo.length > 0)
            search_req['To'] = ExeTo;
        if (LotNum && LotNum.length > 0)
            search_req['LotNum'] = LotNum;
        if (BenchNum && BenchNum.length > 0)
            search_req['BenchNum'] = BenchNum;
        if (TestEnv && TestEnv.length > 0)
            search_req['TestEnvironments'] = TestEnv;
        if (BoardSerial && BoardSerial.length > 0)
            search_req['BoardSerial'] = BoardSerial;

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
        var url = "/summary/?" + $.param(search_req);
        window.history.pushState("", "", url); // Causes page to reload

        $.ajax({
            type: "POST",
            url: "/summary",
            data: { Action: 'GetTestResult',
                    Arch: search_req['Arch'],
                    Data: JSON.stringify(search_req)
                  },
            dataType: "json",
            cache: true,
            success: function (response) {
                var resp = JSON.parse(JSON.stringify(response));
                if (resp.Errno == 0) {
                    if (ViewMode == VM_PRODUCTION) {
                        var summary_list = bind_search_result_production(resp.Data);
                        calculate_statistic_production(summary_list);
                    } else {
                        var summary_list = bind_search_result(resp.Data);
                        calculate_statistic(summary_list);
                    }
                } else {
                    clear_search();
                    $("#d2").data('Message', resp.Message);
                    $("#d2").dialog("open");
                }
            },
            error: function (response) {
                clear_search();
                var resp = jQuery.parseJSON(response.responseText);
                $("#d2").data('Message', resp.Message);
                $("#d2").dialog("open");
            }
        });

        return false;
    });

//=============================
    var trigger_search = 0;
    var search_req = getJsonFromUrl();
    trigger_search += select2_set_options(search_req['TestName'], $("#s_TestName"));
    trigger_search += select2_set_options(search_req['CpuId'], $("#s_CpuId"));
    trigger_search += select2_set_options(search_req['LotNum'], $("#s_LotNum"));
    trigger_search += select2_set_options(search_req['BenchNum'], $("#s_BenchNum"));
    trigger_search += select2_set_options(search_req['BoardSerial'], $("#s_BoardSerial"));
    trigger_search += select2_set_options(search_req['Result'], $("#s_Result"));
    //
    if (search_req['TestEnvironments']) {
        $("#s_TestEnv").val(search_req['TestEnvironments']).trigger('change');
        trigger_search += 1;
    }
    if (search_req['Operator']) {
        $("#s_Operator").val(search_req['Operator']).trigger('change');
        trigger_search += 1;
    }
    if (search_req['From']) {
        $('#s_ExeFrom').datepicker('setDate', new Date(search_req['From']));
        trigger_search += 1;
    }
    if (search_req['To']) {
        $('#s_ExeTo').datepicker('setDate', new Date(search_req['To']));
        trigger_search += 1;
    }
    if (trigger_search) {
        $("#s_Search").click();
    }
});


//==== Method to clear input fields
function clear_search() {
    $("#s_TestNanme").val('');
    $("#s_CpuId").val('');
    $("#s_Slt").val('');
    $("#s_Operator").val('');
    $("#s_ExeFrom").val('');
    $("#s_ExeTo").val('');
    $("#s_Result").val('');
    $("#s_TName").val('');
    $("#s_LotNum").val('');
    $("#s_BenchNum").val('');
    $("#s_BoardSerial").val('');
}


///////////////////////// Message Dialog /////////////////////////
$(function() {
    $("#d2").dialog({
        autoOpen: false,
        height: 'auto',
        width: 'auto',
        modal: true,
        closeOnEscape:true,
        resizable:false,
        show:'fade',
        buttons: {
            "OK": function() {
                $(this).dialog("close");
            }
        },
        open: function() {
            var message = $("#d2").data('Message');
            $( "#MsgText" ).html(message);
        }
    });
});