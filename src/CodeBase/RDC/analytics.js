loadAnalyticsComponent = function () {
    if (MainApplication.cachedState.mode) {
        whenAnalyticsDependeciesLoaded();
    } else {
        MainApplication.cachedState.pageStateCall = loadAnalyticsComponent;
    }
};

MainApplication.AnalyticsComponent._orgChart = null;
MainApplication.AnalyticsComponent._divisionCharts = {};

var AppRequest;
var customWorkflowEngine;

MainApplication.AnalyticsComponent.ApplicationDetails = function () {
    this.url = window.location.href;
    this.itemId = null;
    this.mode = null;
    this.requestDetails = {};
    this.Attachments = [];
}

whenAnalyticsDependeciesLoaded = function () {
    globalDefinitions.callLoader();
    globalDefinitions.extendStages();
    globalDefinitions.sortResponse();

    // Attach change event listeners to both date inputs
    $("#requeststrDate, #requestendDate").on("change", function () {
        MainApplication.AnalyticsComponent.updateDateConstraints();
    });

    AppRequest = new MainApplication.AnalyticsComponent.ApplicationDetails();
    AppRequest.fullTableData = [];
    AppRequest.dataForExport = [];

    customWorkflowEngine = new WorkflowManagerEngine(CurrentUserProperties);

    $("#filterYear").on("change", function () {
        var searchQuery = $(this).val();
        var data = AppRequest.fullTableData || [];
        var filteredItems = MainApplication.reportSyncSearch(searchQuery, data);
        MainApplication.AnalyticsComponent.renderComplianceDashboard(filteredItems);
    });

    if (MainApplication.isUserAnActor) {
        MainApplication.AnalyticsComponent.retrieveRequest();
        globalDefinitions.closeLoader();
    }
    else {
        globalDefinitions.HandlerError("You are not authorized to access this resource...");
        $spcontext.redirect("#/", false);
        globalDefinitions.closeLoader();
    }
    setTimeout(function () {
        globalDefinitions.closeLoader();
    }, 2000);
};

MainApplication.AnalyticsComponent.retrieveRequest = function () {
    // globalDefinitions.callLoader();
    var reportQuery = [{
        ascending: "FALSE",
        orderby: "Modified"
    },
        // {
        //     operator: 'Eq',
        //     field: 'Approval_Status',
        //     type: 'Text',
        //     val: 'Completed'
        // },
    ];

    if (MainApplication.isPureHOD) {
        reportQuery.push({
            operator: 'Eq',
            field: 'HOD',
            type: 'User',
            val: CurrentUserProperties.title
        });
    }

    // //and filter fields
    // if ($("#requeststrDate").val() !== '') {
    //     var rstrdate = {
    //         val: new Date($("#requeststrDate").val()).toISOString(),
    //         type: 'DateTime',
    //         field: 'Created',
    //         operator: 'Geq'
    //     }
    //     reportQuery.push(rstrdate);
    // }

    // if ($("#requestendDate").val() !== '') {
    //     var renddate = {
    //         val: new Date($("#requestendDate").val()).toISOString(),
    //         type: 'DateTime',
    //         field: 'Created',
    //         operator: 'Leq'
    //     }
    //     reportQuery.push(renddate);
    // }

    reportQuery = commatrix.formQueryArrayGenerator(reportQuery);

    var query = commatrix.camlBuilder(reportQuery);
    var extraProperties = {
        merge: true,
        data: [
            "ID", "WorkflowRequestID", "Current_Approver", "Current_Approver_Code", "Approval_Status",
            "Created", "InitiatorEmailAddress", "InitiatorLogin", "Transaction_History", "ReturnForCorrection",
            "Modified", "PendingUserEmail", "PendingUserLogin", "Attachment_Folder", "AttachmentURL", "Author",
            "CMData", "Division_Unit", "HOD", "Contributors", "HODEmail", "Year", "Month", "Comment", "NumberOfEntries",
            "NumberOfCompliance", "NumberOfNonCompliance", "Status"
        ]
    };

    commatrix.getListToItems(configProperties.COMMATRIXLIST.setting, query, extraProperties, true, null, function (tableData) {

        AppRequest.fullTableData = tableData;
        // Extract unique Year values
        var uniqueYears = [...new Set(
            tableData
                .map(function (item) { return item.Year; })
                .filter(function (year) { return year !== null && year !== undefined && year !== ""; })
        )];

        // Sort years (descending recommended for reports)
        uniqueYears.sort(function (a, b) {
            return b - a; // numeric sort descending
        });

        // Populate dropdown
        var $filterYear = $("#filterYear");
        $filterYear.empty();

        // Optional: Add default option
        $filterYear.append('<option value="">All Years</option>');

        // Append dynamic options
        uniqueYears.forEach(function (year) {
            $filterYear.append('<option value="' + year + '">' + year + '</option>');
        });


        MainApplication.AnalyticsComponent.renderComplianceDashboard(tableData);
        $("#analyticsSkeleton").addClass("hidden");
        $("#complianceDashboard").removeClass("hidden");
        // setTimeout(function () {
        //     globalDefinitions.closeLoader();
        // }, 1000);
    });
};

MainApplication.AnalyticsComponent.updateDateConstraints = function () {
    var startDate = $("#requeststrDate").val();
    var endDate = $("#requestendDate").val();
    if (startDate) {
        $("#requestendDate").attr("min", startDate);
    } else {
        $("#requestendDate").removeAttr("min");
    }

    if (endDate) {
        $("#requeststrDate").attr("max", endDate);
    } else {
        $("#requeststrDate").removeAttr("max");
    }
}

MainApplication.AnalyticsComponent.renderComplianceDashboard = function (items) {

    // =========================
    // Aggregate data
    // =========================
    const divisionStats = {};
    let orgCompliance = 0;
    let orgNonCompliance = 0;
    let orgTotal = 0;

    items.forEach(item => {
        const div = item.Division_Unit || 'Unknown';
        const entries = parseInt(item.NumberOfEntries) || 0;
        const comp = parseInt(item.NumberOfCompliance) || 0;
        const non = parseInt(item.NumberOfNonCompliance) || 0;

        if (!divisionStats[div]) {
            divisionStats[div] = { compliance: 0, nonCompliance: 0, total: 0 };
        }

        divisionStats[div].compliance += comp;
        divisionStats[div].nonCompliance += non;
        divisionStats[div].total += entries;

        orgCompliance += comp;
        orgNonCompliance += non;
        orgTotal += entries;
    });

    const orgCompPct = orgTotal > 0 ? (orgCompliance / orgTotal * 100).toFixed(1) : 0;
    const orgNonPct = orgTotal > 0 ? (orgNonCompliance / orgTotal * 100).toFixed(1) : 0;

    $('#orgTotalEntries').text(orgTotal);

    setTimeout(() => {

        // =========================
        // DESTROY OLD ORG CHART
        // =========================
        if (MainApplication.AnalyticsComponent._orgChart) {
            MainApplication.AnalyticsComponent._orgChart.destroy();
            MainApplication.AnalyticsComponent._orgChart = null;
        }

        // =========================
        // ORGANIZATIONAL CHART
        // =========================
        const orgCanvas = document.getElementById('orgComplianceChart');
        if (!orgCanvas) {
            console.warn("Organizational chart canvas not found");
            return;
        }

        const orgCtx = orgCanvas.getContext('2d');
        if (!orgCtx) return;

        MainApplication.AnalyticsComponent._orgChart = new Chart(orgCtx, {
            type: 'doughnut',
            data: {
                labels: [
                    `Compliant (${orgCompPct}%) (${orgCompliance})`,
                    `Non-Compliant (${orgNonPct}%) (${orgNonCompliance})`
                ],
                datasets: [{
                    data: [orgCompliance, orgNonCompliance],
                    backgroundColor: ['#00A4A6', '#FF8C00'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { font: { size: 14 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.raw;
                                return `${label}: ${value} entries`;
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Overall Compliance Distribution',
                        font: { size: 18 },
                        color: '#1d3d66'
                    }
                }
            }
        });

        // =========================
        // CLEAR OLD DIVISION CONTENT
        // =========================
        const container = $('#divisionCards');
        container.empty();

        // =========================
        // BUILD STATUS CARDS
        // =========================
        Object.keys(divisionStats).forEach(div => {

            const stats = divisionStats[div];
            const total = stats.total || 0;
            const conformance = stats.compliance || 0;
            const nonConformance = stats.nonCompliance || 0;

            const confPct = total > 0 ? ((conformance / total) * 100).toFixed(1) : "0.0";
            const nonConfPct = total > 0 ? ((nonConformance / total) * 100).toFixed(1) : "0.0";

            // --------------------------------
            // Determine Severity Based on Non-Conformance %
            // --------------------------------
            let cardClass = "";
            let dotClass = "";

            const nonConfRatio = total > 0 ? (nonConformance / total) : 0;

            if (nonConfRatio >= 0.5) {
                cardClass = "bg-red-100 border-red-200";
                dotClass = "bg-red-500";
            } else if (nonConfRatio >= 0.2) {
                cardClass = "pending";
                dotClass = "bg-yellow-500";
            } else {
                cardClass = "completed";
                dotClass = "bg-green-500";
            }

            const card = `
        <div class="${cardClass} border rounded-xl shadow-sm p-4 transition hover:shadow-md">
            <div class="flex items-start gap-3">
                <span class="w-3 h-3 mt-2 rounded-full ${dotClass}"></span>
                <div>
                    <h3 class="text-lg font-semibold text-gray-800">
                        ${div}
                    </h3>

                    <p class="text-sm text-gray-700 mt-1">
                        ${total} entries
                    </p>

                    <p class="text-sm mt-1">
                        <span class="font-medium text-green-700">
                            ${confPct}% Compliant (${conformance})
                        </span>
                        ·
                        <span class="font-medium text-red-700">
                            ${nonConfPct}% Non-Compliant (${nonConformance})
                        </span>
                    </p>
                </div>
            </div>
        </div>
    `;

            container.append(card);
        });


    }, 0);
};