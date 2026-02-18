loadAnalyticsComponent = function () {
    if (MainApplication.cachedState.mode) {
		whenAnalyticsDependeciesLoaded();
	}else{
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
                    backgroundColor: ['#31527d', '#ef4444'],
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
        // DESTROY OLD DIVISION CHARTS
        // =========================
        Object.values(MainApplication.AnalyticsComponent._divisionCharts).forEach(chart => {
            chart.destroy();
        });

        MainApplication.AnalyticsComponent._divisionCharts = {};

        // =========================
        // REBUILD DIVISION CARDS
        // =========================
        const container = $('#divisionCards');
        container.empty();

        Object.keys(divisionStats).forEach(div => {

            const stats = divisionStats[div];
            const compPct = stats.total > 0 ? (stats.compliance / stats.total * 100).toFixed(1) : 0;
            const nonPct = stats.total > 0 ? (stats.nonCompliance / stats.total * 100).toFixed(1) : 0;

            const cardId = 'divChart-' + div.replace(/\s+/g, '-').toLowerCase();

            const card = `
                <div class="bg-white border rounded-xl shadow p-2 flex flex-col card">
                    <h3 class="text-lg font-semibold text-navy-900 text-center mb-4">${div}</h3>
                    <div class="w-full mx-auto mb-4">
                        <canvas id="${cardId}"></canvas>
                    </div>
                    <div class="text-center space-y-1">
                        <div class="flex flex-col sm:flex-row justify-center items-center gap-2">
                            <span class="text-navy-900 font-medium">
                                Compliant: ${compPct}% (${stats.compliance})
                            </span>
                            <span class="text-red-700 font-medium">
                                NC: ${nonPct}% (${stats.nonCompliance})
                            </span>
                        </div>
                        <p class="text-gray-500 text-sm mt-2">
                            Total entries: ${stats.total}
                        </p>
                    </div>
                </div>
            `;

            container.append(card);

            const ctx = document.getElementById(cardId).getContext('2d');

            MainApplication.AnalyticsComponent._divisionCharts[cardId] = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Compliant', 'Non-Compliant'],
                    datasets: [{
                        data: [stats.compliance, stats.nonCompliance],
                        backgroundColor: ['#31527d', '#ef4444'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context) =>
                                    `${context.label}: ${context.raw} (${((context.raw / stats.total) * 100).toFixed(1)}%)`
                            }
                        }
                    }
                }
            });

        });

    }, 0);
};