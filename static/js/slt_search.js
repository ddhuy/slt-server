$(document).ready(function() {
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

    enable_select2($("#id_PartId"));
    enable_select2($("#id_LotNum"));
    enable_select2($("#id_BenchNum"));
    enable_select2($("#id_BoardSerial"));
    enable_select2($("#id_TestName"));
    enable_select2($("#id_Operator"));
    enable_select2($("#id_FailSign"));
    enable_select2($("#id_ExecDate"));
    enable_select2($("#id_TestEnv"));

    enable_qtip($("#id_PartId"), 'ECID & CPUID');


    $("#id_Search").click(function() {
        $.ajax({
            type: "POST",
            url: "/search/skylark/production/",
            data: { Action: 'GetTestResult'
                  },
            dataType: "json",
            cache: true,
            success: function (response) {
            },
            error: function (response) {
            }
        });
        return false;
    });

});