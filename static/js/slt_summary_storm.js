var EcidList = [];

var ViewMode = VM_NON_PRODUCTION;
try {
    param = get_param_by_name("Production");
    if (param)
        ViewMode = parseInt(param);
    else
        ViewMode = VM_NON_PRODUCTION;
} catch (err) {
    ViewMode = VM_NON_PRODUCTION;
    console.log(err);
}
console.log(ViewMode);

//==== To show data when page initially loads.
$(document).ready( function () {
    // Show waiting when call ajax
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

    $("#s_Ecid1").select2({
        placeholder: 'Enter any ECID',
        tags: true,
        closeOnSelect: true,
        createTag: function ( params ) {
            var term = $.trim(params.term);
            if ($('#s_Ecid1 option').filter(function() {
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

    $("#s_Ecid2").select2({
        placeholder: 'Enter any ECID',
        tags: true,
        closeOnSelect: true,
        createTag: function ( params ) {
            var term = $.trim(params.term);
            if ($('#s_Ecid2 option').filter(function() {
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

    $("#s_Ecid3").select2({
        placeholder: 'Enter any ECID',
        tags: true,
        closeOnSelect: true,
        createTag: function ( params ) {
            var term = $.trim(params.term);
            if ($('#s_Ecid3 option').filter(function() {
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

    $("#s_Ecid4").select2({
        placeholder: 'Enter any ECID',
        tags: true,
        closeOnSelect: true,
        createTag: function ( params ) {
            var term = $.trim(params.term);
            if ($('#s_Ecid4 option').filter(function() {
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

    $("#s_Operator").select2({
        placeholder: 'Enter any Operator Name',
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

    $("#s_Slt").select2();
    $("#s_ExeFrom").datepicker({ dateFormat: 'yy/mm/dd' });
    $("#s_ExeTo").datepicker({ dateFormat: 'yy/mm/dd' });

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
    function bind_stat_data( stat_data ) {
        if ($('#StatisticsTable').find('tbody').length != 0) { // remove table if it exists
            $("#StatisticsTable").find('tbody').empty();
        }

        // sort data increasing by LotNum
        stat_data.sort( function(a, b) {
            return (a.LotNum > b.LotNum) ? 1 : (a.LotNum < b.LotNum) ? -1 : 0;
        });

        // show data to html
        for (var i in stat_data) {
            var percent_pass = (stat_data[i].NoPass) / (stat_data[i].NoPass + stat_data[i].NoFail);
            var percent_fail = 1 - percent_pass;

            var row = "";
            row += '<tr id=' + stat_data[i].LotNum + '>';
            row += '    <td title="Lot Number">' + stat_data[i].LotNum + '</td>';
            row += '    <td title="Percent Pass">' + Math.round(percent_pass * 100) + '</td>';
            row += '    <td title="Percent Fail">' + Math.round(percent_fail * 100) + '</td>';
            row += '</tr>';
            $("#StatisticsTable").find('tbody').append(row);
        }
        statistics_dialog.dialog("option", "position", "center");
    }

    //Create dialog
    var statistics_dialog = $("#statistics_dialog").dialog({
        height: 'auto',
        width: 'auto',
        autoOpen: false,
        closeOnEscape:true,
        resizable: false,
        modal: true,
        show:'fade',
        open: function () {
            var search_req = {};
            var LotNum = $("#s_LotNum").val();
            if (LotNum && LotNum.length > 0)
                search_req['LotNum'] = LotNum;            

            $.ajax({
                type: "POST",
                url: "/summary",
                data: { Action: 'GetStatisticsByLotNumber',
                        Arch: get_param_by_name('Arch'),
                        Screened: (ViewMode == VM_PRODUCTION) ? 1 : 0,
                        Data: JSON.stringify(search_req)
                      },
                dataType: "json",
                cache: true,
                success: function (response) {
                    var resp = JSON.parse(JSON.stringify(response));
                    var stat_data = [];
                    var found = 0;

                    if (resp.Errno == 0) {
                        var RespData = resp.Data;
                        for (var tid in RespData) {
                            var rec = {
                                LotNum  : RespData[tid]['LotNumber'],
                                NoPass : (RespData[tid]['Result'].toUpperCase() === 'PASS') ? 1 : 0,
                                NoFail : (RespData[tid]['Result'].toUpperCase() === 'FAIL') ? 1 : 0,
                            };

                            found = 0;
                            for (var i in stat_data) {
                                if (stat_data[i].LotNum === rec.LotNum) {
                                    stat_data[i].NoPass += rec.NoPass;
                                    stat_data[i].NoFail += rec.NoFail;
                                    found = 1;
                                    break;
                                }
                            }
                            if (found == 0)
                                stat_data.push(rec);
                        }
                        bind_stat_data(stat_data);
                    } else {
                        $("#d2").data('Message', resp.Message);
                        $("#d2").dialog("open");
                    }
                },
                error: function (response) {
                    // var resp = jQuery.parseJSON(response.responseText);
                    $("#d2").data('Message', response.responseText);
                    $("#d2").dialog("open");
                }
            });
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

    function strftime ( str ) {
        if (!str)
            return null;
        // string format is very strictly as yyyy/mm/dd-HH:MM:SS
        var yyyy = str.substring(0, 4);
        var mm   = str.substring(5, 7);
        var dd   = str.substring(8, 10);
        var HH   = str.substring(11, 13);
        var MM   = str.substring(14, 16);
        var SS   = str.substring(17, 19);
        return new Date(yyyy, mm, dd, HH, MM, SS);
    }

    //==== created HTML table
    function bind_search_result( results, display_last_rec ) {
        // clear the old list
        EcidList = [];
        // get the search result region for adding respond data from server
        var search_result = document.getElementById("SearchResult");
        while (search_result.firstChild)
            search_result.removeChild(search_result.firstChild);

        for (var tid in results) {

            var found = 0, tab_ecid;
            var cpu_id = results[tid]['Ecid01'] + "-" + results[tid]['Ecid02'] + "-" + results[tid]['Ecid03'] + "-" + results[tid]['Ecid04'];

            for (var i in EcidList) {
                var cpu_rec = EcidList[i];
                if (cpu_rec.ID == cpu_id) {

                    cpu_rec.LatestResult = results[tid]['Result'].toUpperCase();
                    if (results[tid]['Result'].toUpperCase() == 'FAIL')
                        cpu_rec.TotalResult = 'FAIL';

                    for (var j in cpu_rec.Dut) {
                        var dut = cpu_rec.Dut[j];
                        if (results[tid]['DutMode'].toUpperCase() == dut.Mode.toUpperCase()) {
                            dut.Total += 1;
                            dut.Pass += ((results[tid]['Result'].toUpperCase() == 'PASS') ? 1 : 0);
                            dut.Fail += ((results[tid]['Result'].toUpperCase() == 'FAIL') ? 1 : 0);
                            if (strftime(results[tid]['ExecDate']) >= dut.Date) {
                                dut.Date = strftime(results[tid]['ExecDate']);
                                dut.Result = results[tid]['Result'];
                            }
                            found = 1;
                            break;
                        }
                    }

                    if (found == 0) {
                        cpu_rec.Dut.push({
                            Mode  : results[tid]['DutMode'],
                            Total : 1,
                            Pass  : ((results[tid]['Result'].toUpperCase() == 'PASS') ? 1 : 0),
                            Fail  : ((results[tid]['Result'].toUpperCase() == 'FAIL') ? 1 : 0),
                            Date   : strftime(results[tid]['ExecDate']),
                            Result : results[tid]['Result'],
                            TestEnv: results[tid]['TestEnvironments'],
                        });
                    }

                    found = 1;
                    break;
                }
            }

            if (found == 0) {
                EcidList.push({
                    ID : cpu_id,
                    LatestResult : results[tid]['Result'].toUpperCase(),
                    TotalResult : results[tid]['Result'].toUpperCase(),
                    LotNum: results[tid]['LotNum'],
                    Dut : [{
                        Mode : results[tid]['DutMode'],
                        Pass : ((results[tid]['Result'].toUpperCase() == 'PASS') ? 1 : 0),
                        Fail : ((results[tid]['Result'].toUpperCase() == 'FAIL') ? 1 : 0),
                        Total : 1,
                        Date : strftime(results[tid]['ExecutionDate']),
                        Result : results[tid]['Result'],
                        TestEnv: results[tid]['TestEnvironments'],
                    }],
                });
            }

            if (found == 0) {
                var div_ecid_hdr = document.createElement("div");
                div_ecid_hdr.setAttribute("class", "table table-bordered table-responsive");
                div_ecid_hdr.style.width = "1060px";
                div_ecid_hdr.innerHTML += '<div class="table-responsive" style="text-align:left;width:3%;float:left;"><a class="collapsed-button" data-cpuid="' + cpu_id + '" href="#" id="collapsed_' + cpu_id + '"><li class="icon-plus"></li></a></div>';
                div_ecid_hdr.innerHTML += '<div class="table-responsive" style="text-align:left;width:15.5%;float:left;"><b>ECID 1:&nbsp;</b>' + results[tid]['Ecid01'] + '</div>';
                div_ecid_hdr.innerHTML += '<div class="table-responsive" style="text-align:left;width:15.5%;float:left;"><b>ECID 2:&nbsp;</b>' + results[tid]['Ecid02'] + '</div>';
                div_ecid_hdr.innerHTML += '<div class="table-responsive" style="text-align:left;width:15.5%;float:left;"><b>ECID 3:&nbsp;</b>' + results[tid]['Ecid03'] + '</div>';
                div_ecid_hdr.innerHTML += '<div class="table-responsive" style="text-align:left;width:15.5%;float:left;"><b>ECID 4:&nbsp;</b>' + results[tid]['Ecid04'] + '</div>';

                if (ViewMode) {
                    div_ecid_hdr.innerHTML += '<div class="table-responsive" style="text-align:left;width:13%;float:left;"><div style="float:left;">Final result:&nbsp;</div><div id="div_latestres_' + cpu_id + '"></div></div>';
                    div_ecid_hdr.innerHTML += '<div class="table-responsive" style="text-align:left;width:13%;float:left;"><div style="float:left;">Total result:&nbsp;</div><div id="div_totalres_' + cpu_id + '"></div></div>';
                } else {
                    div_ecid_hdr.innerHTML += '<div class="table-responsive" style="display: none; text-align:left;width:13%;float:left;"><div style="float:left;">Final result:&nbsp;</div><div id="div_latestres_' + cpu_id + '"></div></div>';
                    div_ecid_hdr.innerHTML += '<div class="table-responsive" style="display: none; text-align:left;width:13%;float:left;"><div style="float:left;">Total result:&nbsp;</div><div id="div_totalres_' + cpu_id + '"></div></div>';                    
                }

                div_ecid_hdr.innerHTML += '<div class="table-responsive" style="text-align:right;width:9%;float:right;"><a class="cpu_stat" data-cpuid="' + cpu_id + '" href="#">Statistics</a></div>';

                tab_ecid = document.createElement("table");
                tab_ecid.id = cpu_id;
                tab_ecid.style.display = "none";
                tab_ecid.setAttribute("class", "table table-bordered table-responsive");
                // create header
                var thead = tab_ecid.createTHead();
                thead.innerHTML =   '<th style="text-align:center;">Test name</th>'
                                  + '<th style="text-align:center;">DUT mode</th>'
                                  + '<th style="text-align:center;">Bench number</th>'
                                  + '<th style="text-align:center;">Lot number</th>'
                                  + '<th style="text-align:center;">Operator</th>'
                                  + '<th style="text-align:center;">Result</th>'
                                  + '<th style="text-align:center;">Execution date</th>'
                                  + '<th style="text-align:center;">Test Environments</th>'
                                  + '<th style="text-align:center;">Log</th>';
                // create body
                var tbody = tab_ecid.createTBody();
                // draw table
                div_ecid_hdr.appendChild(tab_ecid);
                search_result.appendChild(div_ecid_hdr);

            } else {
                tab_ecid = document.getElementById(results[tid]['Ecid01'] + "-" + results[tid]['Ecid02'] + "-" + results[tid]['Ecid03'] + "-" + results[tid]['Ecid04']);
            }

            // add data to table
            var row = tbody.insertRow();
            row.innerHTML  =  '<td title="Test mode">' + results[tid]['TestMode'] + '</td>'
                            + '<td title="DUT mode">' + results[tid]['DutMode'] + '</td>'
                            + '<td title="Bench number">' + results[tid]['BenchNum'] + '</td>'
                            + '<td title="Lot number">' + results[tid]['LotNum'] + '</td>'
                            + '<td title="Operator name">' + results[tid]['Operator'] + '</td>';

            if (results[tid]['Result'].toUpperCase() == 'PASS') {
                row.innerHTML += '<td style="text-align: center;"> <div style="color:green;">' + results[tid]['Result'] + '</div></td>';
            } else {
                var tresult = $.parseJSON('[' + results[tid]['Details'] + ']');
                var fail_modes = "";
                for (var i in tresult) {
                    if (tresult[i].Result.toUpperCase() == 'FAIL') {
                        fail_modes += tresult[i].Test + '&nbsp;&nbsp;';
                    }
                }
                row.innerHTML += '<td style="text-align: center;"><div style="color:red;">' + results[tid]['Result'] + '</div>' + fail_modes + '</td>';
            }
            row.innerHTML += '<td title="Execution Date">' + results[tid]['ExecDate'] + '</td>';
            row.innerHTML += '<td title="' + convert_testenv(results[tid]['TestEnvironments']) + '">' + convert_testenv_short(results[tid]['TestEnvironments']) + '</td>';
            row.innerHTML += '<td title="Download log file" style="text-align:center;"> <a href="file/?Action=DownloadLogFile&Rfid=' + results[tid]['Rfid'] +  '&Filename=' + results[tid]['Log'] + '"><i class="icon-edit"></i></a></td>';
        }

        // show total parts, passed/failed parts
        var no_pass = 0, no_fail = 0;
        for (var i = 0; i < EcidList.length; ++i) {
            var div_totalres = document.getElementById("div_totalres_" + EcidList[i].ID);
            if (EcidList[i].TotalResult.toUpperCase() == 'PASS') {
                div_totalres.style.color = "green";
                div_totalres.style.float = "left";
                div_totalres.innerHTML = "PASS";
            }
            else if (EcidList[i].TotalResult.toUpperCase() == 'FAIL') {
                div_totalres.style.color = "red";
                div_totalres.style.float = "left";
                div_totalres.innerHTML = "FAIL";
            }

            var div_latestres = document.getElementById("div_latestres_" + EcidList[i].ID);
            if (EcidList[i].LatestResult.toUpperCase() == "PASS") {
                no_pass++;
                div_latestres.style.color = "green";
                div_latestres.style.float = "left";
                div_latestres.innerHTML = EcidList[i].LatestResult.toUpperCase();
            }
            else if (EcidList[i].LatestResult.toUpperCase() == "FAIL") {
                no_fail++;
                div_latestres.style.color = "red";
                div_latestres.style.float = "left";
                div_latestres.innerHTML = EcidList[i].LatestResult.toUpperCase();
            }
        }
        $("#PartCount").text(EcidList.length);
        $("#PartPass").text(no_pass);
        $("#PartFail").text(no_fail);
    }

    $(".collapsed-button").live('click', function () {
        var cpu_id = $(this).data("cpuid");
        var tab_ecid = document.getElementById(cpu_id);
        var collapsed_btn = document.getElementById("collapsed_" + cpu_id);

        if (tab_ecid.style.display == "none") {
            tab_ecid.style.display = "table";
            collapsed_btn.innerHTML = "<li class='icon-minus'></li>";
        } else {
            tab_ecid.style.display = "none";
            collapsed_btn.innerHTML = "<li class='icon-plus'></li>";
        }

        return false;
    });


    $(".cpu_stat").live('click', function() {
        var cpu_id = $(this).data("cpuid");
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
                if ($('#CPUStatisticsTable').find('tbody').length != 0)
                    $("#CPUStatisticsTable").find('tbody').empty();
                for (var i in EcidList) {
                    var cpu_rec = EcidList[i];
                    if (cpu_rec.ID == cpu_id) {
                        var stat_tab = document.getElementById("CPUStatisticsTable");
                        for (var j in cpu_rec.Dut) {
                            var percent_pass = Math.round((cpu_rec.Dut[j].Pass / cpu_rec.Dut[j].Total) * 100);
                            var percent_fail = Math.round((cpu_rec.Dut[j].Fail / cpu_rec.Dut[j].Total) * 100);

                            var row  = "<tr>";
                                row += "    <td>" + cpu_rec.Dut[j].Mode + "</td>";
                                row += "    <td>" + cpu_rec.Dut[j].Total + "</td>";
                                row += "    <td>" + cpu_rec.Dut[j].Result + "</td>";
                                row += "    <td>" + percent_pass + "</td>";
                                row += "    <td>" + percent_fail + "</td>";
                                row += "</tr>";
                            $("#CPUStatisticsTable").find('tbody').append(row);
                        }
                        break;
                    }
                }
            },
            close: function() {
            }
        });
        part_statistics_dialog.dialog("open");
    });

    $("#s_Search").live('click', function() {
        var Ecid1 = $("#s_Ecid1").val();
        var Ecid2 = $("#s_Ecid2").val();
        var Ecid3 = $("#s_Ecid3").val();
        var Ecid4 = $("#s_Ecid4").val();
        var Slt = $("#s_Slt").val();
        var OperatorId = $("#s_Operator").val();
        var ExeFrom = $("#s_ExeFrom").val();
        var ExeTo = $("#s_ExeTo").val();
        var Result = $("#s_Result").val();
        var LotNum = $("#s_LotNum").val();
        var BenchNum = $("#s_BenchNum").val();

        var search_req = {};
        search_req['Screened'] = (ViewMode == VM_PRODUCTION) ? 1 : 0;
        search_req['Arch'] = get_param_by_name('Arch');
        if (ViewMode == VM_PRODUCTION)
            search_req['SltMode'] = $("#s_Slt > option:contains('Production')").val();
        else if (Slt && Slt.length > 0)
            search_req['SltMode'] = Slt;

        if (Ecid1 && Ecid1.length > 0)
            search_req['Ecid01'] = Ecid1;
        if (Ecid2 && Ecid2.length > 0)
            search_req['Ecid02'] = Ecid2;
        if (Ecid3 && Ecid3.length > 0)
            search_req['Ecid03'] = Ecid3;
        if (Ecid4 && Ecid4.length > 0)
            search_req['Ecid04'] = Ecid4;
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

        var url = "/summary/?" + $.param(search_req);
        window.history.pushState("", "", url); // Causes page to reload

        $.ajax({
            type: "POST",
            url: "/summary",
            data: {
                Action: 'GetTestResult',
                Arch: get_param_by_name('Arch'),
                Data: JSON.stringify(search_req)
            },
            dataType: "json",
            cache: true,
            beforeSend : function() {
                var search_result = document.getElementById("SearchResult");
                while (search_result.firstChild)
                    search_result.removeChild(search_result.firstChild);
            },
            success: function (response) {
                var resp = JSON.parse(JSON.stringify(response));
                if (resp.Errno == 0) {
                    bind_search_result(resp.Data, ViewMode);
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
    trigger_search += select2_set_options(search_req['Ecid01'], $("#s_Ecid1"));
    trigger_search += select2_set_options(search_req['Ecid02'], $("#s_Ecid2"));
    trigger_search += select2_set_options(search_req['Ecid03'], $("#s_Ecid3"));
    trigger_search += select2_set_options(search_req['Ecid04'], $("#s_Ecid4"));
    trigger_search += select2_set_options(search_req['LotNum'], $("#s_LotNum"));
    trigger_search += select2_set_options(search_req['BenchNum'], $("#s_BenchNum"));
    trigger_search += select2_set_options(search_req['Result'], $("#s_Result"));
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
    $("#s_Ecid1").val('');
    $("#s_Ecid2").val('');
    $("#s_Ecid3").val('');
    $("#s_Ecid4").val('');
    $("#s_Slt").val('');
    $("#s_Operator").val('');
    $("#s_ExeFrom").val('');
    $("#s_ExeTo").val('');
    $("#s_Result").val('');
    $("#s_TestName").val('');
    $("#s_LotNum").val('');
    $("#s_BenchNum").val('');
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