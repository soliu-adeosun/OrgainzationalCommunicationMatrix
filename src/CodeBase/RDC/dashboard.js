loadDashboardComponent = function () {
    if (MainApplication.cachedState.mode) {
        whenDashboardDependeciesLoaded();
    } else {
        MainApplication.cachedState.pageStateCall = loadDashboardComponent;
    }
};

var AppRequest;
var customWorkflowEngine;

MainApplication.DashboardComponent.ApplicationDetails = function () {
    this.url = window.location.href;
    this.itemId = null;
    this.mode = null;
    this.requestDetails = {};
    this.Attachments = [];
    this.FileUrls = {};
    this.FolderUrl = "";
    this.AttachmentLoader = {};
    this.messageTemplate = {};
    this.feedback = false;
    this.approverComments = "";
    this.transactionHistory = [];
    this.defaultStage = "AA0";
    this.returned = null;
    this.sectionArr = [];
    this.sections = {};
    this.finalrating = [];
    this.questionSetCounter = 0;
    this.groupProperties = {};
    this.nonConformanceCounter = 1;
}

whenDashboardDependeciesLoaded = function () {
    globalDefinitions.callLoader();
    globalDefinitions.extendStages();
    globalDefinitions.sortResponse();
    AppRequest = new MainApplication.DashboardComponent.ApplicationDetails();
    AppRequest.pendingItems = [];
    AppRequest.myItems = [];
    // MainApplication.getNCOnQueue();
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
            if (valueToEva.Approval_Status === "Completed") {
                return `<span class="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800">Completed</span>`
            } else if (valueToEva.Approval_Status === "Declined") {
                return `<span class="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800">Declined</span>`
            } else if (valueToEva.Approval_Status === "Pending") {
                return `<span class="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>`;
            } else if (valueToEva.Approval_Status === "Revise") {
                return `<span class="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800">Revise</span>`
            }

        },

        "Created": function (valueToEva) {
            // var isActor = MainApplication.isUserAnActor;

            let isActor = false;

            try {

                isActor = CurrentUserProperties.email === valueToEva.PendingUserLogin || MainApplication.configuredTaskMembers[valueToEva.Current_Approver].belongs;

            } catch (error) { }

            var approvalStr = `

                                    ${isActor ? `
                <a title="Action" href="#/approverequest?itemId=${valueToEva.WorkflowRequestID}" 

                                        class="p-1 sm:p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 transition-colors">
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                <path fill-rule="evenodd" d="M11.986 3H12a2 2 0 0 1 2 2v6a2 2 0 0 1-1.5 1.937V7A2.5 2.5 0 0 0 10 4.5H4.063A2 2 0 0 1 6 3h.014A2.25 2.25 0 0 1 8.25 1h1.5a2.25 2.25 0 0 1 2.236 2ZM10.5 4v-.75a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0-.75.75V4h3Z" clip-rule="evenodd" />
                <path fill-rule="evenodd" d="M3 6a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H3Zm1.75 2.5a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5ZM4 11.75a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
                </svg>
                </a>` : ''}`;

            var editStr = `
                <a title="Modify" href="#/newrequest?itemId=${valueToEva.WorkflowRequestID}&mode=modify" 

                                        class="p-1 sm:p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 

                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414

                                                a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                </a>`;

            var editDraftStr = `
                <a title="Modify" href="#/newrequest?itemId=${valueToEva.WorkflowRequestID}&mode=editdraft" 

                                        class="p-1 sm:p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 

                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414

                                                a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                </a>`;

            var viewStr = `
                
                <a title="View" href="#/viewrequest?itemId=${valueToEva.WorkflowRequestID}" 

                                        class="p-1 sm:p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                <path fill-rule="evenodd" d="M1.38 8.28a.87.87 0 0 1 0-.566

                                                7.003 7.003 0 0 1 13.238.006.87.87 0 0 1 0 .566A7.003 

                                                7.003 0 0 1 1.379 8.28ZM11 8a3 3 0 1 1-6 0 

                                                3 3 0 0 1 6 0Z" clip-rule="evenodd" />
                </svg>
                </a>`;

            if ((valueToEva.Approval_Status === "Pending" && valueToEva.Current_Approver === "Employee")) {
                return `<div class="flex space-x-1 sm:space-x-2">${viewStr} ${editDraftStr}</div>`;
            } else if (valueToEva.Approval_Status === "Declined" && valueToEva.ReturnForCorrection === "Yes") {
                return `<div class="flex space-x-1 sm:space-x-2">${viewStr} ${editStr}</div>`;
            } else if (valueToEva.Approval_Status === "Completed" || valueToEva.Approval_Status === "Declined") {
                return `<div class="flex space-x-1 sm:space-x-2">${viewStr}</div>`;
            } else {
                return `<div class="flex space-x-1 sm:space-x-2">${viewStr} ${approvalStr}</div>`;
            }

        }

    };

    $("#dashboard-tabs").empty();

    // if (MainApplication.isUserAnActor) {

    $("#dashboard-tabs").append(
                `<ul class="flex text-sm font-medium text-center rounded-lg shadow-sm">
        <li class="w-1/2">
        <button data-tab="myAudits" id="myAuditsTab"
                                class="tab-btn block w-full p-4 text-white bg-slate-700 hover:bg-slate-800">

                                My Request
        </button>
        </li>
        <li class="w-1/2">
        <button data-tab="pending" id="pendingTab"

                                class="tab-btn block w-full p-4 bg-white border-r border-gray-200 hover:bg-gray-50">

                                Action Required (<span id="auditsAwaitingMyAction"></span>)
        </button>
        </li>
        </ul>`

            );

    // } else {

    //     $("#dashboard-tabs").append(

    //         `<ul class="flex text-sm font-medium text-center rounded-lg shadow-sm">

    //             <li class="w-full">

    //                 <button data-tab="myAudits" id="myAuditsTab"

    //                     class="tab-btn block w-full p-4 text-white bg-slate-700 hover:bg-slate-800">

    //                     My NC(s)

    //                 </button>

    //             </li>

    //         </ul>`

    //     );

    // }

    // MainApplication.DashboardComponent.currentTab = "Pending";

    // Set up tab click handlers

    $("#pendingTab").click(() => {

        MainApplication.DashboardComponent.currentTab = "Pending";

        MainApplication.DashboardComponent.showTableData(AppRequest.pendingItems);

        $(".tab-btn").removeClass("text-white bg-slate-700 hover:bg-slate-800").addClass("bg-white border-r border-gray-200 hover:bg-gray-50");

        $("#pendingTab").addClass("text-white bg-slate-700 hover:bg-slate-800").removeClass("bg-white border-r border-gray-200 hover:bg-gray-50");

    });

    $("#myAuditsTab").click(() => {

        MainApplication.DashboardComponent.currentTab = "MyAudits";

        MainApplication.DashboardComponent.showTableData(AppRequest.myItems);

        $(".tab-btn").removeClass("text-white bg-slate-700 hover:bg-slate-800").addClass("bg-white border-r border-gray-200 hover:bg-gray-50");

        $("#myAuditsTab").addClass("text-white bg-slate-700 hover:bg-slate-800").removeClass("bg-white border-r border-gray-200 hover:bg-gray-50");

    });

    $("#reportsearchfield").on("keyup", function () {

        var searchQuery = $(this).val();

        if (MainApplication.DashboardComponent.currentTab === "MyAudits") {

            var data = AppRequest.myItems || [];

        } else {

            var data = AppRequest.pendingItems || [];

        }

        var filteredItems = MainApplication.reportSyncSearch(searchQuery, data);

        MainApplication.DashboardComponent.showTableData(filteredItems);

    });

    // Fetch data for both tabs

    MainApplication.DashboardComponent.pendingRequests();

    MainApplication.DashboardComponent.myRequests();

    MainApplication.DashboardComponent.currentTab = "MyAudits";

    if (MainApplication.configuredTaskMembers[globalDefinitions.stageDefinitions.management].belongs) {

        $(".issue-new-nc-btn").show();

    }

    setTimeout(function () {

        globalDefinitions.closeLoader();

    }, 2000);

};


MainApplication.DashboardComponent.pendingRequests = function () {
    var queryCaml = [{
        ascending: "FALSE",
        orderby: "Modified"
    },
    {
        operator: 'Eq',
        field: 'Division_Unit',
        type: 'Text',
        val: MainApplication.staffDetails[CurrentUserProperties.email].Department
    },
    {
        operator: 'Eq',
        field: 'Approval_Status',
        type: 'Text',
        val: "Pending"
    },
        // {
        //     operator: 'Eq',
        //     field: 'PendingUserLogin',
        //     type: 'Text',
        //     val: CurrentUserProperties.email
        // },
    ];

    if (MainApplication.configuredTaskMembers[globalDefinitions.stageDefinitions.management].belongs) {
        queryCaml.push({
            evaluator: "Or",
            operator: 'Eq',
            field: 'Current_Approver',
            type: 'Text',
            val: globalDefinitions.stageDefinitions.management

        });

    }

    if (globalDefinitions.stageDefinitions.hod) {
        queryCaml.push({
            evaluator: "Or",
            operator: 'Eq',
            field: 'PendingUserLogin',
            type: 'Text',
            val: CurrentUserProperties.email

        });

    }

    queryCaml = customWorkflowEngine.setupTaskForGroups(queryCaml);
    var query = commatrix.camlBuilder(queryCaml);
    var extraProperties = {
        merge: true,
        data: [
            "ID", "WorkflowRequestID", "Current_Approver", "Current_Approver_Code", "Approval_Status",
            "Created", "InitiatorEmailAddress", "InitiatorLogin", "Transaction_History", "ReturnForCorrection",
            "Modified", "PendingUserEmail", "PendingUserLogin", "Attachment_Folder", "AttachmentURL", "Author",
            "CMData", "Division_Unit", "HOD", "Contributors", "HODEmail", "Year", "Month", "Comment"
        ]

    };

    commatrix.getListToItems("CommunicationMatrixList", query, extraProperties, true, null, function (tableData) {
        AppRequest.pendingItems = tableData;
        $("#auditsAwaitingMyAction").text(tableData.length);
        if (MainApplication.DashboardComponent.currentTab === "Pending") {
            MainApplication.DashboardComponent.showTableData(tableData);
        }
    });
};

MainApplication.DashboardComponent.myRequests = function () {

    var queryToUse = [{
        ascending: "FALSE",
        orderby: "Modified",
        viewScope: "RecursiveAll"
    }, {
        operator: 'Eq',
        field: 'Division_Unit',
        type: 'Text',
        val: MainApplication.staffDetails[CurrentUserProperties.email].Department

    }];

    var query = commatrix.camlBuilder(queryToUse);
    var extraProperties = {
        merge: true,
        data: [
            "ID", "WorkflowRequestID", "Current_Approver", "Current_Approver_Code", "Approval_Status",
            "Created", "InitiatorEmailAddress", "InitiatorLogin", "Transaction_History", "ReturnForCorrection",
            "Modified", "PendingUserEmail", "PendingUserLogin", "Attachment_Folder", "AttachmentURL", "Author",
            "CMData", "Division_Unit", "HOD", "Contributors", "HODEmail", "Year", "Month", "Comment"
        ]
    };

    commatrix.getListToItems("CommunicationMatrixList", query, extraProperties, true, null, function (tableData) {
        var completedItems = tableData.filter(function (item) {
            return item.Approval_Status === "Completed";
        });
        var pendingItems = tableData.filter(function (item) {
            return item.Approval_Status === "Pending";
        });
        AppRequest.myItems = tableData;
        // AppRequest.ncData = MainApplication.AuditList;
        $("#dashboardCards").empty();
        $("#dashboardCards").append(

            `
<section class="space-y-4">
<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
<div class="border card audit border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
<div class="text-center">
<h3 id='totalAudit' class="text-base sm:text-lg font-semibold text-navy-900 flex-1 mr-2">${tableData.length}</h3>
<h3 class="text-base sm:text-lg font-semibold text-navy-900 flex-1 mr-2">

                                    Total Request
</h3>
</div>
</div>
<div class="border card pending border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
<div class="text-center">
<h3 id='pendingAudit' class="text-base sm:text-lg font-semibold text-navy-900 flex-1 mr-2">${pendingItems.length}</h3>
<h3 class="text-base sm:text-lg font-semibold text-navy-900 flex-1 mr-2">

                                    Pending
</h3>
</div>
</div>
<div class="border card completed border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
<div class="text-center">
<h3 id='completedAudit' class="text-base sm:text-lg font-semibold text-navy-900 flex-1 mr-2">${completedItems.length}</h3>
<h3 class="text-base sm:text-lg font-semibold text-navy-900 flex-1 mr-2">

                                    Completed
</h3>
</div>
</div>
</div>
</section>

            `

        );

        if (MainApplication.DashboardComponent.currentTab === "MyAudits") {

            MainApplication.DashboardComponent.showTableData(tableData);

        }

    });

};

MainApplication.DashboardComponent.showTableData = function (tableData) {
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