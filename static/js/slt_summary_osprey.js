var SummaryList = [];
var ViewMode;

try {
    param = get_param_by_name("Production");
    ViewMode = parseInt(param);
} catch (err) {
    ViewMode = VM_NON_PRODUCTION;
    console.log(err);
}

//==== To show data when page initially loads.
$(document).ready( function () {
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

    $("#s_SocketSerial").select2({
        placeholder: 'Enter any Socket Serial',
        tags: true,
        closeOnSelect: true,
        createTag: function ( params ) {
            var term = $.trim(params.term);
            if ($('#s_SocketSerial option').filter(function() { return $(this).text() === term; }).length === 0)
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

    //Create dialog
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

//==== search function
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
                    ret_str += k + ": " + testenv_obj[k] + "</br>";
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

    function SltModeName ( mode ) {
        var text = $("#s_Slt option[value='" + mode + "']").text()
        if (!text)
            return "";
        return text;
    }

    function build_summary_list_by_board_id ( search_results ) {
        // clear the old list
        var summary_list = [];
        // get the search result region for adding respond data from server
        var html_table = document.getElementById("SearchResult");
        while (html_table.firstChild)
            html_table.removeChild(html_table.firstChild);

        // Convert Search Results to local data list for later usage
        for (var i in search_results) {
            var result = search_results[i];
            var found = 0;

            for (var j in summary_list) {
                var summary = summary_list[j];

                if (summary.BoardId == result['BoardId'] && summary.LotNum == result['LotNum']) {
                    // summary.LatestResult = result['Result'].toUpperCase();
                    summary.TotalResult = (summary.LatestResult == 'FAIL') ? 'FAIL' : summary.TotalResult;

                    summary.Summary.push({
                        ID       : result['ID'],
                        CpuId    : result['CpuId'],
                        BenchNum : parseInt(result['BenchNum']),
                        BoardId  : result['BoardId'],
                        Details  : result['Details'],
                        ExecDate : result['ExecDate'],
                        Log      : result['Log'],
                        LotNum   : result['LotNum'],
                        Operator : result['Operator'],
                        Result   : result['Result'].toUpperCase(),
                        Rfid     : result['Rfid'],
                        SltMode  : SltModeName(result['SltMode']),
                        TestName : result['TestName'],
                        Description : result['Description'],
                        TestEnv  : result['TestEnvironments'],
                        SocketSerial: result['SocketSerial'],
                    });
                    found = 1;
                    break;
                } // end if
            } // end summary_list loop

            if (found == 0) {
                summary_list.push({
                    ID : result['ID'],
                    CpuId    : result['CpuId'],
                    LotNum : result['LotNum'],
                    LatestResult : result['Result'].toUpperCase(),
                    TotalResult  : result['Result'].toUpperCase(),
                    BoardId  : result['BoardId'],
                    Summary : [{
                        ID       : result['ID'],
                        CpuId    : result['CpuId'],
                        BenchNum : parseInt(result['BenchNum']),
                        BoardId  : result['BoardId'],
                        Details  : result['Details'],
                        ExecDate : result['ExecDate'],
                        Log      : result['Log'],
                        LotNum   : result['LotNum'],
                        Operator : result['Operator'],
                        Result   : result['Result'].toUpperCase(),
                        Rfid     : result['Rfid'],
                        SltMode  : SltModeName(result['SltMode']),
                        TestName : result['TestName'],
                        Description : result['Description'],
                        TestEnv  : result['TestEnvironments'],
                        SocketSerial : result['SocketSerial'],
                    }],
                });
            } // end if
        } // end search_results loop
        // sort list
        summary_list.sort(function(a, b) {
            if (a.BoardId < b.BoardId)
                return -1;
            if (a.BoardId > b.BoardId)
                return 1;
            if (a.LotNum < b.LotNum)
                return -1;
            if (a.LotNum > b.LotNum)
                return 1;
            return 0;
        });
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

                if (summary.LotNum == result['LotNum']) {
                    // count nopass/nofail
                    if (result['CpuId'] != summary.Summary[summary.Summary.length - 1].CpuId)
                        (result['Result'].toUpperCase() == "PASS") ? (++summary.NoPass) : (++summary.NoFail);
                    summary.Summary.push({
                        ID       : result['ID'],
                        CpuId    : result['CpuId'],
                        BenchNum : parseInt(result['BenchNum']),
                        BoardId  : result['BoardId'],
                        Details  : result['Details'],
                        ExecDate : result['ExecDate'],
                        Log      : result['Log'],
                        LotNum   : result['LotNum'],
                        Operator : result['Operator'],
                        Result   : result['Result'].toUpperCase(),
                        Rfid     : result['Rfid'],
                        SltMode  : SltModeName(result['SltMode']),
                        TestName : result['TestName'],
                        Description : result['Description'],
                        TestEnv  : result['TestEnvironments'],
                        SocketSerial : result['SocketSerial'],
                    });
                    found = 1;
                    break;
                } // end if
            } // end summary_list loop

            if (found == 0) {
                summary_list.push({
                    ID : result['ID'],
                    LotNum : result['LotNum'],
                    NoPass : (result['Result'].toUpperCase() == "PASS") ? 1 : 0,
                    NoFail : (result['Result'].toUpperCase() == "FAIL") ? 1 : 0,
                    Summary : [{
                        ID       : result['ID'],
                        CpuId    : result['CpuId'],
                        BenchNum : parseInt(result['BenchNum']),
                        BoardId  : result['BoardId'],
                        Details  : result['Details'],
                        ExecDate : result['ExecDate'],
                        Log      : result['Log'],
                        LotNum   : result['LotNum'],
                        Operator : result['Operator'],
                        Result   : result['Result'].toUpperCase(),
                        Rfid     : result['Rfid'],
                        SltMode  : SltModeName(result['SltMode']),
                        TestName : result['TestName'],
                        Description : result['Description'],
                        TestEnv  : result['TestEnvironments'],
                        SocketSerial : result['SocketSerial'],
                    }],
                });
            } // end if
        } // end search_results loop
        return summary_list;
    }

    function bind_search_result_production ( search_results ) {
        /*****
         * get the search result region for adding respond data from server
         */
        var html_table = document.getElementById("SearchResult");
        // clear existing data first
        while (html_table.firstChild)
            html_table.removeChild(html_table.firstChild);
        /*****
         * Draw HTML table
         */
        SummaryList = build_summary_list_by_lotnum(search_results);
        for (var i in SummaryList) {
            var summary = SummaryList[i];
            // draw header
            var div_cpu_hdr = document.createElement("div");
            div_cpu_hdr.setAttribute("class", "table table-bordered table-responsive");
            div_cpu_hdr.setAttribute("style", "width: 1060px;");
            div_cpu_hdr.innerHTML += '<div class="table-responsive" style="text-align:center;width:3%;float:left;"><a class="collapsed-button" data-summaryid="' + summary.ID + '" href="#" id="collapsed_' + summary.ID + '"><li class="icon-plus"></li></a></div>';
            div_cpu_hdr.innerHTML += '<div class="table-responsive" style="text-align:left;width:25%;float:left;"><b>Lot Number:&nbsp;</b>' + summary.LotNum + '</div>';
            div_cpu_hdr.innerHTML += '<div class="table-responsive" style="text-align:left;width:15%;float:left;"><div style="float:left;"><b>Pass:&nbsp;</b></div><div id="div_result_1_' + summary.ID + '"></div></div>';
            div_cpu_hdr.innerHTML += '<div class="table-responsive" style="text-align:left;width:15%;float:left;"><div style="float:left;"><b>Fail:&nbsp;</b></div><div id="div_result_2_' + summary.ID + '"></div></div>';
            html_table.appendChild(div_cpu_hdr);

            // draw table of cpu test result content
            var tab_cpu = document.createElement("table");
            tab_cpu.setAttribute("id", summary.ID);
            tab_cpu.setAttribute("style", "display:none;");
            tab_cpu.setAttribute("class", "table table-bordered table-responsive");
            // create row header
            var thead = tab_cpu.createTHead();
            thead.innerHTML =  '<th style="text-align:center;">CPD ID</th>'
                              + '<th style="text-align:center;">Test Name</th>'
                              + '<th style="text-align:center;">Bench Number</th>'
                              + '<th style="text-align:center;">Board Serial</th>'
                              + '<th style="text-align:center;">Test Mode</th>'
                              + '<th style="text-align:center;">Operator</th>'
                              + '<th style="text-align:center;">Result</th>'
                              + '<th style="text-align:center;">Execution Date</th>'
                              + '<th style="text-align:center;">Test Environments</th>'
                              + '<th style="text-align:center;">Details</th>';

            // create body & add data to table
            var tbody = tab_cpu.createTBody();
            var td_cpuid;
            for (var j = 0; j < summary.Summary.length; ++j) {
                var row = summary.Summary[j];
                var td = tbody.insertRow();

                if (summary.Summary[j - 1] && row.CpuId == summary.Summary[j - 1].CpuId) {
                    td.innerHTML  =   '<td rowspan="1">' + row.TestName + '</td>'
                                    + '<td rowspan="1">' + row.BenchNum + '</td>'
                                    + '<td rowspan="1">' + row.BoardId + '</td>'
                                    + '<td rowspan="1">' + row.SltMode + '</td>'
                                    + '<td rowspan="1">' + row.Operator + '</td>';
                }
                else {
                    var rowspan = 1;
                    for (var k = j + 1; k < summary.Summary.length; ++k) {
                        if (row.CpuId == summary.Summary[k].CpuId)
                            rowspan++;
                        else
                            break;
                    }
                    td.innerHTML  =   '<td rowspan="' + rowspan + '">' + row.CpuId + '</td>'
                                    + '<td rowspan="1">' + row.TestName + '</td>'
                                    + '<td rowspan="1">' + row.BenchNum + '</td>'
                                    + '<td rowspan="1">' + row.BoardId + '</td>'
                                    + '<td rowspan="1">' + row.SltMode + '</td>'
                                    + '<td rowspan="1">' + row.Operator + '</td>';
                }

                if (row.Result.toUpperCase() == 'PASS')
                    td.innerHTML += '<td rowspan="1" style="text-align: center;"> <div style="color:green;">' + row.Result + '</div></td>';
                else
                    td.innerHTML += '<td rowspan="1" title="' + row.Description + '" style="text-align: center;"><div style="color:red;">' + row.Result + '</div></td>';
                td.innerHTML += '<td rowspan="1">' + row.ExecDate + '</td>';
                td.innerHTML += '<td rowspan="1" title="' + convert_testenv(row.TestEnv) + '">' + convert_testenv_short(row.TestEnv) + '</td>';
                td.innerHTML += '<td rowspan="1" style="text-align:center;"><a class="s_testdetail" href="#">Details</a> | <a title="Download log file" href="file/?Action=DownloadLogFile&Rfid=' + row.Rfid + '&Filename=' + row.Log + '">Log</a></td>';
                td.TestDetail_Data = $.parseJSON('[' + row.Details + ']');
            }
            // draw table
            div_cpu_hdr.appendChild(tab_cpu);
        }
        return SummaryList;
    } // end bind_search_result_production

    function calculate_statistic_production ( SummaryList ) {
        var pass_part = 0, fail_part = 0;
        for (var i in SummaryList) {
            var summary = SummaryList[i];
            /****
             * Update HTML: No PASS / No FAIL
             */
            var div_result_1 = document.getElementById("div_result_1_" + summary.ID);
            var div_result_2 = document.getElementById("div_result_2_" + summary.ID);

            div_result_1.innerHTML = '<div style="color:green;">' + summary.NoPass + '</div></td>';
            div_result_2.innerHTML = '<div style="color:red;">' + summary.NoFail + '</div></td>';
            pass_part += summary.NoPass;
            fail_part += summary.NoFail;
        }

        /****
         * Update HTML: Part Count / No PASS / No FAIL / Total Result / Final Result
         */
        $("#PartCount").text(pass_part + fail_part);
        $("#PartPass").text(pass_part);
        $("#PartFail").text(fail_part);
    }

    function bind_search_result ( search_results ) {
        /*****
         * get the search result region for adding respond data from server
         */
        var html_table = document.getElementById("SearchResult");
        // clear existing data first
        while (html_table.firstChild)
            html_table.removeChild(html_table.firstChild);
        /*****
         * Draw HTML table
         */
        SummaryList = build_summary_list_by_board_id(search_results);
        for (var i in SummaryList) {
            var summary = SummaryList[i];
            // draw header
            var div_cpu_hdr = document.createElement("div");
            div_cpu_hdr.setAttribute("class", "table table-bordered table-responsive");
            div_cpu_hdr.setAttribute("style", "width: 1160px;");
            div_cpu_hdr.innerHTML += '<div class="table-responsive" style="text-align:center;width:3%;float:left;"><a class="collapsed-button" data-summaryid="' + summary.ID + '" href="#" id="collapsed_' + summary.ID + '"><li class="icon-plus"></li></a></div>';
            div_cpu_hdr.innerHTML += '<div class="table-responsive" style="text-align:left;width:20%;float:left;"><b>Board ID:&nbsp;</b>' + summary.BoardId + '</div>';
            div_cpu_hdr.innerHTML += '<div class="table-responsive" style="text-align:left;width:30%;float:left;"><b>Lot Number:&nbsp;</b>' + summary.LotNum + '</div>';
            div_cpu_hdr.innerHTML += '<div class="table-responsive" style="text-align:left;width:20%;float:left;"><div style="float:left;"><b>Final result:&nbsp;</b></div><div id="div_result_1_' + summary.ID + '"></div></div>';
            div_cpu_hdr.innerHTML += '<div class="table-responsive" style="text-align:left;width:20%;float:left;"><div style="float:left;"><b>Total result:&nbsp;</b></div><div id="div_result_2_' + summary.ID + '"></div></div>';
            div_cpu_hdr.innerHTML += '<div class="table-responsive" style="text-align:right;width:7%;float:right;"><a class="cpu_stat" data-summaryid="' + summary.ID + '" href="#">Statistics</a></div>';
            html_table.appendChild(div_cpu_hdr);

            // draw table of cpu test result content
            var tab_cpu = document.createElement("table");
            tab_cpu.setAttribute("id", summary.ID);
            tab_cpu.setAttribute("style", "display:none;");
            tab_cpu.setAttribute("class", "table table-bordered table-responsive");
            // create row header
            var thead = tab_cpu.createTHead();
            thead.innerHTML =  '<th style="text-align:center;">CPU ID</th>'
                              + '<th style="text-align:center;">Socket Serial</th>'
                              + '<th style="text-align:center;">Test Name</th>'
                              + '<th style="text-align:center;">Bench Number</th>'
                              + '<th style="text-align:center;">Test Mode</th>'
                              + '<th style="text-align:center;">Operator</th>'
                              + '<th style="text-align:center;">Result</th>'
                              + '<th style="text-align:center;">Execution Date</th>'
                              + '<th style="text-align:center;">Test Environments</th>'
                              + '<th style="text-align:center;">Details</th>';
            // create body & add data to table
            var tbody = tab_cpu.createTBody();
            for (var j in summary.Summary) {
                var row = summary.Summary[j];
                var html_tbl_row = tbody.insertRow();
                html_tbl_row.innerHTML  =  '<td title="Test Name">' + row.CpuId + '</td>'
                                         + '<td title="Bench number">' + row.SocketSerial + '</td>'
                                         + '<td title="Bench number">' + row.TestName + '</td>'
                                         + '<td title="Board Serial">' + row.BenchNum + '</td>'
                                         + '<td title="Test Mode">' + row.SltMode + '</td>'
                                         + '<td title="Operator Name">' + row.Operator + '</td>';

                if (row.Result.toUpperCase() == 'PASS')
                    html_tbl_row.innerHTML += '<td title="" style="text-align: center;"> <div style="color:green;">' + row.Result + '</div></td>';
                else
                    html_tbl_row.innerHTML += '<td title="' + row.Description + '" style="text-align: center;"><div style="color:red;">' + row.Result + '</div></td>';
                html_tbl_row.innerHTML += '<td title="Execution Date">' + row.ExecDate + '</td>';
                html_tbl_row.innerHTML += '<td title="' + convert_testenv(row.TestEnv) + '">' + convert_testenv_short(row.TestEnv) + '</td>';
                html_tbl_row.innerHTML += '<td style="text-align:center;"><a class="s_testdetail" href="#" title="View Detail" >Details</a> | <a title="Download log file" href="file/?Action=DownloadLogFile&Rfid=' + row.Rfid + '&Filename=' + row.Log + '">Log</a></td>';
                html_tbl_row.TestDetail_Data = $.parseJSON('[' + row.Details + ']');
            }
            // draw table
            div_cpu_hdr.appendChild(tab_cpu);
        }
        return SummaryList;
    } // end bind_search_result

    /*****
     * Calculate data statistics
     */
    function calculate_statistic ( SummaryList ) {
        var pass_part = 0, fail_part = 0;
        for (var i in SummaryList) {
            var summary = SummaryList[i];

            /*
             * Update HTML: Total Result / Final Result
             */
            var div_result_1 = document.getElementById("div_result_1_" + summary.ID);
            var div_result_2 = document.getElementById("div_result_2_" + summary.ID);

            /*
             * count pass/fail parts
             */
            if (summary.LatestResult === "PASS") {
                ++pass_part;
                div_result_1.innerHTML = '<div style="color:green;">' + summary.LatestResult + '</div></td>';
                div_result_2.innerHTML = '<div style="color:green;">' + summary.TotalResult + '</div></td>';
            }
            else {
                ++fail_part;
                div_result_1.innerHTML = '<div style="color:red;">' + summary.LatestResult + '</div></td>';
                div_result_2.innerHTML = '<div style="color:red;">' + summary.TotalResult + '</div></td>';
            }
        }

        /*
         * Update HTML: Part Count / No PASS / No FAIL
         */
        $("#PartCount").text(pass_part + fail_part);
        $("#PartPass").text(pass_part);
        $("#PartFail").text(fail_part);
    }

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
            }
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
        var SocketSerial = $("#s_SocketSerial").val();
        var BoardSerial =  $("#s_BoardSerial").val();

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
        if (SocketSerial && SocketSerial.length > 0)
            search_req['SocketSerial'] = SocketSerial;
        if (TestEnv && TestEnv.length > 0)
            search_req['TestEnvironments'] = TestEnv;
        if (BoardSerial && BoardSerial.length > 0)
            search_req['BoardSerial'] = BoardSerial;

        var url = "/summary/?" + $.param(search_req);
        window.history.pushState("", "", url); // Causes page to reload

        $.ajax({
            type: "POST",
            url: "/summary",
            data: { Action: 'GetTestResult',
                    Arch: get_param_by_name('Arch'),
                    Data: JSON.stringify(search_req)
                  },
            dataType: "json",
            cache: true,
            success: function (response) {
                var resp = JSON.parse(JSON.stringify(response));
                if (resp.Errno == 0) {
                    if (ViewMode == VM_PRODUCTION){
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
    trigger_search += select2_set_options(search_req['SocketSerial'], $("#s_SocketSerial"));
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