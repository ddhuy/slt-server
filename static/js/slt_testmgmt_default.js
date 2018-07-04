const MENU_DISPLAY = "menu_display.csv"
const BOARD_LIST = "board_list.csv"

$(document).ready( function() {
    // Make all table rows can be draggable & droppable
    $("tbody").sortable();

    // get test config
    get_board_config();

    /*************************
     * Create Message Dialog *
     *************************/
    $("#uid_MsgDlg").dialog({
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
            var message = $(this).data('Message');
            $("#uid_MsgText").html(message);
        }
    });

    /*****************************
     * Board Configuration Event *
     *****************************/
    $("#uid_ImportAllTestCfg").click(function() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            // create file input dialog
            var input_alltestcfg = document.createElement("input");
            input_alltestcfg.setAttribute("type", "file");
            input_alltestcfg.setAttribute("multiple", "");
            input_alltestcfg.setAttribute("webkitdirectory", "");
            input_alltestcfg.onchange = function(e) {
                if (!e || e.target.files.length <= 0)
                    return;
                import_all_testcfg(e.target.files);
            };
            input_alltestcfg.onclick = function() {
                // reset selected value to catch selection change of same entry
                this.value = null; // using DOM element itself
            };
            // open dialog for user to select directory
            input_alltestcfg.click();
        } else {
            $("#uid_MsgDlg").data("Message", "This browser does not support File API");
            $("#uid_MsgDlg").dialog("open");
        }
        return false;
    });

    $("#uid_BoardCfgTbl").on("click", "#uid_InsertBoardCfg", function() {
        bind_board_cfg();
        return false;
    });

    $("#uid_BoardCfgTbl").on("click", ".ucl_DeleteBoardCfg", function() {
        var delete_dialog = $("#uid_DeleteTestCfgDlg").dialog({
            height        : 'auto',
            width         : 'auto',
            show          : 'fade',
            autoOpen      : false,
            modal         : true,
            closeOnEscape : true,
            resizable     : false,
            buttons: {
                "Delete": function() {
                    // remove row
                    $("#uid_DeleteTestCfgDlg").data('BoardCfg_TR').remove();
                    $("#uid_DeleteTestCfgDlg").dialog("close");

                    // update board configuration to server
                    var BoardIni_Data = $("#uid_BoardCfgTbl > tbody tr").map(function() {
                        return {
                            ID      : $(this).data("ID"),
                            Text    : $(this).find("input[name='i_boardcfg']").val(),
                            IniData : $(this).data("BoardIni_Data")
                        }
                    }).get();
                    commit_all_board_ini(BoardIni_Data);
                },
                "Cancel": function() {
                    $(this).dialog("close");
                }
            }
        });

        delete_dialog.data('BoardCfg_TR', $(this).closest("tr"));
        delete_dialog.dialog('open');
        return false;
    });

    var dom_boardini_dlg = document.createElement("input");
    dom_boardini_dlg.setAttribute("type", "file");
    dom_boardini_dlg.setAttribute("accept", ".ini");
    dom_boardini_dlg.onchange = function(e) {
        import_board_ini(e);
    };
    dom_boardini_dlg.onclick = function() {
        this.value = null; // using DOM element itself
    };
    $("#uid_ImportBoardIni").click(function() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            dom_boardini_dlg.click();
        } else {
            $("#uid_MsgDlg").data("Message", "This browser does not support File API");
            $("#uid_MsgDlg").dialog("open");
        }
        return false;
    });

    var boardini_dlg = $("#uid_BoardIniDlg").dialog({
        show          : "fade",
        height        : "auto",
        width         : "auto",
        modal         : true,
        closeOnEscape : true,
        autoOpen      : false,
        resizable     : false,
        open : function() {
            var BoardIni_TR = $(this).data("BoardIni_TR");
            $("#uid_TxtBoardCfg").val(BoardIni_TR.data("BoardIni_Data"));

            // set export link
            var href =  "/file?Action=DownloadTestConfig"
                      + "&Rfid=Default"
                      + "&Test=" + BoardIni_TR.data("ID")
                      + "&Mode=BoardIni";
            $("a#uid_ExportBoardIni").attr({"href": href});

            var TitleText = BoardIni_TR.find("input[name='i_boardcfg']").val();
            boardini_dlg.dialog("option", "title", "Edit Board Configuration : " + TitleText);
            boardini_dlg.dialog("option", "position", "center");
        },
        buttons: {
            "Update" : function() {
                // save current board ini as local
                var BoardIni_TR = $(this).data("BoardIni_TR");
                BoardIni_TR.data("BoardIni_Data", $("#uid_TxtBoardCfg").val());
                // update board configuration to server
                var BoardIni_Data = $("#uid_BoardCfgTbl > tbody tr").map(function() {
                    return {
                        ID      : $(this).data("ID"),
                        Text    : $(this).find("input[name='i_boardcfg']").val(),
                        IniData : $(this).data("BoardIni_Data")
                    }
                }).get();
                // verify data before commit to server
                for (var i = 0; i < BoardIni_Data.length; i++) {
                    if (BoardIni_Data[i].Text === "") {
                        $("#uid_MsgDlg").data("Message", "Please fill all text");
                        $("#uid_MsgDlg").dialog("open");
                        return;
                    }
                }
                // commit all board INI to server
                commit_all_board_ini(BoardIni_Data);

                $(this).dialog("close");
            },
            "Cancel" : function() {
                $(this).dialog("close");
            }
        },
    });
    $("#uid_BoardCfgTbl").on('click', '.ucl_EditBoardIni', function() {
        var BoardIni_TR = $(this).closest("tr");
        boardini_dlg.data("BoardIni_TR", BoardIni_TR);
        boardini_dlg.dialog("open");
        return false;
    });

    var boardcfg_dlg = $("#uid_TestCfgDlg").dialog({
        show          : "fade",
        height        : "auto",
        width         : "auto",
        modal         : true,
        closeOnEscape : true,
        autoOpen      : false,
        resizable     : false,
        open : function() {
            // set export link
            var href =  "/file?Action=DownloadTestConfig"
                      + "&Rfid=Default"
                      + "&Test=" + Data.Test
                      + "&Arch=" + Data.Arch
                      + "&Mode=TestConfig";
            $("a#uid_ExportTestCfg").attr({"href": href});

            var BoardCfg_TR = $(this).data("BoardCfg_TR");
            var BoardCfg_Data = BoardCfg_TR.data("BoardCfg_Data");

            if ($("#uid_TestCfgTbl").find("tbody").length != 0)
                $("#uid_TestCfgTbl").find("tbody").empty();

            for (i in BoardCfg_Data) {
                bind_test_cfg(BoardCfg_Data[i]);
            }

            var TitleText = BoardCfg_TR.find("input[name='i_boardcfg']").val();
            boardcfg_dlg.dialog("option", "title", "Edit Test Configuration : " + TitleText);
            boardcfg_dlg.dialog("option", "position", "center");
        },
        buttons: {
            "Update" : function() {
                // Map data to JSON format
                var BoardCfg_Data = $("#uid_TestCfgTbl > tbody tr").map(function() {
                    return {
                        ID         : $(this).data("ID"),
                        Display    : $(this).find("input[name='i_text']").val().trim(),
                        Mode       : $(this).find("select[name='i_sltmode']").val(),
                        MainData   : $(this).data("MainData"),
                        SecondData : $(this).data("SecondData"),
                        ErrorData1 : $(this).data("ErrorData1"),
                        ErrorData2 : $(this).data("ErrorData2")
                    }
                }).get();

                // Save data in local
                var BoardCfg_TR = boardcfg_dlg.data("BoardCfg_TR");
                BoardCfg_TR.data("BoardCfg_Data", BoardCfg_Data);

                // Send data to server
                var archid = get_ini_param(BoardCfg_TR.data("BoardIni_Data"), "BOARD_CONFIG", "Arch");
                var testid = BoardCfg_TR.data("ID");
                if (!testid || !archid) {
                    $("#uid_MsgDlg").data('Message', "Invalid information");
                    $("#uid_MsgDlg").dialog("open");
                    return;
                }
                // commit all test configuration
                commit_json_data(URL = "/test",
                                 Data = { Action: 'SetDefaultTestConfig',
                                          Data: JSON.stringify(BoardCfg_Data),
                                          Arch: archid,
                                          Test: testid
                                        },
                                 Param = {},
                                 OnSuccessCallback = function ( json_resp ) {
                                    var resp = JSON.parse(JSON.stringify(json_resp));
                                    if (resp.Errno == 0) {
                                        $("#uid_MsgDlg").data('Message', "File saved successfully");
                                    } else {
                                        $("#uid_MsgDlg").data('Message', resp.Message);
                                    }
                                    $("#uid_MsgDlg").dialog("open");
                                 });

                // commit all board configuration
                var BoardIni_Data = $("#uid_BoardCfgTbl > tbody tr").map(function() {
                    return {
                        ID      : $(this).data("ID"),
                        Text    : $(this).find("input[name='i_boardcfg']").val(),
                        IniData : $(this).data("BoardIni_Data")
                    }
                }).get();
                commit_all_board_ini(BoardIni_Data);

                $(this).dialog("close");
            },
            "Cancel" : function() {
                $(this).dialog("close");
            }
        },
    });

    $("#uid_BoardCfgTbl").on("click", ".ucl_EditBoardCfg", function() {
        var BoardCfg_TR = $(this).closest("tr");

        var ArchId = get_ini_param(BoardCfg_TR.data("BoardIni_Data"), "BOARD_CONFIG", "Arch");
        var TestId = BoardCfg_TR.data("ID");

        // reload current test command
        if (ArchId) {
            get_test_command(document.getElementById("uid_MainTestCmdCb"), ArchId);
            get_test_command(document.getElementById("uid_SecondTestCmdCb"), "ast2500");
        } else {
            $("#uid_MsgDlg").data("Message", "Please specify Architecture in Board INI Configuration");
            $("#uid_MsgDlg").dialog("open");
            return false;
        }

        commit_json_data(URL = "/test",
                         Data = { Action : "GetDefaultTestConfig",
                                  Test: TestId,
                                  Arch: ArchId
                                },
                         Param = {},
                         OnSuccessCallback = function ( json_resp ) {
                            var resp = JSON.parse(JSON.stringify(json_resp));
                            if (resp.Errno == 0) {
                                // add new data
                                BoardCfg_TR.data("BoardCfg_Data",resp.Data);
                                boardcfg_dlg.data("BoardCfg_TR", BoardCfg_TR);
                                boardcfg_dlg.dialog("open");
                            } else if (resp.Errno == 257) {
                                $("#uid_MsgDlg").data("Message", "Please update board ini first");
                                $("#uid_MsgDlg").dialog("open");                                
                            } else {
                                $("#uid_MsgDlg").data("Message", resp.Message);
                                $("#uid_MsgDlg").dialog("open");
                            }
                         });
        return false;
    });

    /*****************************
     * Test Configuration Event  *
     *****************************/
    $("#uid_ImportTestCfg").click(function() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            // create file input dialog
            var import_testcfg_dlg = document.createElement("input");
            import_testcfg_dlg.setAttribute("type", "file");
            import_testcfg_dlg.setAttribute("multiple", "");
            import_testcfg_dlg.setAttribute("webkitdirectory", "");
            import_testcfg_dlg.onchange = function(e) {
                if (!e || e.target.files.length <= 0)
                    return;
                var BoardCfg_TR = boardcfg_dlg.data("BoardCfg_TR");
                var menu_dipslay = get_ini_param(BoardCfg_TR.data("BoardIni_Data"), "BOARD_CONFIG", "Menu");
                import_testcfg(BoardCfg_TR.data("ID"), menu_dipslay, e.target.files);
            };
            import_testcfg_dlg.onclick = function() {
                // reset selected value to catch selection change of same entry
                this.value = null; // using DOM element itself
            };
            // open dialog for user to select directory
            import_testcfg_dlg.click();
        } else {
            $("#uid_MsgDlg").data("Message", "This browser does not support File API");
            $("#uid_MsgDlg").dialog("open");
        }
        return false;
    });

    $("#uid_TestCfgTbl").on("click", "#uid_InsertTestCfg", function() {
        bind_test_cfg();
        boardcfg_dlg.dialog("option", "position", "center");
        return false;
    });

    $("#uid_TestCfgTbl").on("click", ".ucl_DeleteTestCfg", function() {
        $(this).closest("tr").remove();
        boardcfg_dlg.dialog("option", "position", "center");
        return false;
    });

    var testcmd_dlg_1st = $("#uid_MainTestCmdDlg").dialog({
        show          : "fade",
        height        : "auto",
        width         : "auto",
        modal         : true,
        closeOnEscape : true,
        autoOpen      : false,
        resizable     : false,
        buttons : {
            "Save" : function() {
                var MainData = $("#uid_MainTestCmdTbl > tbody tr").map(function() {
                    return {
                        Test: $(this).find("select[name='i_test']").find("option:selected").text(),
                        Mode: $(this).find("select[name='i_mode']").find("option:selected").val(),
                        FailStop: $(this).find("input[name='i_failstop']").attr("checked") ? 1 : 0 ,
                        Command: $(this).find("input[name='i_command']").val(),
                        Timeout: $(this).find("input[name='i_timeout']").val(),
                        Msg: $(this).find("input[name='i_msg']").val(),
                        Comments: $(this).find("input[name='i_comments']").val(),
                        Prompt: $(this).find("input[name='i_prompt']").val(),
                        Pass: $(this).find("input[name='i_pass']").val(),
                        Fail: $(this).find("input[name='i_fail']").val()
                    }
                }).get();

                var BoardCfg_TR = $(this).data("BoardCfg_TR");
                BoardCfg_TR.data("MainData", MainData);

                $(this).dialog("close");
            },
            "Cancel" : function() {
                $(this).dialog("close");
            }
        },
        open : function() {
            var BoardCfg_TR = $(this).data("BoardCfg_TR");
            var MainData = BoardCfg_TR.data("MainData");
            var TestSuiteId = BoardCfg_TR.data("ID");

            if ($("#uid_MainTestCmdTbl").find("tbody").length != 0)
                $("#uid_MainTestCmdTbl").find("tbody").empty();

            for (i in MainData)
                bind_testcmd_1st(MainData[i]);

            // set export link
            var href =  "/file?Action=DownloadTestConfig"
                      + "&Rfid=Default"
                      + "&TestPlanId=" + Data.Test
                      + "&TestSuiteId=" + TestSuiteId
                      + "&Arch=" + Data.Arch
                      + "&Mode=MainData";
            $("a#uid_ExportTestCmd_Main").attr({"href": href});

            // set dialog options
            $(this).dialog("option", "position", "center");
        },
    });
    $("#uid_TestCfgTbl").on("click", ".ucl_EditMainTestCfg", function() {
        var BoardCfg_TR = $(this).closest("tr");
        testcmd_dlg_1st.data("BoardCfg_TR", BoardCfg_TR);
        testcmd_dlg_1st.dialog("open");
        return false;
    });

    var testcmd_dlg_2nd = $("#uid_SecondTestCmdDlg").dialog({
        show          : "fade",
        height        : "auto",
        width         : "auto",
        modal         : true,
        closeOnEscape : true,
        autoOpen      : false,
        resizable     : false,
        buttons : {
            "Save" : function() {
                var SecondData = $("#uid_SecondTestCmdTbl > tbody tr").map(function() {
                    return {
                        Test: $(this).find("select[name='i_test']").find("option:selected").text(),
                        Mode: $(this).find("select[name='i_mode']").find("option:selected").val(),
                        FailStop: $(this).find("input[name='i_failstop']").attr("checked") ? 1 : 0 ,
                        Command: $(this).find("input[name='i_command']").val(),
                        Timeout: $(this).find("input[name='i_timeout']").val(),
                        Msg: $(this).find("input[name='i_msg']").val(),
                        Comments: $(this).find("input[name='i_comments']").val(),
                        Prompt: $(this).find("input[name='i_prompt']").val(),
                        Pass: $(this).find("input[name='i_pass']").val(),
                        Fail: $(this).find("input[name='i_fail']").val()
                    }
                }).get();

                var BoardCfg_TR = $(this).data("BoardCfg_TR");
                BoardCfg_TR.data("SecondData", SecondData);
                $(this).dialog("close");
            },
            "Cancel" : function() {
                $(this).dialog("close");
            }
        },
        open : function() {
            var BoardCfg_TR = $(this).data("BoardCfg_TR");
            var SecondData = BoardCfg_TR.data("SecondData");
            var TestSuiteId = BoardCfg_TR.data("ID");

            if ($("#uid_SecondTestCmdTbl").find("tbody").length != 0)
                $("#uid_SecondTestCmdTbl").find("tbody").empty();
            for (i in SecondData)
                bind_testcmd_2nd(SecondData[i]);

            // set export link
            var href =  "/file?Action=DownloadTestConfig"
                      + "&Rfid=Default"
                      + "&TestPlanId=" + Data.Test
                      + "&TestSuiteId=" + TestSuiteId
                      + "&Arch=" + Data.Arch
                      + "&Mode=SecondData";
            $("a#uid_ExportTestCmd_Second").attr({"href": href});

            // set dialog options
            $(this).dialog("option", "position", "center");
        },
    });
    $("#uid_TestCfgTbl").on("click", ".ucl_EditSecondTestCfg", function() {
        var BoardCfg_TR = $(this).closest("tr");
        testcmd_dlg_2nd.data("BoardCfg_TR", BoardCfg_TR);
        testcmd_dlg_2nd.dialog("open");
        return false;
    });

    var error1_dlg = $("#uid_ErrTbl_1_Dlg").dialog({
        show          : "fade",
        height        : "auto",
        width         : "auto",
        modal         : true,
        closeOnEscape : true,
        autoOpen      : false,
        resizable     : false,
        buttons : {
            "Save" : function() {
                var ErrorData1 = $("#uid_ErrorTable_1 > tbody tr").map(function() {
                    return {
                        Name     : $(this).find("input[name='i_name']").val(),
                        Type     : $(this).find("input[name='i_type']").val(),
                        Expected : $(this).find("input[name='i_expected']").val(),
                        Result   : $(this).find("input[name='i_result']").val(),
                        Timeout  : $(this).find("input[name='i_timeout']").val(),
                        Msg      : $(this).find("input[name='i_msg']").val()
                    }
                }).get();

                var BoardCfg_TR = $(this).data("BoardCfg_TR");
                BoardCfg_TR.data("ErrorData1", ErrorData1);
                $(this).dialog("close");
            },
            "Cancel" : function() {
                $(this).dialog("close");
            }
        },
        open : function() {
            var BoardCfg_TR = $(this).data("BoardCfg_TR");
            var ErrorData1 = BoardCfg_TR.data("ErrorData1");
            var TestSuiteId = BoardCfg_TR.data("ID");

            if ($("#uid_ErrorTable_1").find("tbody").length != 0)
                $("#uid_ErrorTable_1").find("tbody").empty();
            for (i in ErrorData1)
                bind_error_row_1(ErrorData1[i]);

            // set export link
            var href =  "/file?Action=DownloadTestConfig"
                      + "&Rfid=Default"
                      + "&TestPlanId=" + Data.Test
                      + "&TestSuiteId=" + TestSuiteId
                      + "&Arch=" + Data.Arch
                      + "&Mode=ErrorData1";
            $("a#uid_ExportErrTbl_1").attr({"href": href});

            // set dialog options
            $(this).dialog("option", "position", "center");
        },
    });
    $("#uid_TestCfgTbl").on("click", ".ucl_EditErrTbl1", function() {
        var BoardCfg_TR = $(this).closest("tr");
        error1_dlg.data("BoardCfg_TR", BoardCfg_TR);
        error1_dlg.dialog("open");
        return false;
    });

    var error2_dlg = $("#uid_ErrTbl_2_Dlg").dialog({
        show          : "fade",
        height        : "auto",
        width         : "auto",
        modal         : true,
        closeOnEscape : true,
        autoOpen      : false,
        resizable     : false,
        buttons : {
            "Save" : function() {
                var ErrorData2 = $("#uid_ErrorTable_2 > tbody tr").map(function() {
                    return {
                        Name     : $(this).find("input[name='i_name']").val(),
                        Type     : $(this).find("input[name='i_type']").val(),
                        Expected : $(this).find("input[name='i_expected']").val(),
                        Result   : $(this).find("input[name='i_result']").val(),
                        Timeout  : $(this).find("input[name='i_timeout']").val(),
                        Msg      : $(this).find("input[name='i_msg']").val()
                    }
                }).get();

                var BoardCfg_TR = $(this).data("BoardCfg_TR");
                BoardCfg_TR.data("ErrorData2", ErrorData2);
                $(this).dialog("close");
            },
            "Cancel" : function() {
                $(this).dialog("close");
            }
        },
        open : function() {
            var BoardCfg_TR = $(this).data("BoardCfg_TR");
            var ErrorData2 = BoardCfg_TR.data("ErrorData2");
            var TestSuiteId = BoardCfg_TR.data("ID");

            if ($("#uid_ErrorTable_2").find("tbody").length != 0)
                $("#uid_ErrorTable_2").find("tbody").empty();
            for (i in ErrorData2)
                bind_error_row_2(ErrorData2[i]);

            // set export link
            var href =  "/file?Action=DownloadTestConfig"
                      + "&Rfid=Default"
                      + "&TestPlanId=" + Data.Test
                      + "&TestSuiteId=" + TestSuiteId
                      + "&Arch=" + Data.Arch
                      + "&Mode=ErrorData2";
            $("a#uid_ExportErrTbl_2").attr({"href": href});

            // set dialog options
            $(this).dialog("option", "position", "center");
        },
    });

    $("#uid_TestCfgTbl").on("click", ".ucl_EditErrTbl2", function() {
        var BoardCfg_TR = $(this).closest("tr");
        error2_dlg.data("BoardCfg_TR", BoardCfg_TR);
        error2_dlg.dialog("open");
        return false;
    });

    /****************************
     * Main Test Commands Event *
     ****************************/
    $("#uid_MainTestCmdDlg").on("click", ".ucl_DeleteMainTestCmd", function() {
        $(this).closest("tr").remove();
        testcmd_dlg_1st.dialog("option", "position", "center");
        return false;
    });

    $("#uid_MainTestCmdDlg").on("click", "#uid_InsertMainTestCmd", function() {
        bind_testcmd_1st();
        testcmd_dlg_1st.dialog("option", "position", "center");
        return false;
    });

    $("#uid_MainTestCmdDlg").on('click', '.ucl_SelectMainTestCmd', function() {
        var tr_tcmd = $(this).closest("tr");
        var selopt = $(this).find("option:selected");
        tr_tcmd.find('select[name="i_mode"]').val(selopt.data('mode'));
        tr_tcmd.find('input[name="i_failstop"]').prop('checked', selopt.data('failstop'));
        tr_tcmd.find('input[name="i_prompt"]').val(selopt.data('prompt'));
        tr_tcmd.find('input[name="i_command"]').val(selopt.data('cmd'));
        tr_tcmd.find('input[name="i_pass"]').val(selopt.data('pass'));
        tr_tcmd.find('input[name="i_fail"]').val(selopt.data('fail'));
        tr_tcmd.find('input[name="i_timeout"]').val(selopt.data('timeout'));
        tr_tcmd.find('input[name="i_msg"]').val(selopt.data('msg'));
        tr_tcmd.find('input[name="i_comments"]').val(selopt.data('comments'));
    });

    var add_main_testcmd_dlg = $("#uid_AddMainTestCmd_Dlg").dialog({
        height: 'auto',
        width: 'auto',
        autoOpen: false,
        closeOnEscape:true,
        resizable:false,
        modal: true,
        show:'fade',
        close: function() {
            $("#i_test").val('');
            $("#i_mode").val('');
            $("#i_failstop").prop("checked", false);
            $("#i_prompt").val('');
            $("#i_command").val('');
            $("#i_pass").val('');
            $("#i_fail").val('');
            $("#i_timeout").val('');
            $("#i_msg").val('');
            $("#i_comments").val('');
        },
        buttons: {
            "Add": function() {
                var test = $("#i_test").val();
                var mode = $("#i_mode").val();
                var failstop = ($("#i_failstop").prop('checked')) ? 1 : 0;
                var prompt = $('#i_prompt').val();
                var command = $('#i_command').val();
                var pass = $('#i_pass').val();
                var fail = $('#i_fail').val();
                var timeout = $('#i_timeout').val();
                var msg = $('#i_msg').val();
                var comments = $("#i_comments").val();
                var ArchId = Data.Arch;

                if(test == '' || mode == '') {
                    $("#d2").data('Message', 'Please fulfil all the required information!');
                    $("#d2").dialog("open");
                    return;
                }//End if statement

                commit_json_data(URL = "/command",
                                 Data = { Action: 'InsertCommand',
                                          Arch: ArchId, Test: test, Mode: mode,
                                          FailStop: failstop, Prompt: prompt, Command: command,
                                          Pass: pass, Fail: fail, Timeout: timeout,
                                          Msg: msg, Comments: comments
                                        },
                                 Param = {},
                                 OnSuccessCallback = function ( json_resp ) {
                                    var resp = JSON.parse(JSON.stringify(json_resp));
                                    if (resp.Errno == 0) {
                                        var opt = document.createElement("option");
                                        opt.text  = test;
                                        opt.value = test;
                                        opt.setAttribute("data-mode", "mode");
                                        opt.setAttribute("data-failstop", "failstop");
                                        opt.setAttribute("data-prompt", "prompt");
                                        opt.setAttribute("data-cmd", "command");
                                        opt.setAttribute("data-pass", "pass");
                                        opt.setAttribute("data-fail", "fail");
                                        opt.setAttribute("data-timeout", "timeout");
                                        opt.setAttribute("data-msg", "msg");
                                        opt.setAttribute("data-comments", "comments");
                                        // add new command to DataList
                                        document.getElementById("uid_MainTestCmdCb").add(opt);
                                        // add new command to existing Cbb
                                        $(".ucl_SelectMainTestCmd").each(function(index, item) {
                                            var opt = document.createElement("option");
                                            opt.text  = test;
                                            opt.value = test;
                                            opt.setAttribute("data-mode", "mode");
                                            opt.setAttribute("data-failstop", "failstop");
                                            opt.setAttribute("data-prompt", "prompt");
                                            opt.setAttribute("data-cmd", "command");
                                            opt.setAttribute("data-pass", "pass");
                                            opt.setAttribute("data-fail", "fail");
                                            opt.setAttribute("data-timeout", "timeout");
                                            opt.setAttribute("data-msg", "msg");
                                            opt.setAttribute("data-comments", "comments");
                                            item.append(opt); // jquery style
                                        });
                                    }
                                 });
                $(this).dialog("close");
            },
            "Cancel": function() {
                $(this).dialog("close");
            }
        }
    });

    $("#uid_InsertTestCmd_Main").click(function() {
        add_main_testcmd_dlg.dialog("open");
        return false;
    });

    // Main Test: create event handler for CSV import
    var dom_maincsv_dlg = document.createElement("input");
    dom_maincsv_dlg.setAttribute("type", "file");
    dom_maincsv_dlg.setAttribute("accept", ".csv");
    dom_maincsv_dlg.onchange = function(e) {
        import_testcmd_main(e);
    };
    dom_maincsv_dlg.onclick = function() {
        this.value = null; // using DOM element itself
    };
    $("#uid_ImportTestCmd_Main").click(function() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            dom_maincsv_dlg.click();
        } else {
            $("#uid_MsgDlg").data("Message", "This browser does not support File API");
            $("#uid_MsgDlg").dialog("open");
        }
        return false;
    });

    /******************************
     * Second Test Commands Event *
     ******************************/
    $("#uid_SecondTestCmdDlg").on("click", ".ucl_DeleteSecondTestCmd", function() {
        $(this).closest("tr").remove();
        testcmd_dlg_2nd.dialog("option", "position", "center");
        return false;
    });

    $("#uid_SecondTestCmdDlg").on("click", "#uid_InsertSecondTestCmd", function() {
        bind_testcmd_2nd();
        testcmd_dlg_2nd.dialog("option", "position", "center");
        return false;
    });

    $("#uid_SecondTestCmdDlg").on('click', '.ucl_SelectSecondTestCmd', function() {
        var tr_tcmd = $(this).closest("tr");
        var selopt = $(this).find("option:selected");
        tr_tcmd.find('select[name="i_mode"]').val(selopt.data('mode'));
        tr_tcmd.find('input[name="i_failstop"]').prop('checked', selopt.data('failstop'));
        tr_tcmd.find('input[name="i_prompt"]').val(selopt.data('prompt'));
        tr_tcmd.find('input[name="i_command"]').val(selopt.data('cmd'));
        tr_tcmd.find('input[name="i_pass"]').val(selopt.data('pass'));
        tr_tcmd.find('input[name="i_fail"]').val(selopt.data('fail'));
        tr_tcmd.find('input[name="i_timeout"]').val(selopt.data('timeout'));
        tr_tcmd.find('input[name="i_msg"]').val(selopt.data('msg'));
        tr_tcmd.find('input[name="i_comments"]').val(selopt.data('comments'));
    });

    // Second Test: create event handler for CSV import
    var dom_secondcsv_dlg = document.createElement("input");
    dom_secondcsv_dlg.setAttribute("type", "file");
    dom_secondcsv_dlg.setAttribute("accept", ".csv");
    dom_secondcsv_dlg.onchange = function(e) {
        import_testcmd_second(e);
    };
    dom_secondcsv_dlg.onclick = function() {
        $(this).val(""); // using JQuery wrapper-object around the DOM element
    };
    $("#uid_ImportTestCmd_Second").click(function() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            dom_secondcsv_dlg.click();
        } else {
            $("#uid_MsgDlg").data("Message", "This browser does not support File API");
            $("#uid_MsgDlg").dialog("open");
        }
        return false;
    });

    var add_second_testcmd_dlg = $("#uid_AddSecondTestCmd_Dlg").dialog({
        height: 'auto',
        width: 'auto',
        autoOpen: false,
        closeOnEscape:true,
        resizable:false,
        modal: true,
        show:'fade',
        close: function() {
            $("#i_test").val('');
            $("#i_mode").val('');
            $("#i_failstop").prop("checked", false);
            $("#i_prompt").val('');
            $("#i_command").val('');
            $("#i_pass").val('');
            $("#i_fail").val('');
            $("#i_timeout").val('');
            $("#i_msg").val('');
            $("#i_comments").val('');
        },
        buttons: {
            "Add": function() {
                var test = $("#u_test").val();
                var mode = $("#u_mode").val();
                var failstop = ($("#u_failstop").prop('checked')) ? 1 : 0;
                var prompt = $('#u_prompt').val();
                var command = $('#u_command').val();
                var pass = $('#u_pass').val();
                var fail = $('#u_fail').val();
                var timeout = $('#u_timeout').val();
                var msg = $('#u_msg').val();
                var comments = $("#u_comments").val();
                var ArchId = "ast2500";

                if(test == '' || mode == '') {
                    $("#d2").data('Message', 'Please fulfil all the required information!');
                    $("#d2").dialog("open");
                    return
                }//End if statement

                commit_json_data(URL = "/command",
                                 Data = { Action: 'InsertCommand',
                                          Arch: ArchId, Test: test, Mode: mode,
                                          FailStop: failstop, Prompt: prompt, Command: command,
                                          Pass: pass, Fail: fail, Timeout: timeout,
                                          Msg: msg, Comments: comments
                                        },
                                 Param = {},
                                 OnSuccessCallback = function ( json_resp ) {
                                    var resp = JSON.parse(JSON.stringify(json_resp));
                                    if (resp.Errno == 0) {
                                        var opt = document.createElement("option");
                                        opt.text  = test;
                                        opt.value = test;
                                        opt.setAttribute("data-mode", "mode");
                                        opt.setAttribute("data-failstop", "failstop");
                                        opt.setAttribute("data-prompt", "prompt");
                                        opt.setAttribute("data-cmd", "command");
                                        opt.setAttribute("data-pass", "pass");
                                        opt.setAttribute("data-fail", "fail");
                                        opt.setAttribute("data-timeout", "timeout");
                                        opt.setAttribute("data-msg", "msg");
                                        opt.setAttribute("data-comments", "comments");
                                        // add new command to DataList
                                        document.getElementById("uid_SecondTestCmdCb").add(opt);
                                        // add new command to existing Cbb
                                        $(".ucl_SelectSecondTestCmd").each(function(index, item) {
                                            var opt = document.createElement("option");
                                            opt.text  = test;
                                            opt.value = test;
                                            opt.setAttribute("data-mode", "mode");
                                            opt.setAttribute("data-failstop", "failstop");
                                            opt.setAttribute("data-prompt", "prompt");
                                            opt.setAttribute("data-cmd", "command");
                                            opt.setAttribute("data-pass", "pass");
                                            opt.setAttribute("data-fail", "fail");
                                            opt.setAttribute("data-timeout", "timeout");
                                            opt.setAttribute("data-msg", "msg");
                                            opt.setAttribute("data-comments", "comments");
                                            item.append(opt); // jquery style
                                        });
                                    }
                                 });
                $(this).dialog("close");
            },
            "Cancel": function() {
                $(this).dialog("close");
            }
        }
    });

    $("#uid_InsertTestCmd_Second").click(function() {
        add_second_testcmd_dlg.dialog("open");
        return false;
    });

    /***********************
     * Error Table 1 Event *
     ***********************/
    $("#uid_ErrTbl_1_Dlg").on("click", ".ucl_DeleteErrorRow_1", function() {
        $(this).closest("tr").remove();
        error1_dlg.dialog("option", "position", "center");
        return false;
    });

    $("#uid_ErrTbl_1_Dlg").on("click", "#uid_InsertErrorRow_1", function() {
        bind_error_row_1();
        error1_dlg.dialog("option", "position", "center");
        return false;
    });

    // $("#uid_ErrTbl_1_Dlg").on("click", "#uid_ExportErrTbl_1", function() {
    //     return false;
    // });

    // Second Test: create event handler for CSV import
    var dom_error1_dlg = document.createElement("input");
    dom_error1_dlg.setAttribute("type", "file");
    dom_error1_dlg.setAttribute("accept", ".csv");
    dom_error1_dlg.onchange = function(e) {
        import_error_1(e);
    };
    dom_error1_dlg.onclick = function() {
        $(this).val(""); // using JQuery wrapper-object around the DOM element
    };
    $("#uid_ImportErrTbl_1").click(function() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            dom_error1_dlg.click();
        } else {
            $("#uid_MsgDlg").data("Message", "This browser does not support File API");
            $("#uid_MsgDlg").dialog("open");
        }
        return false;
    });

    /***********************
     * Error Table 2 Event *
     ***********************/
     $("#uid_ErrTbl_2_Dlg").on("click", ".ucl_DeleteErrorRow_2", function() {
        $(this).closest("tr").remove();
        error2_dlg.dialog("option", "position", "center");
        return false;
    });

    $("#uid_ErrTbl_2_Dlg").on("click", "#uid_InsertErrorRow_2", function() {
        bind_error_row_2();
        error2_dlg.dialog("option", "position", "center");
        return false;
    });

    // Second Test: create event handler for CSV import
    var dom_error2_dlg = document.createElement("input");
    dom_error2_dlg.setAttribute("type", "file");
    dom_error2_dlg.setAttribute("accept", ".csv");
    dom_error2_dlg.onchange = function(e) {
        import_error_2(e);
    };
    dom_error2_dlg.onclick = function() {
        $(this).val(""); // using JQuery wrapper-object around the DOM element
    };
    $("#uid_ImportErrTbl_2").click(function() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            dom_error2_dlg.click();
        } else {
            $("#uid_MsgDlg").data("Message", "This browser does not support File API");
            $("#uid_MsgDlg").dialog("open");
        }
        return false;
    });
}); // document on ready

function commit_json_data ( URL = "", Data = {}, Param = {}, OnSuccessCallback = null, OnErrorCallback = null ) {
    $.ajax({
        type     : "post",
        url      : URL,
        cache    : false,
        data     : Data,
        dataType : "json",
        success: function ( json_resp ) {
            OnSuccessCallback(json_resp);
        },
        error: function ( json_resp ) {
            if (OnErrorCallback)
                OnErrorCallback(json_resp);
            else {
                // var resp = jQuery.parseJSON(json_resp.responseText);
                $("#uid_MsgDlg").data("Message", json_resp.responseText);
                $("#uid_MsgDlg").dialog("open");
            }
        }
    });
}

function commit_all_board_ini ( BoardIni_Data ) {
    commit_json_data(URL = "/test",
                     Data = { Action: 'SetDefaultBoardConfigList',
                              Data: JSON.stringify(BoardIni_Data)
                            },
                     Param = {},
                     OnSuccessCallback = function ( json_resp ) {
                        var resp = JSON.parse(JSON.stringify(json_resp));
                        if (resp.Errno == 0) {
                            // reload config after commit
                            get_board_config();
                            // show dialog
                            $("#uid_MsgDlg").data('Message', "File saved successfully");
                            $("#uid_MsgDlg").dialog("open");
                        } else {
                            $("#uid_MsgDlg").data('Message', resp.Message);
                            $("#uid_MsgDlg").dialog("open");
                        }
                     });
}

function get_test_command ( DataList, ArchId, Callback = null ) {
    // remove old existed data
    DataList.innerHTML = "";
    // request list of test commands
    commit_json_data(URL = "/command",
                     Data = { Action : "GetTestCommand", Arch : ArchId },
                     Param = {},
                     OnSuccessCallback = function ( json_resp ) {
                        var resp = JSON.parse(JSON.stringify(json_resp));
                        if (resp.Errno != 0) {
                            $("#uid_MsgDlg").data("Message", resp.Message);
                            $("#uid_MsgDlg").dialog("open");
                            return;
                        }
                        // add new data
                        var RespData = resp.Data;
                        for (t in RespData) {
                            var opt = document.createElement("option");
                            opt.text  = RespData[t]["Test"];
                            opt.value = RespData[t]["Test"];
                            opt.setAttribute("data-mode", RespData[t]["Mode"]);
                            opt.setAttribute("data-failstop", RespData[t]["FailStop"]);
                            opt.setAttribute("data-prompt", RespData[t]["Prompt"]);
                            opt.setAttribute("data-cmd", RespData[t]["Command"]);
                            opt.setAttribute("data-pass", RespData[t]["Pass"]);
                            opt.setAttribute("data-fail", RespData[t]["Fail"]);
                            opt.setAttribute("data-timeout", RespData[t]["Timeout"]);
                            opt.setAttribute("data-msg", RespData[t]["Msg"]);
                            opt.setAttribute("data-comments", RespData[t]["Comments"]);
                            DataList.add(opt);
                        }
                        // Callback
                        if (Callback)
                            Callback();
                     });
}

function import_board_ini ( e ) {
    // no file selected
    if (!e || e.target.files.length <= 0)
        return;
    var filename = e.target.files[0];
    var file_reader = new FileReader();

    // Predefined constants for string processing
    var CELL_DELIMITER = ",";

    // read & parse csv file
    file_reader.readAsText(filename);
    file_reader.onload = function (e) {
        var cfg_content = e.target.result;
        $("#uid_TxtBoardCfg").val(cfg_content);
    };
}

function import_testcmd_main ( e ) {
    // no file selected
    if (!e || e.target.files.length <= 0)
        return;
    var csv_file = e.target.files[0];
    var file_reader = new FileReader();

    // Predefined constants for string processing
    var CELL_DELIMITER = ",";

    // read & parse csv file
    file_reader.readAsText(csv_file);
    file_reader.onload = function (e) {
        var testcmds = [];
        var csvlines = e.target.result.split(/\r?\n/g);

        // read whole csv file & load test commands to an array
        for (var i = 1; i < csvlines.length; ++i) { // skip csv header line
            if (!csvlines[i] || !csvlines[i].trim() || csvlines[i][0] == "#")
                continue;
            testcmds.push({
                "Test"     : csvlines[i].split(CELL_DELIMITER)[0].trim(),
                "Mode"     : csvlines[i].split(CELL_DELIMITER)[1].trim(),
                "FailStop" : csvlines[i].split(CELL_DELIMITER)[2].trim(),
                "Prompt"   : csvlines[i].split(CELL_DELIMITER)[3].trim(),
                "Command"  : csvlines[i].split(CELL_DELIMITER)[4].trim(),
                "Pass"     : csvlines[i].split(CELL_DELIMITER)[5].trim(),
                "Fail"     : csvlines[i].split(CELL_DELIMITER)[6].trim(),
                "Timeout"  : csvlines[i].split(CELL_DELIMITER)[7].trim(),
                "Msg"      : csvlines[i].split(CELL_DELIMITER)[8].trim(),
                "Comments" : csvlines[i].split(CELL_DELIMITER)[9].trim(),
            });
        }

        // verify that the test command is existing or not
        var current_testcmds = $("#uid_MainTestCmdCb").find("option").clone();
        var ArchId = Data.Arch;
        for (i in testcmds) {
            var flag = 0;
            var cmd = testcmds[i];
            for (j in current_testcmds) {
                if (current_testcmds[j].value === cmd.Test) {
                    flag = 1;
                    break;
                }
            }
            if (!flag) {
                var msg = "Test Command '" + cmd.Test + "' is not exist in Database.\n"
                          + "Do you want to inseret it to DB?";
                if (confirm(msg)) {
                    // the command in CSV file is new, insert it to database
                    commit_json_data(URL = "/command",
                                     Data = { Action : "InsertCommand",
                                              Arch: ArchId, Test: cmd.Test, Mode: cmd.Mode,
                                              FailStop: cmd.FailStop, Prompt: cmd.Prompt,
                                              Command: cmd.Command, Pass: cmd.Pass, Fail: cmd.Fail,
                                              Timeout: cmd.Timeout, Msg: cmd.Msg, Comments: cmd.Comments },
                                     Param = {},
                                     OnSuccessCallback = function ( json_resp ) {
                                         var resp = JSON.parse(JSON.stringify(json_resp));
                                         if (resp.Errno == 0) {
                                            get_test_command(document.getElementById("uid_MainTestCmdCb"), ArchId);
                                         }
                                    });
                }
            }
        }
        // reload test commands
        get_test_command(document.getElementById("uid_MainTestCmdCb"),
                         ArchId,
                         function() {
                            // complete loading, start binding to data table
                            if ($("#uid_MainTestCmdTbl").find("tbody").length != 0)
                                $("#uid_MainTestCmdTbl").find("tbody").empty();
                            for (i in testcmds)
                                bind_testcmd_1st(testcmds[i]);
                            // re-draw dialog to center position
                            $("#uid_MainTestCmdDlg").dialog("option","position","center");                            
                        });
    };
}

function import_testcmd_second ( e ) {
    // no file selected
    if (!e || e.target.files.length <= 0)
        return;
    var csv_file = e.target.files[0];
    var file_reader = new FileReader();

    // Predefined constants for string processing
    var CELL_DELIMITER = ",";

    // read & parse csv file
    file_reader.readAsText(csv_file);
    file_reader.onload = function (e) {
        var testcmds = [];
        var csvlines = e.target.result.split(/\r?\n/g);

        // read whole csv file & load test commands to an array
        for (var i = 1; i < csvlines.length; ++i) { // skip csv header line
            if (!csvlines[i] || !csvlines[i].trim() || csvlines[i][0] == "#")
                continue;
            testcmds.push({
                "Test"     : csvlines[i].split(CELL_DELIMITER)[0].trim(),
                "Mode"     : csvlines[i].split(CELL_DELIMITER)[1].trim(),
                "FailStop" : csvlines[i].split(CELL_DELIMITER)[2].trim(),
                "Prompt"   : csvlines[i].split(CELL_DELIMITER)[3].trim(),
                "Command"  : csvlines[i].split(CELL_DELIMITER)[4].trim(),
                "Pass"     : csvlines[i].split(CELL_DELIMITER)[5].trim(),
                "Fail"     : csvlines[i].split(CELL_DELIMITER)[6].trim(),
                "Timeout"  : csvlines[i].split(CELL_DELIMITER)[7].trim(),
                "Msg"      : csvlines[i].split(CELL_DELIMITER)[8].trim(),
                "Comments" : csvlines[i].split(CELL_DELIMITER)[9].trim(),
            });
        }

        // verify that the test command is existing or not
        var current_testcmds = $("#uid_SecondTestCmdCb").find("option").clone();
        var ArchId = "ast2500";
        for (i in testcmds) {
            var flag = 0;
            var cmd = testcmds[i];
            for (j in current_testcmds) {
                if (current_testcmds[j].value === cmd.Test) {
                    flag = 1;
                    break;
                }
            }
            if (!flag) {
                var msg = "Test Command '" + cmd.Test + "' is not exist in Database.\n"
                          + "Do you want to inseret it to DB?";
                if (confirm(msg)) {
                    // the command in CSV file is new, insert it to database
                    commit_json_data(URL = "/command",
                                     Data = { Action : "InsertCommand",
                                              Arch: ArchId, Test: cmd.Test, Mode: cmd.Mode,
                                              FailStop: cmd.FailStop, Prompt: cmd.Prompt,
                                              Command: cmd.Command, Pass: cmd.Pass, Fail: cmd.Fail,
                                              Timeout: cmd.Timeout, Msg: cmd.Msg, Comments: cmd.Comments },
                                     Param = {},
                                     OnSuccessCallback = function ( json_resp ) {
                                         var resp = JSON.parse(JSON.stringify(json_resp));
                                         if (resp.Errno == 0) {
                                            get_test_command(document.getElementById("uid_SecondTestCmdCb"), ArchId);
                                         }
                                     });
                }
            }
        }

        // reload test commands
        get_test_command(document.getElementById("uid_SecondTestCmdCb"),
                         ArchId,
                         function() {
                            // complete loading, start binding to data table
                            if ($("#uid_SecondTestCmdTbl").find("tbody").length != 0)
                                $("#uid_SecondTestCmdTbl").find("tbody").empty();
                            for (i in testcmds)
                                bind_testcmd_2nd(testcmds[i]);
                            // re-draw dialog to center position
                            $("#uid_SecondTestCmdDlg").dialog("option","position","center");                            
                         });
    };
}

function import_error_1 ( e ) {
    // no file selected
    if (!e || e.target.files.length <= 0)
        return;
    var csv_file = e.target.files[0];
    var file_reader = new FileReader();

    // Predefined constants for string processing
    var CELL_DELIMITER = ",";

    // read & parse csv file
    file_reader.readAsText(csv_file);
    file_reader.onload = function (e) {
        var error_data = [];
        var csvlines = e.target.result.split(/\r?\n/g);

        // read whole csv file & load test commands to an array
        for (var i = 1; i < csvlines.length; ++i) { // skip csv header line
            if (!csvlines[i] || !csvlines[i].trim() || csvlines[i][0] == "#")
                continue;
            error_data.push({
                "Name"     : csvlines[i].split(CELL_DELIMITER)[0],
                "Type"     : csvlines[i].split(CELL_DELIMITER)[1],
                "Expected" : csvlines[i].split(CELL_DELIMITER)[2],
                "Result"   : csvlines[i].split(CELL_DELIMITER)[3],
                "Timeout"  : csvlines[i].split(CELL_DELIMITER)[4],
            });
        }

        // complete loading, start binding to data table
        if ($("#uid_ErrorTable_1").find("tbody").length != 0)
            $("#uid_ErrorTable_1").find("tbody").empty();
        for (i in error_data)
            bind_error_row_1(error_data[i]);
        // re-draw dialog to center position
        $("#uid_ErrTbl_1_Dlg").dialog("option","position","center");
    };
}

function import_error_2 ( e ) {
    // no file selected
    if (!e || e.target.files.length <= 0)
        return;
    var csv_file = e.target.files[0];
    var file_reader = new FileReader();

    // Predefined constants for string processing
    var CELL_DELIMITER = ",";

    // read & parse csv file
    file_reader.readAsText(csv_file);
    file_reader.onload = function (e) {
        var error_data = [];
        var csvlines = e.target.result.split(/\r?\n/g);

        // read whole csv file & load test commands to an array
        for (var i = 1; i < csvlines.length; ++i) { // skip csv header line
            if (!csvlines[i] || !csvlines[i].trim() || csvlines[i][0] == "#")
                continue;
            error_data.push({
                "Name"     : csvlines[i].split(CELL_DELIMITER)[0],
                "Type"     : csvlines[i].split(CELL_DELIMITER)[1],
                "Expected" : csvlines[i].split(CELL_DELIMITER)[2],
                "Result"   : csvlines[i].split(CELL_DELIMITER)[3],
                "Timeout"  : csvlines[i].split(CELL_DELIMITER)[4],
            });
        }

        // complete loading, start binding to data table
        if ($("#uid_ErrorTable_2").find("tbody").length != 0)
            $("#uid_ErrorTable_2").find("tbody").empty();
        for (i in error_data)
            bind_error_row_2(error_data[i]);
        // re-draw dialog to center position
        $("#uid_ErrTbl_2_Dlg").dialog("option","position","center");
    };
}

function get_board_config ( ) {
    // remove old existing data
    if ($("#uid_BoardCfgTbl").find("tbody").length != 0)
        $("#uid_BoardCfgTbl").find("tbody").empty();

    // request test configuration
    commit_json_data(URL = "/test",
                     Data = { Action : "GetDefaultBoardConfigList" },
                     Param = {},
                     OnSuccessCallback = function ( json_resp ) {
                        var resp = JSON.parse(JSON.stringify(json_resp));
                        if (resp.Errno) {
                            $("#uid_MsgDlg").data("Message", resp.Message);
                            $("#uid_MsgDlg").dialog("open");
                        } else {
                            // add new data
                            for (tm in resp.Data) {
                                bind_board_cfg(resp.Data[tm]);
                            }
                        }
                     });
}

function bind_board_cfg ( boardcfg = null ) {
    var tr_html = "";
    tr_html += '<tr class="BoardCfg">';
    tr_html += '    <td style="text-align:center;"><input type="text" class="form-control" style="border-style: none" placeholder="Board description" name="i_boardcfg"/></td>';
    tr_html += '    <td style="text-align:center;"><a class="ucl_EditBoardIni" style="color:#0000EE;" title="Edit board configuration" href="#"><input type="image" src="Static/images/edit.png" /></a></td>';
    tr_html += '    <td style="text-align:center;"><a class="ucl_EditBoardCfg" style="color:#0000EE;" title="Edit test configuration" href="#"><input type="image" src="Static/images/edit.png" /></a></td>';
    tr_html += '    <td style="text-align:center;">';
    tr_html += '        <a class="ucl_DeleteBoardCfg" title="Click here to delete record." href="#"><i class="icon-trash"></i></a>';
    tr_html += '    </td>';
    tr_html += '</tr>';
    $("#uid_BoardCfgTbl").find('tbody').append(tr_html);

    if (boardcfg) {
        var new_tr = $("#uid_BoardCfgTbl").find('tbody tr:last');
        new_tr.data("ID", boardcfg.ID);
        new_tr.find('input[name="i_boardcfg"]').val(boardcfg.Text);
        new_tr.data("BoardIni_Data", boardcfg.IniData);
    }
}

function bind_test_cfg ( testcfg = null ) {
    var tr_html = "";
    tr_html += '<tr class="TestCfg">';
    tr_html += '    <td style="text-align:center;"><input title="Enter text only." type="text" placeholder="Display on LCD" name="i_text" style="border-style: none;width: 220px;"/></td>';
    tr_html += '    <td style="text-align:center;"><select placeholder="Select Mode" name="i_sltmode" class="ucl_SelectSltMode" style="border-style: none;width: 120px"></select></td>';
    tr_html += '    <td style="text-align:center;"><a style="color:#0000EE;" class="ucl_EditMainTestCfg" href="#">Edit</a></td>';
    tr_html += '    <td style="text-align:center;"><a style="color:#0000EE;" class="ucl_EditSecondTestCfg" href="#">Edit</a></td>';
    tr_html += '    <td style="text-align:center;"><a style="color:#0000EE;" class="ucl_EditErrTbl1" href="#">Edit</a></td>';
    tr_html += '    <td style="text-align:center;"><a style="color:#0000EE;" class="ucl_EditErrTbl2" href="#">Edit</a></td>';
    tr_html += '    <td style="text-align:center;">';
    tr_html += '        <a class="ucl_DeleteTestCfg" title="Click here to delete record." href="#"><i class="icon-trash"></i></a>';
    tr_html += '    </td>';
    tr_html += '</tr>';
    // $(this).closest("table").find('tbody').append(tr_html);
    $("#uid_TestCfgTbl").find('tbody').append(tr_html);
    var new_tr = $("#uid_TestCfgTbl").find('tbody tr:last');
    $("#uid_SltModeCb").find("option").clone().appendTo(new_tr.find('select[name="i_sltmode"]'));

    if (testcfg) {
        new_tr.data("ID", testcfg.ID);
        new_tr.find('input[name="i_text"]').val(testcfg.Display);
        new_tr.find('select[name="i_sltmode"]').val(testcfg.Mode);
        new_tr.data('MainData', testcfg.MainData);
        new_tr.data('SecondData', testcfg.SecondData);
        new_tr.data('ErrorData1', testcfg.ErrorData1);
        new_tr.data('ErrorData2', testcfg.ErrorData2);
    }
}

function bind_testcmd_1st ( cmd = null ) {
    var tr_html = "";
    tr_html += "<tr class='TestCommand'>";
    tr_html += "    <td style='text-align:center;'>";
    tr_html += "        <select placeholder='Select Test' name='i_test' class='ucl_SelectMainTestCmd' style='width: 100px;'></select>";
    tr_html += "    </td>";
    tr_html += "    <td style='text-align:center;'>";
    tr_html += "        <select placeholder='Select Mode' name='i_mode' class='ucl_SelectTestMode' style='width: 100px;'></select>";
    tr_html += "    </td>";
    tr_html += "    <td style='text-align:center;'>";
    tr_html += "        <label class='switch switch-green'>";
    tr_html += "            <input type='checkbox' class='switch-input' name='i_failstop'>";
    tr_html += "            <span class='switch-label' data-on='1' data-off='0'></span>";
    tr_html += "            <span class='switch-handle'></span>";
    tr_html += "        </label></td>";
    tr_html += "    <td><input type='text' name='i_prompt' class='i_prompt' style='width: 60px;'/></td>";
    tr_html += "    <td><input title='Enter text only.' type='text' placeholder='Test command' name='i_command' style='width: 120px;'/></td>";
    tr_html += "    <td><input type='text' name='i_pass' class='i_pass' /></td>";
    tr_html += "    <td><input type='text' name='i_fail' class='i_fail' /></td>";
    tr_html += "    <td style='text-align:center;'><input title='Enter text only.' type='number' placeholder='Timeout' name='i_timeout' min='0' step='1' max='300' value='60' style='max-width: 60px;border-style: none'/></td>";
    tr_html += "    <td style='text-align:center;'><input title='Enter text only.' type='text' placeholder='LCD text' name='i_msg' style='width: 120px;'/></td>";
    tr_html += "    <td style='text-align:center;'>";
    tr_html += "        <a class='ucl_DeleteMainTestCmd' title='Click here to delete record.' href='#'><i class='icon-trash'></i></a>";
    tr_html += "        <input type='hidden' name='i_comments' class='i_comments'/>";
    tr_html += "    </td>";
    tr_html += "</tr>";
    // $(this).closest("table").find('tbody').append(tr_html);
    $("#uid_MainTestCmdTbl").find("tbody").append(tr_html);
    // generate test commands select box
    var new_tr = $("#uid_MainTestCmdTbl").find("tbody tr:last");
    $("#uid_MainTestCmdCb").find("option").clone().appendTo(new_tr.find("select[name='i_test']"));
    $("#uid_TestModeCb").find("option").clone().appendTo(new_tr.find('select[name="i_mode"]'));

    // get recently appended tr and assign data
    if (cmd) {
        new_tr.find("select[name='i_test']").val(cmd.Test);
        new_tr.find("select[name='i_mode']").val(cmd.Mode);
        new_tr.find("input[name='i_failstop']").prop("checked", parseInt(cmd.FailStop));
        new_tr.find("input[name='i_command']").val(cmd.Command);
        new_tr.find("input[name='i_timeout']").val(cmd.Timeout);
        new_tr.find("input[name='i_msg']").val(cmd.Msg);
        new_tr.find("input[name='i_prompt']").val(cmd.Prompt);
        new_tr.find("input[name='i_pass']").val(cmd.Pass);
        new_tr.find("input[name='i_fail']").val(cmd.Fail);
        new_tr.find("input[name='i_comments']").val(cmd.Comments);
    }
}

function bind_testcmd_2nd ( cmd = null ) {
    var tr_html = "";
    tr_html += '<tr class="TestCommand">';
    tr_html += '    <td style="text-align:center;">';
    tr_html += '        <select placeholder="Select Test" name="i_test" class="ucl_SelectSecondTestCmd" style="width: 100px;"></select>';
    tr_html += '    </td>';
    tr_html += "    <td style='text-align:center;'>";
    tr_html += "        <select placeholder='Select Mode' name='i_mode' class='ucl_SelectTestMode' style='width: 100px;'></select>";
    tr_html += "    </td>";
    tr_html += '    <td style="text-align:center;">';
    tr_html += '        <label class="switch switch-green">';
    tr_html += '            <input type="checkbox" class="switch-input" name="i_failstop">';
    tr_html += '            <span class="switch-label" data-on="1" data-off="0"></span>';
    tr_html += '            <span class="switch-handle"></span>';
    tr_html += '        </label></td>';
    tr_html += '    <td><input type="text" name="i_prompt" class="i_prompt" style="width: 60px;"/></td>';
    tr_html += '    <td><input title="Enter text only." type="text" placeholder="Test command" name="i_command" style="width: 120px;"/></td>';
    tr_html += '    <td><input type="text" name="i_pass" class="i_pass" /></td>';
    tr_html += '    <td><input type="text" name="i_fail" class="i_fail" /></td>';
    tr_html += '    <td style="text-align:center;"><input title="Enter text only." type="number" placeholder="Timeout" name="i_timeout" min="0" step="10" max="300" value="60" style="width: 40px;"/></td>';
    tr_html += '    <td style="text-align:center;"><input title="Enter text only." type="text" placeholder="LCD text" name="i_msg" style="width: 120px;"/></td>';
    tr_html += '    <td style="text-align:center;">';
    tr_html += '        <a class="ucl_DeleteSecondTestCmd" title="Click here to delete record." href="#"><i class="icon-trash"></i></a>';
    tr_html += '        <input type="hidden" name="i_comments" class="i_comments"/>';
    tr_html += '    </td>';
    tr_html += '</tr>';
    // $(this).closest("table").find('tbody').append(tr_html);
    $("#uid_SecondTestCmdTbl").find('tbody').append(tr_html);
    // generate test commands & test modes select box
    var new_tr = $("#uid_SecondTestCmdTbl").find('tbody tr:last');
    $("#uid_SecondTestCmdCb").find("option").clone().appendTo(new_tr.find('select[name="i_test"]'));
    $("#uid_TestModeCb").find("option").clone().appendTo(new_tr.find('select[name="i_mode"]'));

    // get recently appended tr and assign data
    if (cmd) {
        new_tr.find('select[name="i_test"]').val(cmd.Test);
        new_tr.find('select[name="i_mode"]').val(cmd.Mode);
        new_tr.find('input[name="i_failstop"]').prop("checked", cmd.FailStop);
        new_tr.find('input[name="i_command"]').val(cmd.Command);
        new_tr.find('input[name="i_timeout"]').val(cmd.Timeout);
        new_tr.find('input[name="i_msg"]').val(cmd.Msg);
        new_tr.find('input[name="i_prompt"]').val(cmd.Prompt);
        new_tr.find('input[name="i_pass"]').val(cmd.Pass);
        new_tr.find('input[name="i_fail"]').val(cmd.Fail);
        new_tr.find('input[name="i_comments"]').val(cmd.Comments);
    }
}

function bind_error_row_1 ( error_data ) {
    var tr_html = "";
    tr_html += '<tr class="ErrorData">';
    tr_html += '    <td style="text-align:center;"><input type="text" name="i_name" style="width: 80px;"/></td>';
    tr_html += '    <td style="text-align:center;"><input type="text" name="i_type" style="width: 80px;"/></td>';
    tr_html += '    <td style="text-align:center;"><input type="text" name="i_expected" style="width: 80px;"/></td>';
    tr_html += '    <td style="text-align:center;"><input type="text" name="i_result" style="width: 80px;"/></td>';
    tr_html += '    <td style="text-align:center;"><input type="number" name="i_timeout" min="0" step="10" max="300" value="60" style="width: 80px;"/></td>';
    tr_html += '    <td style="text-align:center;"><input type="text" name="i_msg" style="width: 80px;"/></td>';
    tr_html += '    <td style="text-align:center;">';
    tr_html += '        <a class="ucl_DeleteErrorRow_1" title="Click here to delete record." href="#"><i class="icon-trash"></i></a>';
    tr_html += '    </td>';
    tr_html += '</tr>';
    $("#uid_ErrorTable_1").find('tbody').append(tr_html);

    if (error_data) {
        var new_tr = $("#uid_ErrorTable_1").find('tbody tr:last');
        new_tr.find('input[name="i_name"]').val(error_data.Name);
        new_tr.find('input[name="i_type"]').val(error_data.Type);
        new_tr.find('input[name="i_expected"]').val(error_data.Expected);
        new_tr.find('input[name="i_result"]').val(error_data.Result);
        new_tr.find('input[name="i_timeout"]').val(error_data.Timeout);
        new_tr.find('input[name="i_msg"]').val(error_data.Msg);
    }

}

function bind_error_row_2 ( error_data ) {
    var tr_html = "";
    tr_html += '<tr class="ErrorData">';
    tr_html += '    <td style="text-align:center;"><input type="text" name="i_name" style="width: 80px;"/></td>';
    tr_html += '    <td style="text-align:center;"><input type="text" name="i_type" style="width: 80px;"/></td>';
    tr_html += '    <td style="text-align:center;"><input type="text" name="i_expected" style="width: 80px;"/></td>';
    tr_html += '    <td style="text-align:center;"><input type="text" name="i_result" style="width: 80px;"/></td>';
    tr_html += '    <td style="text-align:center;"><input type="number" name="i_timeout" min="0" step="10" max="300" value="60" style="width: 80px;"/></td>';
    tr_html += '    <td style="text-align:center;"><input type="text" name="i_msg" style="width: 80px;"/></td>';
    tr_html += '    <td style="text-align:center;">';
    tr_html += '        <a class="ucl_DeleteErrorRow_2" title="Click here to delete record." href="#"><i class="icon-trash"></i></a>';
    tr_html += '    </td>';
    tr_html += '</tr>';
    $("#uid_ErrorTable_2").find('tbody').append(tr_html);

    if (error_data) {
        var new_tr = $("#uid_ErrorTable_2").find('tbody tr:last');
        new_tr.find('input[name="i_name"]').val(error_data.Name);
        new_tr.find('input[name="i_type"]').val(error_data.Type);
        new_tr.find('input[name="i_expected"]').val(error_data.Expected);
        new_tr.find('input[name="i_result"]').val(error_data.Result);
        new_tr.find('input[name="i_timeout"]').val(error_data.Timeout);
        new_tr.find('input[name="i_msg"]').val(error_data.Msg);
    }
}

function import_testcfg ( TestCfgID, menu_dipslay, fds, reload_ui = true ) {
    // Predefined constants for string processing
    var CELL_DELIMITER = ",";

    // find menu display file
    var fd = null;
    for (var i = 0; i < fds.length; ++i) {
        console.log("%s == %s == %s", menu_dipslay, fds[i].name, MENU_DISPLAY);
        if (fds[i].name == menu_dipslay || fds[i].name == MENU_DISPLAY) {
            fd = fds[i];
            break;
        }
    }
    if (!fd) {
        $("#uid_MsgDlg").data("Message", "Could not find menu display file");
        $("#uid_MsgDlg").dialog("open");
        return;
    }

    // parse & import test config
    file_reader = new FileReader();
    file_reader.readAsText(fd);
    file_reader.onload = function (e) {
        // loop all csv lines in menu display file
        var BoardCfg_Data = [];
        var csvlines = e.target.result.split(/\r?\n/g);
        for (var i = 1; i < csvlines.length; ++i) { // skip csv header line
            if (!csvlines[i] || !csvlines[i].trim() || csvlines[i][0] == "#")
                continue;
            BoardCfg_Data.push({
                "ID"      : TestCfgID,
                "Display" : csvlines[i].split(CELL_DELIMITER)[0].trim(),
                "Mode"    : csvlines[i].split(CELL_DELIMITER)[1].trim(),
                "MainData"   : [],
                "SecondData" : [],
                "ErrorData1" : [],
                "ErrorData2" : [],
            });
            var MainData_fn = csvlines[i].split(CELL_DELIMITER)[2].trim();
            var SecondData_fn = csvlines[i].split(CELL_DELIMITER)[3].trim();
            var ErrorData1_fn = csvlines[i].split(CELL_DELIMITER)[4].trim();
            var ErrorData2_fn = csvlines[i].split(CELL_DELIMITER)[5].trim();
            import_maindata(BoardCfg_Data[BoardCfg_Data.length - 1],
                            MainData_fn, SecondData_fn, ErrorData1_fn, ErrorData2_fn, fds);
        }
        // reload UI
        if (reload_ui) {
            delay(200);
            if ($("#uid_TestCfgTbl").find("tbody").length != 0)
                $("#uid_TestCfgTbl").find("tbody").empty();
            for (i in BoardCfg_Data)
                bind_test_cfg(BoardCfg_Data[i]);
        }
    }
}

function import_maindata ( BoardCfg, MainData_fn, SecondData_fn, ErrorData1_fn, ErrorData2_fn, fds ) {
    // Predefined constants for string processing
    var CELL_DELIMITER = ",";
    // find main data file
    var fd = null;
    for (var i = 0; i < fds.length; ++i) {
        if (fds[i].name == MainData_fn) {
            fd = fds[i];
            break;
        }
    }
    if (!fd) {
        // import second data
        import_seconddata(BoardCfg, SecondData_fn, ErrorData1_fn, ErrorData2_fn, fds);
        return;
    }

    // read & parse csv file
    var file_reader = new FileReader();
    file_reader.readAsText(fd);
    file_reader.onload = function (e) {
        var ArchId = Data.Arch;
        
        // read whole csv file & load test commands to an array
        var csvlines = e.target.result.split(/\r?\n/g);
        for (var i = 1; i < csvlines.length; ++i) { // skip csv header line
            if (!csvlines[i] || !csvlines[i].trim() || csvlines[i][0] == "#")
                continue;
            BoardCfg["MainData"].push({
                "Test"     : csvlines[i].split(CELL_DELIMITER)[0].trim(),
                "Mode"     : csvlines[i].split(CELL_DELIMITER)[1].trim(),
                "FailStop" : csvlines[i].split(CELL_DELIMITER)[2].trim(),
                "Prompt"   : csvlines[i].split(CELL_DELIMITER)[3].trim(),
                "Command"  : csvlines[i].split(CELL_DELIMITER)[4].trim(),
                "Pass"     : csvlines[i].split(CELL_DELIMITER)[5].trim(),
                "Fail"     : csvlines[i].split(CELL_DELIMITER)[6].trim(),
                "Timeout"  : csvlines[i].split(CELL_DELIMITER)[7].trim(),
                "Msg"      : csvlines[i].split(CELL_DELIMITER)[8].trim(),
                "Comments" : csvlines[i].split(CELL_DELIMITER)[9].trim(),
            });
        }
        // verify that the test command is existing or not
        var current_testcmds = $("#uid_MainTestCmdCb").find("option").clone();
        for (i in BoardCfg["MainData"]) {
            var flag = 0;
            var cmd = BoardCfg["MainData"][i];
            for (j in current_testcmds) {
                console.log("%s == %s", current_testcmds[j].value, cmd.Test)
                if (current_testcmds[j].value == cmd.Test) {
                    flag = 1;
                    break;
                }
            }
            if (!flag) {
                console.log("Insert 1st Test Cmd: %s", cmd.Test);
                // var msg = "Test Command '" + cmd.Test + "' is not exist in Database.\n"
                //           + "Do you want to inseret it to DB?";
                // if (confirm(msg)) {
                //     the command in CSV file is new, insert it to database
                //     commit_json_data(URL = "/command",
                //                      Data = { Action : "InsertCommand",
                //                               Arch: ArchId, Test: cmd.Test, Mode: cmd.Mode,
                //                               FailStop: cmd.FailStop, Prompt: cmd.Prompt,
                //                               Command: cmd.Command, Pass: cmd.Pass, Fail: cmd.Fail,
                //                               Timeout: cmd.Timeout, Msg: cmd.Msg, Comments: cmd.Comments });
                // }
            }
        }
        // reload test commands
        get_test_command(document.getElementById("uid_MainTestCmdCb"), ArchId);
        // import second data
        import_seconddata(BoardCfg, SecondData_fn, ErrorData1_fn, ErrorData2_fn, fds);
    };
}

function import_seconddata ( BoardCfg, SecondData_fn, ErrorData1_fn, ErrorData2_fn, fds ) {
    // Predefined constants for string processing
    var CELL_DELIMITER = ",";
    // find main data file
    var fd = null;
    for (var i = 0; i < fds.length; ++i) {
        if (fds[i].name == SecondData_fn) {
            fd = fds[i];
            break;
        }
    }
    if (!fd) {
        // import error data 1
        import_errordata1(BoardCfg, ErrorData1_fn, ErrorData2_fn, fds);
        return;
    }

    // read & parse csv file
    var file_reader = new FileReader();
    file_reader.readAsText(fd);
    file_reader.onload = function (e) {
        var csvlines = e.target.result.split(/\r?\n/g);

        // read whole csv file & load test commands to an array
        for (var i = 1; i < csvlines.length; ++i) { // skip csv header line
            if (!csvlines[i] || !csvlines[i].trim() || csvlines[i][0] == "#")
                continue;
            BoardCfg["SecondData"].push({
                "Test"     : csvlines[i].split(CELL_DELIMITER)[0].trim(),
                "Mode"     : csvlines[i].split(CELL_DELIMITER)[1].trim(),
                "FailStop" : csvlines[i].split(CELL_DELIMITER)[2].trim(),
                "Prompt"   : csvlines[i].split(CELL_DELIMITER)[3].trim(),
                "Command"  : csvlines[i].split(CELL_DELIMITER)[4].trim(),
                "Pass"     : csvlines[i].split(CELL_DELIMITER)[5].trim(),
                "Fail"     : csvlines[i].split(CELL_DELIMITER)[6].trim(),
                "Timeout"  : csvlines[i].split(CELL_DELIMITER)[7].trim(),
                "Msg"      : csvlines[i].split(CELL_DELIMITER)[8].trim(),
                "Comments" : csvlines[i].split(CELL_DELIMITER)[9].trim(),
            });
        }

        // verify that the test command is existing or not
        var current_testcmds = $("#uid_SecondTestCmdCb").find("option").clone();
        var ArchId = "ast2500";
        for (i in BoardCfg["SecondData"]) {
            var flag = 0;
            var cmd = BoardCfg["SecondData"][i];
            for (j in current_testcmds) {
                if (current_testcmds[j].value === cmd.Test) {
                    flag = 1;
                    break;
                }
            }
            if (!flag) {
                console.log("Insert 2nd Test Cmd: %s", cmd.Test);
                // var msg = "Test Command '" + cmd.Test + "' is not exist in Database.\n"
                //           + "Do you want to inseret it to DB?";
                // if (confirm(msg)) {
                //     // the command in CSV file is new, insert it to database
                //     commit_json_data(URL = "/command",
                //                      Data = { Action : "InsertCommand",
                //                               Arch: ArchId, Test: cmd.Test, Mode: cmd.Mode,
                //                               FailStop: cmd.FailStop, Prompt: cmd.Prompt,
                //                               Command: cmd.Command, Pass: cmd.Pass, Fail: cmd.Fail,
                //                               Timeout: cmd.Timeout, Msg: cmd.Msg, Comments: cmd.Comments });
                // }
            }
        }
        // reload test commands
        get_test_command(document.getElementById("uid_SecondTestCmdCb"), ArchId);
        // import error data 1
        import_errordata1(BoardCfg, ErrorData1_fn, ErrorData2_fn, fds);
    };
}

function import_errordata1 ( BoardCfg, ErrorData1_fn, ErrorData2_fn, fds ) {
    // Predefined constants for string processing
    var CELL_DELIMITER = ",";
    // find error data 1 file
    var fd = null;
    for (var i = 0; i < fds.length; ++i) {
        if (fds[i].name == ErrorData1_fn) {
            fd = fds[i];
            break;
        }
    }
    if (!fd) {
        // import error data 2
        import_errordata2(BoardCfg, ErrorData2_fn, fds);
        return;
    }

    // read & parse csv file
    var file_reader = new FileReader();
    file_reader.readAsText(fd);
    file_reader.onload = function (e) {
        var csvlines = e.target.result.split(/\r?\n/g);

        // read whole csv file & load test commands to an array
        for (var i = 1; i < csvlines.length; ++i) { // skip csv header line
            if (!csvlines[i] || !csvlines[i].trim() || csvlines[i][0] == "#")
                continue;
            BoardCfg["ErrorData1"].push({
                "Name"     : csvlines[i].split(CELL_DELIMITER)[0],
                "Type"     : csvlines[i].split(CELL_DELIMITER)[1],
                "Expected" : csvlines[i].split(CELL_DELIMITER)[2],
                "Result"   : csvlines[i].split(CELL_DELIMITER)[3],
                "Timeout"  : csvlines[i].split(CELL_DELIMITER)[4],
                "Msg"      : csvlines[i].split(CELL_DELIMITER)[5],
            });
        }
        // import error data 2
        import_errordata2(BoardCfg, ErrorData2_fn, fds);
    };
}

function import_errordata2 ( BoardCfg, ErrorData2_fn, fds ) {
// Predefined constants for string processing
    var CELL_DELIMITER = ",";
    // find error data 2 file
    var fd = null;
    for (var i = 0; i < fds.length; ++i) {
        if (fds[i].name == ErrorData2_fn) {
            fd = fds[i];
            break;
        }
    }
    if (!fd) {
        return;
    }

    // read & parse csv file
    var file_reader = new FileReader();
    file_reader.readAsText(fd);
    file_reader.onload = function (e) {
        var csvlines = e.target.result.split(/\r?\n/g);
        // read whole csv file & load test commands to an array
        for (var i = 1; i < csvlines.length; ++i) { // skip csv header line
            if (!csvlines[i] || !csvlines[i].trim() || csvlines[i][0] == "#")
                continue;
            BoardCfg["ErrorData2"].push({
                "Name"     : csvlines[i].split(CELL_DELIMITER)[0],
                "Type"     : csvlines[i].split(CELL_DELIMITER)[1],
                "Expected" : csvlines[i].split(CELL_DELIMITER)[2],
                "Result"   : csvlines[i].split(CELL_DELIMITER)[3],
                "Timeout"  : csvlines[i].split(CELL_DELIMITER)[4],
            });
        }
    };
}


function import_all_testcfg ( fds ) {
    // build list of files need to be imported
    var imported_files = {};
    for (var i = 0, fd; fd = fds[i]; ++i) {
        imported_files[fd.webkitRelativePath] = null;
    }
    // read its contents
    var unread_fd = get_unread_fd(imported_files, fds);
    if (unread_fd)
        read_fd(unread_fd, imported_files, fds);
}

function get_unread_fd ( imported_files, fds ) {
    for (var i = 0, fd; fd = fds[i]; ++i)
        if (imported_files[fd.webkitRelativePath] == null)
            return fd;
    return null;
}

function read_fd ( fd, imported_files, fds ) {
    var reader = new FileReader();
    reader.readAsText(fd);
    reader.onload = function(e) {
        imported_files[fd.webkitRelativePath] = e.target.result;
        var unread_fd = get_unread_fd(imported_files, fds);
        if (unread_fd)
            read_fd(unread_fd, imported_files, fds);
        else {
            var unread_file = read_fd_done(imported_files);
            if (unread_file) {
                $("#uid_MsgDlg").data("Message", "Cannot read " + unread_file);
                $("#uid_MsgDlg").dialog("open");
            } else {
                commit_json_data(
                    URL = "/test",
                    Data = {
                        Action: 'ImportDefaultTestConfig',
                        Data: JSON.stringify(imported_files),
                    },
                    Param = {},
                    OnSuccessCallback = function ( json_resp, Param ) {
                        var resp = JSON.parse(JSON.stringify(json_resp));
                        if (resp.Errno) {
                            $("#uid_MsgDlg").data("Message", resp.Message);
                            $("#uid_MsgDlg").dialog("open");
                        } else {
                            get_board_config();
                            $("#uid_MsgDlg").data('Message', "Config imported successfully");
                            $("#uid_MsgDlg").dialog("open");
                        }
                   }
                );
            }
        }

    };
    // should not have any code here
}

function read_fd_done ( imported_files ) {
    for (var k in imported_files)
        if (imported_files[k] == null)
            return k;
    return null;
}
