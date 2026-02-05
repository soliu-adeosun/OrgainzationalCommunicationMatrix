loadViewRequestComponent = function () {
    if (MainApplication.cachedState.mode) {
		whenViewRequestDependeciesLoaded();
	}else{
        MainApplication.cachedState.pageStateCall = loadViewRequestComponent;
    }
};



var AppRequest;
var customWorkflowEngine;

MainApplication.ViewRequestComponent.ApplicationDetails = function () {
    this.url = window.location.href;
    this.itemId = null;
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
    this.returned = false;
    this.messageType = "standard";
    this.documentsToUpdate = {};
    this.mode = null;
}

whenViewRequestDependeciesLoaded = function () {
    globalDefinitions.callLoader();
    globalDefinitions.extendStages();
    $spcontext.assignAttributes();

    $spcontext.filesDictionary = {};
    
    AppRequest = new MainApplication.ViewRequestComponent.ApplicationDetails();
    globalDefinitions.extendStages();
    customWorkflowEngine = new WorkflowManagerEngine(CurrentUserProperties);
    globalDefinitions.SetWorkflowRouting(customWorkflowEngine);
    AppRequest.itemId = $spcontext.getParameterByName("itemid", window.location.href);
    AppRequest.mode = $spcontext.getParameterByName("mode", window.location.href);

    $spcontext.filesDictionary = {};

    $spcontext.applyValidationEvents();
    // MainApplication.ViewRequestComponent.displayManagementDetails();
    if (AppRequest.mode === "updatestatus" && MainApplication.configuredTaskMembers[globalDefinitions.stageDefinitions.management].belongs) {
        $("#statusSection").show();
    }
    MainApplication.ViewRequestComponent.recoverListData();
    $('#statusSelect').on('change', function () {
        MainApplication.ViewRequestComponent.updateStatus();
    });
    setTimeout(function () {
        globalDefinitions.closeLoader();
    }, 2000);
};


MainApplication.ViewRequestComponent.recoverListData = function() {
    
    if (AppRequest.itemId !== null && AppRequest.itemId !== "") {

        var query = commatrix.camlBuilder([{
            rowlimit: 1
        },
            {
                operator: 'Eq',
                field: 'WorkflowRequestID',
                type: 'Text',
                val: AppRequest.itemId
            }
        ]);
        
        var extraProperties = [
			"ID", "WorkflowRequestID", "Current_Approver", "Current_Approver_Code", "Approval_Status",
			"Created", "InitiatorEmailAddress", "InitiatorLogin", "Transaction_History", "ReturnForCorrection",
			"Modified", "PendingUserEmail", "PendingUserLogin", "Attachment_Folder", "AttachmentURL", "Author",
			"CMData", "Division_Unit", "HOD", "Contributors", "HODEmail", "Year", "Month", "Comment", "Status"
		];

        commatrix.getListToControl(globalDefinitions.stageDefinitions.listname, query, extraProperties, function (listProperties) {
            if ($.isEmptyObject(listProperties)) {
                MainApplication.notyf.error("Request does not exist...");
                $spcontext.redirect("#/", false);
                globalDefinitions.closeLoader();
                
            }
            else {
                customWorkflowEngine.routeEngine(customWorkflowEngine).updateRoutesinFlow(listProperties, function (resolved) {
                    customWorkflowEngine.routeEngine(customWorkflowEngine).
                    PageSecurity(customWorkflowEngine.stages.securityModeView, listProperties.Current_Approver, listProperties.Approval_Status, function (error) {

                        // if (MainApplication.configuredTaskMembers[listProperties.Current_Approver].belongs) {
                        if (typeof error === "undefined") {
                            listProperties.Created = $spcontext.stringnifyDate({
                                value: listProperties.Created,
                            });


                            listProperties.Transaction_History = $spcontext.JSONToObject(listProperties.Transaction_History);
                            listProperties.AttachmentURL = $spcontext.JSONToObject(listProperties.AttachmentURL, "object");
                            listProperties.CMData = $spcontext.JSONToObject(listProperties.CMData);

                            AppRequest.FolderUrl = listProperties.Attachment_Folder;
                            AppRequest.FileUrls = $spcontext.deferenceObject(listProperties.AttachmentURL);

                            for (var file in AppRequest.FileUrls) {
                                $spcontext.filesDictionary[file] = { files: AppRequest.FileUrls[file] };
                            }

                            // AppRequest.FileUrls = $spcontext.deferenceObject(listProperties.AttachmentURL);

                            if (listProperties.Transaction_History.length !== 0) {
                                $("#transaction-history").show();
                                globalDefinitions.displayHistory(listProperties.Transaction_History);
                            }
                            if (listProperties.Status) {
                                $("#statusSelect").val(listProperties.Status);
                            }
                            
                            // if (listProperties.Current_Approver !== "Employee" && listProperties.Current_Approver_Code !== "AA1") {
                            // 	listProperties.Comment = "";
                            // }

                            MainApplication.renderCommunicationTemplatesReadOnly(listProperties.CMData);
                            AppRequest.requestDetails = listProperties;

                            $spcontext.htmlBind(listProperties);

                            // if (AppRequest.requestDetails.Current_Approver !== 'Employee'){
                            // $spcontext.attachmentLinkBind(listProperties.AttachmentURL);
                            // }

                            setTimeout(function () {
                                globalDefinitions.closeLoader();
                            }, 2000);
                        } else {
                            globalDefinitions.HandlerError("You are not allowed to access this request");
                            globalDefinitions.AuditLogManager_SaveLog({
                                Action: `Unauthorized action on communication matrix ${listProperties.WorkflowRequestID}`,
                                Message: "User is not allowed to act on this request"
                            });
                            setTimeout(function () {
                                globalDefinitions.closeLoader();
                            }, 1000);
                            $spcontext.redirect("#/", false);
                        }
                    }); //commented here
                    
                }); //commented here
            }
        });
    } else {
        globalDefinitions.closeLoader();
        MainApplication.notyf.error("Invalid Request...");
        $spcontext.redirect("#/", false);
    }
}

MainApplication.ViewRequestComponent.updateStatus = function () {
    globalDefinitions.callLoader();
    var formData = {};
    formData.Status = $("#statusSelect").val();
	formData.ID = AppRequest.requestDetails.ID;
    var historyProp = {
        stage: "Admin",
        comment: AppRequest.comment,
        action: "Status Updated",
    };

	formData = customWorkflowEngine.routeEngine(customWorkflowEngine).requestHistoryHandler(formData, AppRequest.requestDetails.Transaction_History, historyProp);

	commatrix.updateItems([formData], "CommunicationMatrixList", function () {
		// AppRequest.requestDetails.Current_Approver = formData.Current_Approver;
		globalDefinitions.closeLoader();
        $("#currentStatus").val(formData.Status);
		globalDefinitions.HandlerSuccess(`You have successfully updated the status of this form`);
		globalDefinitions.AuditLogManager_SaveLog({
			Action: `took action on RDC request ${AppRequest.requestDetails.WorkflowRequestID}`,
		});
	});		
	globalDefinitions.closeLoader();
}