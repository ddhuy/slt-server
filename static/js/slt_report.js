function Bin ( bin_num ) {
    this.Desc = bin_num;
    this.NoParts = 0;
    this.PartId = [];
}

function Condition ( test_env ) {
    this.TestEnv = test_env;
    this.NoPassParts = 0;
    this.NoFailParts = 0;
    this.Bins = {};
}

function ProdFailPart () {
    this.NoParts = 0;
    this.BINs = {};
}

function ProdPassPart () {
    this.NoParts = 0;
    this.NoRerun = 0;
    this.RerunPartId = [];
}

function ProdReportItem ( lot_num ) {
    this.LotNum = lot_num;
    this.TotalParts = 0;
    this.PassParts = null;
    this.FailParts = null;
}

function FaReportItem ( lot_num ) {
    this.LotNum = lot_num;
    this.TotalParts = 0;
    this.Conditions = {};
    this.Parts = {};
}

function SltProdReport ( ) {
    // this.FromDate = null;
    // this.ToDate = null;
    this.Reports = {};
}

function SltFaReport ( ) {
    this.FromDate = null;
    this.ToDate = null;
    this.Reports = {};
}

///////////////////////// generate the report /////////////////////////
function filter_latest_results ( TestResults )
{
    var latest_results = {};
    for (var i in TestResults) {
        for (var j in TestResults[i].Summary) {
            var TestSumm = TestResults[i].Summary[j];
            var key = TestSumm.CpuId + "-" + TestSumm.LotNum + "-" + TestSumm.TestEnv;
            if (!latest_results[key] || latest_results[key].ExecDate < TestSumm.ExecDate) 
                latest_results[key] = TestSumm;
        }
    }

    return latest_results
}

function get_prod_reports ( TestResults )
{
    var ProdReport = new SltProdReport();
    var Reports = ProdReport.Reports;
    var LatestResults = filter_latest_results(TestResults);

    for (var i in LatestResults) {
        var Test = LatestResults[i];
        if (Test.SltMode != SLT_MODES[SLT_MODE_PRODUCTION]) {
            continue;
        }

        if (!Reports[Test.LotNum])
            Reports[Test.LotNum] = new ProdReportItem(Test.LotNum);
        var Report = Reports[Test.LotNum];
        Report.TotalParts += 1;
        if (Test.Result == "PASS") {
            if (!Report.PassParts)
                Report.PassParts = new ProdPassPart();
            Report.PassParts.NoParts += 1;
            if (Test.NoRun > 1) {
                Report.PassParts.NoRerun += 1;
                Report.PassParts.RerunPartId.push(Test.CpuId);
            }
        } else {
            var ListBins = [];
            if (Test.Description)
                ListBins = Test.Description.replace(/'|u'|\[|\]/g, "").split(", ").filter((v, i, a) => a.indexOf(v) === i);

            if (!Report.FailParts)
                Report.FailParts = new ProdFailPart();
            Report.FailParts.NoParts += 1;
            for (var b in ListBins) {
                if (!Report.FailParts.BINs[ListBins[b]])
                    Report.FailParts.BINs[ListBins[b]] = new Bin(ListBins[b]);
                Report.FailParts.BINs[ListBins[b]].PartId.push(Test.CpuId);
                Report.FailParts.BINs[ListBins[b]].NoParts += 1;
                break; // only get first failure
            }
        }

        // find the testing time
        // if (ProdReport.FromDate == null || Test.ExecDate < ProdReport.FromDate)
        //     ProdReport.FromDate = Test.ExecDate;
        // if (ProdReport.ToDate == null || Test.ExecDate > ProdReport.ToDate)
        //     ProdReport.ToDate = Test.ExecDate;
    }

    return ProdReport;
}

function get_fa_reports ( TestResults )
{
    var FaReport = new SltFaReport();
    var LatestResults = filter_latest_results(TestResults);

    for (var i in LatestResults) {
        var Test = LatestResults[i];
        if (Test.SltMode != SLT_MODES[SLT_MODE_FA]) {
            continue;
        }
        // find the testing time
        if (FaReport.FromDate == null || Test.ExecDate < FaReport.FromDate)
            FaReport.FromDate = Test.ExecDate;
        if (FaReport.ToDate == null || Test.ExecDate > FaReport.ToDate)
            FaReport.ToDate = Test.ExecDate;

        if (FaReport.Reports[Test.LotNum] == undefined)
            FaReport.Reports[Test.LotNum] = new FaReportItem(Test.LotNum);
        var Report = FaReport.Reports[Test.LotNum];
        if (Report.Conditions[Test.TestEnv] == undefined)
            Report.Conditions[Test.TestEnv] = new Condition(Test.TestEnv);
        if (Report.Parts[Test.CpuId] == undefined) {
            Report.Parts[Test.CpuId] = Test.CpuId;
            Report.TotalParts += 1;
        }
        var Cond = Report.Conditions[Test.TestEnv];
        (Test.Result == "FAIL") ? Cond.NoFailParts += 1 : Cond.NoPassParts += 1;

        var ListBins = [];
        if (Test.Description)
            ListBins = Test.Description.replace(/'|u'|\[|\]/g, "").split(", ").filter((v, i, a) => a.indexOf(v) === i);
        for (var b in ListBins) {
            if (Cond.Bins[ListBins[b]] == undefined)
                Cond.Bins[ListBins[b]] = new Bin(ListBins[b]);
            var B = Cond.Bins[ListBins[b]];
            B.NoParts += 1;
        }
    }

    return FaReport;
}
