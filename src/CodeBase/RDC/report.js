loadReportComponent = function () {
    if (MainApplication.cachedState.mode) {
		whenReportDependeciesLoaded();
	}else{
        MainApplication.cachedState.pageStateCall = loadReportComponent;
    }
};

whenReportDependeciesLoaded = function () {
    globalDefinitions.callLoader();
    globalDefinitions.extendStages();
    globalDefinitions.sortResponse();

    // Attach change event listeners to both date inputs
    $("#requeststrDate, #requestendDate").on("change", function () {
        MainApplication.ReportComponent.updateDateConstraints();
    });

    AppRequest = new MainApplication.NewRequestComponent.ApplicationDetails();
    AppRequest.fullTableData = [];
    AppRequest.dataForExport = [];

    customWorkflowEngine = new WorkflowManagerEngine(CurrentUserProperties);
    
    commatrix.DataForTable.tablecontentId = "speed-data-table";
    commatrix.DataForTable.pagesize = 30;
    commatrix.DataForTable.paginateSize = 5;
    commatrix.DataForTable.modifyTR = false;
    commatrix.DataForTable.context = commatrix;
    commatrix.DataForTable.paginationbId = "myrequestpagination";
    commatrix.DataForTable.paginationuId = "toppagination";
    
    commatrix.DataForTable.propertiesHandler = {
        "Modified": function (valueToEva) {
            return $spcontext.stringnifyDate({
                value: valueToEva.Modified,
                includeTime: false,
                format: "dd/mm/yy"
            });
        },
        "Approval_Status": function (valueToEva) {
            if (valueToEva.Approval_Status === "Pending" && valueToEva.Current_Approver === globalDefinitions.stageDefinitions.save) {
                return `<span class="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800">Draft</span>`;
            } else if (valueToEva.Approval_Status === "Completed") {
                return `<span class="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800">Completed</span>`;
            } else if (valueToEva.Approval_Status === "Declined") {
                return `<span class="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800">Declined</span>`;
            } else if (valueToEva.Approval_Status === "Pending") {
                return `<span class="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>`;
            } else if (valueToEva.Approval_Status === "Revise") {
                return `<span class="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800">Revise</span>`;
            }
        },
        "Created": function (valueToEva) {
            var viewStr = `
                    <a href="#/viewrequest?itemId=${valueToEva.WorkflowRequestID}" class="p-1 sm:p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                            <path fill-rule="evenodd" d="M1.38 8.28a.87.87 0 0 1 0-.566 7.003 7.003 0 0 1 13.238.006.87.87 0 0 1 0 .566A7.003 7.003 0 0 1 1.379 8.28ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" clip-rule="evenodd" />
                        </svg>
                    </a>`;

            var updStr = `
                    <a title="Modify" href="#/viewrequest?itemId=${valueToEva.WorkflowRequestID}&mode=updateStatus" class="p-1 sm:p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414 a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </a>`;

            return `<div class="flex space-x-1 sm:space-x-2">${viewStr} ${updStr}</div>`;
            
        }
    };

    // $("#searchbtn").click(() => {
    //     MainApplication.ReportComponent.retrieveRequest();
    // });

    // let debounceTimer;

    $("#employeeName, #nextApprover, #statusSelect, #rdcStatusSelect, #requeststrDate, #requestendDate").on("keyup change", function () {
        // clearTimeout(debounceTimer);
        // debounceTimer = setTimeout(() => {
            MainApplication.ReportComponent.retrieveRequest();
        // }, 500);
    });

    $("#exportbtn").click(() => {
        MainApplication.ReportComponent.exportToExcel();
    });

    $("#reportsearchfield").on("keyup", function () {
        var searchQuery = $(this).val();
        var data = AppRequest.fullTableData || [];
        var filteredItems = MainApplication.reportSyncSearch(searchQuery, data);
        MainApplication.ReportComponent.showTableData(filteredItems);
    });

    $("#filter-btn, #closesearchfilter").click(() => {
        $(".sort-box").toggleClass("hidden");
    });

    if (MainApplication.isUserAnActor) {
        MainApplication.ReportComponent.retrieveRequest();
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

MainApplication.ReportComponent.retrieveRequest = function () {
    // globalDefinitions.callLoader();
    var reportQuery = [{
            ascending: "FALSE",
            orderby: "Modified"
        },
        {
            operator: 'Eq',
            field: 'Approval_Status',
            type: 'Text',
            val: 'Completed'
        },
    ];

    if (MainApplication.isPureHOD) {
        reportQuery.push({
            operator: 'Eq',
            field: 'HOD',
            type: 'User',
            val: CurrentUserProperties.title
        });
    }

    //and filter fields
    if ($("#requeststrDate").val() !== '') {
        var rstrdate = {
            val: new Date($("#requeststrDate").val()).toISOString(),
            type: 'DateTime',
            field: 'Created',
            operator: 'Geq'
        }
        reportQuery.push(rstrdate);
    }

    if ($("#requestendDate").val() !== '') {
        var renddate = {
            val: new Date($("#requestendDate").val()).toISOString(),
            type: 'DateTime',
            field: 'Created',
            operator: 'Leq'
        }
        reportQuery.push(renddate);
    }

    reportQuery = commatrix.formQueryArrayGenerator(reportQuery);

    var query = commatrix.camlBuilder(reportQuery);
    var extraProperties = {
        merge: true,
        data: [
            "ID", "WorkflowRequestID", "Current_Approver", "Current_Approver_Code", "Approval_Status",
            "Created", "InitiatorEmailAddress", "InitiatorLogin", "Transaction_History", "ReturnForCorrection",
            "Modified", "PendingUserEmail", "PendingUserLogin", "Attachment_Folder", "AttachmentURL", "Author",
            "CMData", "Division_Unit", "HOD", "Contributors", "HODEmail", "Year", "Month", "Comment"
        ]
    };

    commatrix.getListToItems(configProperties.COMMATRIXLIST.setting, query, extraProperties, true, null, function (tableData) {
        
        AppRequest.fullTableData = tableData;
        var completedItems = tableData.filter(function (item) {
            return item.Approval_Status === "Completed";
        }) || [];

        var pendingItems = tableData.filter(function (item) {
            return item.Approval_Status === "Pending";
        }) || [];

        $("#totalAudit").text(tableData.length || 0);
        $("#pendingAudit").text(pendingItems.length);
        $("#completedAudit").text(completedItems.length);
        MainApplication.ReportComponent.showTableData(tableData);
        // setTimeout(function () {
        //     globalDefinitions.closeLoader();
        // }, 1000);
    });
};

MainApplication.ReportComponent.showTableData = function (tableData) {
    AppRequest.dataForExport = tableData;
    if (tableData.length === 0) {
        $("#tasktable").hide();
        $("#speed-data-table").empty();
        $(".threport").hide();
        $(".norequest").show();
    } else {
        $("#tasktable").show();
        $(".threport").show();
        $(".norequest").hide();
        commatrix.manualTable(tableData);
    }
    globalDefinitions.closeLoader();
};

MainApplication.ReportComponent.exportToExcel = function () {
        var excelName = "RDCReport" + $spcontext.stringnifyDate() + ".csv";
        var dataStringHeader = [
            "Date", "Reference ID", "Division/Unit", "Status", "Next Approver"
        ];

        var excelData = dataStringHeader.toString() + "\n";

        $.each(AppRequest.dataForExport, function (index, itemProperties) {
            var dataString = [];
            dataString.push($spcontext.stringnifyDate({ value: itemProperties.Created, includeTime: true }));
            dataString.push(itemProperties.WorkflowRequestID);
            dataString.push(MainApplication.ReportComponent.validateCSVContent(itemProperties.Division_Unit));
            dataString.push(itemProperties.Approval_Status);
            dataString.push(MainApplication.ReportComponent.validateCSVContent(itemProperties.Current_Approver));
            // dataString.push(itemProperties.Year);
            
            /*
            dataString.push(delegateEmail);*/
            excelData += dataString.toString() + "\n";
        });

        MainApplication.ReportComponent.downloadData(excelName, excelData);
    }

MainApplication.ReportComponent.downloadData = function (excelname, data) {
    if (navigator.msSaveOrOpenBlob) {
        var blobContent = data;
        // Works for Internet Explorer and Microsoft Edge
        var blob = new Blob([blobContent], { type: "text/csv" });
        navigator.msSaveOrOpenBlob(blob, excelname);
    }
    else {
        var encodedString;
        var downloadLink
        try {
            encodedString = btoa(data);
            downloadLink = `data:text/csv;base64,${encodedString}`;
        }
        catch (e) {
            var csvContent = "data:text/csv;charset=utf-8,";
            csvContent += data;
            var blob = new Blob([data]);
            if (blob.size > 2000000) {
                globalDefinitions.HandlerError("Please use the filter to reduce the data size, as the size of the data exceeds 2MB");
            }
            downloadLink = encodeURI(csvContent);
        }

        var link = document.createElement("a");
        link.setAttribute("href", downloadLink);
        link.setAttribute("download", excelname);
        link.click();
    }
}

MainApplication.ReportComponent.validateCSVContent = function (data) {
    if (typeof data == "string") {
        //data = data.replace(/,/g, "~");
        data = data.replace(/\n/g, "");
        data = data.replace(/\r/g, "");
        data = data.replace(/\r\n/g, "");
        data = MainApplication.ReportComponent.encloseStringWithCommaCheck(data);
    }
    return data;
}

MainApplication.ReportComponent.encloseStringWithCommaCheck = function (value) {
    if (value.includes(',')) {
        return '"' + value + '"';
    }
    return value;
}

MainApplication.ReportComponent.updateDateConstraints = function () {
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