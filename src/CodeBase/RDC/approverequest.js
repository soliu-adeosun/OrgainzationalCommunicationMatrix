loadApproveRequestComponent = function () {
	if (MainApplication.cachedState.mode) {
		whenApproveRequestDependeciesLoaded();
	} else {
		MainApplication.cachedState.pageStateCall = loadApproveRequestComponent;
	}
};

var AppRequest;
var customWorkflowEngine;

MainApplication.ApproveRequestComponent.ApplicationDetails = function () {
	this.url = window.location.href;
	this.itemId = null;
	this.requestDetails = {};
	this.Attachments = [];
	this.FileUrls = {};
	this.FolderUrl = "";
	this.AttachmentLoader = {};
	this.messageTemplate = {};
	this.feedback = false;
	this.approverComment = "";
	this.transactionHistory = [];
	this.defaultStage = "AA0";
	this.returned = false;
	this.messageType = "standard";
	this.documentsToUpdate = {};
	this.mode = null;
};

whenApproveRequestDependeciesLoaded = function () {
	globalDefinitions.callLoader();
	globalDefinitions.extendStages();
	$spcontext.assignAttributes();

	$spcontext.filesDictionary = {};

	AppRequest = new MainApplication.ApproveRequestComponent.ApplicationDetails();
	globalDefinitions.extendStages();
	customWorkflowEngine = new WorkflowManagerEngine(CurrentUserProperties);
	globalDefinitions.SetWorkflowRouting(customWorkflowEngine);
	AppRequest.itemId = $spcontext.getParameterByName("itemid", window.location.href);
	AppRequest.mode = $spcontext.getParameterByName("mode", window.location.href);

	$spcontext.filesDictionary = {};

	$spcontext.validationProperties.text.extend["Comment"] = function (field) {
		var passed = false;
		if ((field.trim() !== "" && (AppRequest.actionTaken === globalDefinitions.stageDefinitions.decline || AppRequest.actionTaken === globalDefinitions.stageDefinitions.correction || AppRequest.actionTaken === "Revise")) || AppRequest.actionTaken === globalDefinitions.stageDefinitions.approve)
			passed = true;
		return passed;
	};
	
	$spcontext.applyValidationEvents();
	MainApplication.ApproveRequestComponent.recoverListData();
	// setTimeout(function () {
	// 	globalDefinitions.closeLoader();
	// }, 2000);
};

MainApplication.ApproveRequestComponent.recoverListData = function () {
	if (AppRequest.itemId !== null && AppRequest.itemId !== "") {
		var query = commatrix.camlBuilder([
			{
				rowlimit: 1,
			},

			{
				operator: "Eq",
				field: "WorkflowRequestID",
				type: "Text",
				val: AppRequest.itemId,
			},
			{
			    operator: 'Eq',
			    field: 'Approval_Status',
			    type: 'Text',
			    val: globalDefinitions.stageDefinitions.pending
			}
		]);

		var extraProperties = [
			"ID", "WorkflowRequestID", "Current_Approver", "Current_Approver_Code", "Approval_Status",
			"Created", "InitiatorEmailAddress", "InitiatorLogin", "Transaction_History", "ReturnForCorrection",
			"Modified", "PendingUserEmail", "PendingUserLogin", "Attachment_Folder", "AttachmentURL", "Author",
			"CMData", "Division_Unit", "HOD", "Contributors", "HODEmail", "Year", "Month", "Comment"
		];

		commatrix.getListToControl("CommunicationMatrixList", query, extraProperties, function (listProperties) {
			if ($.isEmptyObject(listProperties)) {
				MainApplication.notyf.error("Request is not pending approval...");
				$spcontext.redirect("#/", false);
				globalDefinitions.closeLoader();
			} else {
				customWorkflowEngine.routeEngine(customWorkflowEngine).updateRoutesinFlow(listProperties, function (resolved) {
					customWorkflowEngine.routeEngine(customWorkflowEngine).PageSecurity(customWorkflowEngine.stages.securityModeTask, listProperties.Current_Approver, listProperties.Approval_Status, function (error) {
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

								// if (listProperties.Current_Approver !== "Employee" && listProperties.Current_Approver_Code !== "AA1") {
								// 	listProperties.Comment = "";
								// }

								MainApplication.renderCommunicationTemplatesReadOnly(listProperties.CMData);
								AppRequest.requestDetails = listProperties;

								// $spcontext.htmlBind(listProperties);

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
									Message: "User is not allowed to act on this request",
								});
								setTimeout(function () {
									globalDefinitions.closeLoader();
								}, 1000);
								$spcontext.redirect("#/", false);
							}

						// }
					}); //commented here
				}); //commented here
			}
		});
	} else {
		globalDefinitions.closeLoader();
		MainApplication.notyf.error("Invalid Request...");
		$spcontext.redirect("#/", false);
	}
};

MainApplication.ApproveRequestComponent.confirmSubmit = function (actionTaken) {
	$("#confirmModal").modal("show");
	AppRequest.actionTaken = actionTaken;
	MainApplication.confirmAction = MainApplication.ApproveRequestComponent.actionConfirmed;
};

MainApplication.ApproveRequestComponent.actionConfirmed = function () {
	$("#confirmModal").modal("hide");
	MainApplication.ApproveRequestComponent.saveDataToList(AppRequest.actionTaken);
};

MainApplication.ApproveRequestComponent.saveDataToList = function (actionTaken) {
	globalDefinitions.onActionClicked();

	var tempData = $spcontext.bind({});

	if ($spcontext.checkPassedValidation()) {
		// if (CurrentUserProperties.title === AppRequest.requestDetails.EmployeeName) {
			// var formData = $spcontext.bind({});
		// } else {
			var formData = {};
		// }
		

		AppRequest.comment = $("#approvercomment").val();
		formData.Comment = AppRequest.comment;


		// Build custom message for history action
		let historyActionMessage = "";

		if (actionTaken === "Approved") {
			if (AppRequest.requestDetails.Current_Approver === "HOD") {
				historyActionMessage = "HOD approved";
			}
			if (AppRequest.requestDetails.Current_Approver === "Management Rep") {
				historyActionMessage = "Management Rep Reviewed";
			}
		} else if (actionTaken === "Declined") {
			if (AppRequest.requestDetails.Current_Approver === "HOD") {
				historyActionMessage = "HOD declined";
			}
			if (AppRequest.requestDetails.Current_Approver === "Management Rep") {
				historyActionMessage = "Management Rep declined";
			} 
		}

		var historyProp = {
			stage: AppRequest.requestDetails.Current_Approver,
			comment: AppRequest.comment,
			action: historyActionMessage,
		};

		formData = customWorkflowEngine.routeEngine(customWorkflowEngine).requestHistoryHandler(formData, AppRequest.requestDetails.Transaction_History, historyProp);

		if (actionTaken === "Approved") {
			formData = customWorkflowEngine.routeEngine(customWorkflowEngine).runRouting(formData, AppRequest.requestDetails.Current_Approver_Code, actionTaken);
		} else if (actionTaken === "Declined") {
            formData.Current_Approver = "Employee";
            formData.Current_Approver_Code = AppRequest.defaultStage;
            formData.PendingUserLogin = "";
            formData.PendingUserEmail = "";
            formData.Approval_Status = "Declined";
            formData.ReturnForCorrection = "Yes";
        }

		globalDefinitions.onActionCompleted();
		MainApplication.ApproveRequestComponent.proceedToList(formData);
	} else {
		globalDefinitions.HandlerError("", true);
		globalDefinitions.onActionFailed();
	}
};

MainApplication.ApproveRequestComponent.proceedToList = function (formData) {
	globalDefinitions.callLoader();

	formData.ID = AppRequest.requestDetails.ID;

	commatrix.updateItems([formData], "CommunicationMatrixList", function () {
		// AppRequest.requestDetails.Current_Approver = formData.Current_Approver;
		globalDefinitions.closeLoader();
		globalDefinitions.HandlerSuccess(`You have successfully taken action on this request`);
		globalDefinitions.AuditLogManager_SaveLog({
			Action: `took action on communication matrix request ${AppRequest.requestDetails.WorkflowRequestID}`,
		});
		$spcontext.redirect("#/", false);
	});		
	globalDefinitions.closeLoader();
};
