loadNewRequestComponent = function () {
    if (MainApplication.cachedState.mode) {
        whenNewRequestDependeciesLoaded();
    } else {
        setTimeout(function () {
            MainApplication.cachedState.pageStateCall = loadNewRequestComponent;
        }, 1000);
    }
};

var AppRequest;
var customWorkflowEngine;

MainApplication.NewRequestComponent.ApplicationDetails = function () {
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

function whenNewRequestDependeciesLoaded() {
    globalDefinitions.callLoader();
    $spcontext.assignAttributes();
    MainApplication.CurrentPageSubmitFunction = MainApplication.NewRequestComponent.confirmSubmit;
    AppRequest = new MainApplication.NewRequestComponent.ApplicationDetails();
    globalDefinitions.extendStages();
    AppRequest.itemId = $spcontext.getParameterByName("itemid", window.location.href);
    AppRequest.mode = $spcontext.getParameterByName("mode", window.location.href);

    customWorkflowEngine = new WorkflowManagerEngine(CurrentUserProperties);
    globalDefinitions.SetWorkflowRouting(customWorkflowEngine);
    customWorkflowEngine.routeEngine(customWorkflowEngine).setCurrentUserAsInitiator();

    $spcontext.applyValidationEvents();


    $('#addFirstTemplateBtn').on('click', function (e) {
        e.preventDefault();
        MainApplication.NewRequestComponent.addCommunicationTemplate();
        $('#addCommunicationTemplateBtn').removeClass('hidden');
        $(".action-btns").removeClass("hidden");
        $(".checkboxcontainer").removeClass("hidden");
    });

    $('#addCommunicationTemplateBtn').on('click', function (e) {
        e.preventDefault();
        MainApplication.NewRequestComponent.addCommunicationTemplate();
        MainApplication.NewRequestComponent.reIndexTemplates();
    });

    $('.submit-button').prop('disabled', true);


    $('#checkbox').on('change', function () {
        if ($(this).is(':checked')) {
            $('.submit-button').prop('disabled', false);
        } else {
            $('.submit-button').prop('disabled', true);
        }
    });

    setTimeout(function () {
        if (AppRequest.itemId !== null && AppRequest.itemId !== "") {
            if (AppRequest.mode === "modify") {
                $("#commentBox").show();
            } else {
                $("#commentBox").hide();
            }
            MainApplication.NewRequestComponent.recoverListData();
        }
        globalDefinitions.closeLoader();
    }, 2000);


}

$(document).on('change', '.otherCheckbox', function () {
    const $wrapper = $(this).closest('.other-mode-wrapper');
    const $inputContainer = $wrapper.find('.other-input');
    const $input = $wrapper.find('.otherModeInput');

    const isChecked = this.checked;

    $inputContainer.toggleClass('hidden', !isChecked);

    $input
        .prop('disabled', !isChecked)
        .val(isChecked ? $input.val() : '');

    if (isChecked) {
        $input.focus();
    }
});

$(document).on('click', '.toggleAccordion', function (e) {
    // e.preventDefault();
    e.stopPropagation();

    const $section = $(this).closest('section');
    const $body = $section.find('.accordion-body');
    const $header = $section.find('.accordion-header');

    // Close others if needed (optional)
    // $('.accordion-body').not($body).slideUp();

    // $body.stop(true, true).slideToggle(200);

    $body.stop(true, true).slideToggle(200, function () {
        // After animation completes, update visual state
        const isVisible = $body.is(':visible');
        $header.toggleClass('open', isVisible);
        // or $toggle.toggleClass('rotate-180', isVisible);
    });
});


$(document).on('click', '.deleteTemplate', function () {
    $(this).closest('section').remove();
    MainApplication.NewRequestComponent.reIndexTemplates();
    MainApplication.NewRequestComponent.updateEmptyState();
});

MainApplication.NewRequestComponent.recoverListData = function () {

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
        "CMData", "Division_Unit", "HOD", "Contributors", "HODEmail", "Year", "Month", "Comment"
    ];

    commatrix.getListToControl("CommunicationMatrixList", query, extraProperties, function (listProperties) {
        if (!$.isEmptyObject(listProperties)) {
            if (listProperties.Division_Unit.toLowerCase() !== MainApplication.staffDetails[CurrentUserProperties.email].Department.toLowerCase()) {
                globalDefinitions.HandlerError("You are unauthorized to handle this workflow... ");
                $spcontext.redirect("#/", false);
            }

            listProperties.Created = $spcontext.stringnifyDate({
                value: listProperties.Created
            });

            listProperties.Transaction_History = $spcontext.JSONToObject(listProperties.Transaction_History);
            listProperties.CMData = $spcontext.JSONToObject(listProperties.CMData);



            // if (listProperties.Transaction_History.length !== 0) {
            //     $("#transaction-history").show();
            //     globalDefinitions.displayHistory(listProperties.Transaction_History);
            // }
            MainApplication.NewRequestComponent.renderCommunicationTemplatesFromData(listProperties.CMData);
            console.log("Communication Data: ", listProperties.CMData);
            AppRequest.requestDetails = listProperties;
            $spcontext.htmlBind(listProperties);

            globalDefinitions.closeLoader();
        }
        else {
            globalDefinitions.HandlerError("Request doesnt exist...");
            $spcontext.redirect("#/", false);
        }
    });
}

MainApplication.NewRequestComponent.addCommunicationTemplate = function () {
    const index = $('#communicationTemplatesContainer section').length + 1;
    const templateId = `communicationTemplate_${Date.now()}`;

    const COMMUNICATION_MODES = Array.from(MainApplication.modeOfCommunication || []);

    // Optional quick check
    if (!Array.isArray(COMMUNICATION_MODES) || COMMUNICATION_MODES.length === 0) {
        console.warn("Modes didn't convert properly — using fallback");
        COMMUNICATION_MODES.push(
            "Email", "Phone", "Meeting", "Memo", "Other"
        );
    }
    // Generate checkbox HTML dynamically
    const modesHTML = COMMUNICATION_MODES
        .map(mode => {
            if (mode === "Other") {
                return `
                    <div class="other-mode-wrapper">
                        <label class="flex items-center space-x-3">
                            <input type="checkbox" 
                                   class="modeCheckbox otherCheckbox w-4 h-4 border-gray-300 focus:ring-primary-500" 
                                   value="${mode}">
                            <span>${mode}</span>
                        </label>
                        <div class="other-input mt-2 ml-7 hidden">
                            <input type="text" 
                                   class="otherModeInput w-full px-3 py-2 border border-gray-300 rounded-md 
                                          placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 
                                          text-sm" 
                                   placeholder="Specify other mode..."
                                   disabled />
                        </div>
                    </div>
                `;
            }

            // Normal modes
            return `
                <label class="flex items-center space-x-3">
                    <input type="checkbox" 
                           class="modeCheckbox w-4 h-4 border-gray-300 focus:ring-primary-500" 
                           value="${mode}">
                    <span>${mode}</span>
                </label>
            `;
        })
        .join('');

    const templateHTML = `
        <section id="${templateId}" class="border border-gray-200 shadow-sm rounded mb-5">

            <!-- Accordion Header -->
            <div class="flex justify-between items-center bg-slate-100 px-4 py-3 cursor-pointer accordion-header">
                <div class="flex gap-3">
                    <h2 class="text-lg font-bold text-navy-900">
                        ${index}
                    </h2>
                    <p speed-bind-validate='TempData' data-bind="ContributorName" class="text-lg font-bold text-navy-900">${CurrentUserProperties.title}</p>
                    <input type="hidden" data-bind="ContributorEmail" value="${CurrentUserProperties.email}" />
                </div>

                <div class="flex gap-3">
                    <button class="deleteTemplate text-sm text-slate-440 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                    <span class="toggleAccordion inline-flex items-center justify-center transition-transform duration-300"
                        :class="{ 'rotate-180': isOpen }">
                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </span>
                </div>
            </div>

            <!-- Accordion Body -->
            <div class="accordion-body bg-white p-4 sm:p-6">

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

                    <div class="mt-2">
                        <label class="block text-sm font-medium text-blue-600 mb-2">What to Communicate:</label>
                        <input speed-bind-validate='TempData' placeholder="Enter text here" data-bind="WhatToCommunicate" type="text" class="w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm sm:text-base" />
                    </div>

                    <div class="mt-2">
                        <label class="block text-sm font-medium text-blue-600 mb-2">Compliance Obligation:</label>
                        <select speed-bind-validate='TempData' data-bind="ComplianceObligation" class="w-full px-3 sm:px-4 py-2 sm:py-3 appearance-none dropdown-arrow focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base">
                            <option value="">Select</option>
                            <option>Yes</option>
                            <option>No</option>
                        </select>
                    </div>

                    <div class="mt-2">
                        <label class="block text-sm font-medium text-blue-600 mb-2">When to Communicate:</label>
                        <input speed-bind-validate='TempData' placeholder="Enter text here" data-bind="WhenToCommunicate" type="text" class="w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base" />
                    </div>

                    <div class="mt-2">
                        <label class="block text-sm font-medium text-blue-600 mb-2">Recipient:</label>
                        <input speed-bind-validate='TempData' placeholder="Enter text here" data-bind="Recipient" type="text" class="w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base" />
                    </div>

                    <div class="mt-2">
                        <label class="block text-sm font-medium text-blue-600 mb-2">Type:</label>
                        <select speed-bind-validate='TempData' data-bind="Type" class="w-full px-3 sm:px-4 py-2 sm:py-3 appearance-none dropdown-arrow focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base">
                            <option value="">Select</option>
                            <option>Internal</option>
                            <option>External</option>
                            <option>Internal/External</option>
                        </select>
                    </div>

                    <!-- Mode of Communication – now dynamic -->
                    <div class="mt-2">
                        <label class="block text-sm font-medium text-blue-600 mb-2">Mode of Communication:</label>
                        <div class="flex flex-wrap gap-2 text-sm modes-container">
                            ${modesHTML}
                        </div>
                    </div>

                    <div class="mt-2">
                        <label class="block text-sm font-medium text-blue-600 mb-2">Primary Responsibility:</label>
                        <input speed-bind-validate='TempData' placeholder="Enter text here" data-bind="PrimaryResponsibility" type="text" class="w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base" />
                    </div>

                    <div class="mt-2">
                        <label class="block text-sm font-medium text-blue-600 mb-2">Secondary Responsibility:</label>
                        <input speed-bind-validate='TempData' placeholder="Enter text here" data-bind="SecondaryResponsibility" type="text" class="w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base" />
                    </div>

                </div>
            </div>
        </section>
    `;

    $('#communicationTemplatesContainer').append(templateHTML);
    MainApplication.NewRequestComponent.updateEmptyState();
}

MainApplication.NewRequestComponent.reIndexTemplates = function () {
    $('#communicationTemplatesContainer section').each(function (index) {
        $(this).find('h2').text(`${index + 1}`);
    });
}

MainApplication.NewRequestComponent.updateEmptyState = function () {
    const container = $('#communicationTemplatesContainer');
    const emptyState = $('#emptyState');
    const hasTemplates = container.find('section').length > 0;

    if (hasTemplates) {
        emptyState.addClass('hidden');
    } else {
        emptyState.removeClass('hidden');
        $('#addCommunicationTemplateBtn').addClass('hidden');
        $(".action-btns").addClass("hidden");
        $(".checkboxcontainer").addClass("hidden");
    }
}

MainApplication.NewRequestComponent.collectCommunicationTemplates = function () {
    const templateData = [];

    $('#communicationTemplatesContainer section').each(function () {
        const template = {};

        // Standard data-bind fields
        $(this).find('[data-bind]').each(function () {
            const key = $(this).attr('data-bind');
            template[key] = $(this).val() || $(this).text();
        });

        // Modes
        template.ModeOfCommunication = [];
        $(this).find('.modeCheckbox:checked').each(function () {
            const value = $(this).val();
            if (value === "Other") {
                const otherValue = $(this)
                    .closest('.other-mode-wrapper')
                    .find('.otherModeInput')
                    .val()
                    .trim();

                if (otherValue) {
                    template.ModeOfCommunication.push(`Other: ${otherValue}`);
                } else {
                    template.ModeOfCommunication.push("Other");
                }
            } else {
                template.ModeOfCommunication.push(value);
            }
        });

        templateData.push(template);
    });
    return templateData;
}

MainApplication.NewRequestComponent.getAllContributorEmails = function () {
    const emails = [];

    $('#communicationTemplatesContainer section').each(function () {
        const $emailField = $(this).find('[data-bind="ContributorEmail"]');

        if ($emailField.length) {
            const email = $emailField.val() || $emailField.text();
            if (email && email.trim()) {
                emails.push(email.trim());
            }
        }
    });

    return emails;
};

MainApplication.NewRequestComponent.getComplianceSummary = function () {
    const templates = $('#communicationTemplatesContainer section');

    let totalTemplates = templates.length;
    let yesCount = 0;
    let noCount = 0;

    templates.each(function () {
        const complianceValue = $(this)
            .find('select[data-bind="ComplianceObligation"]')
            .val();

        if (complianceValue === "Yes") {
            yesCount++;
        }
        if (complianceValue === "No") {
            noCount++;
        }
    });

    return {
        totalTemplates,
        yesCount,
        noCount
    };
};

MainApplication.NewRequestComponent.confirmSubmit = function (action) {
    if (action === "Draft") {
        MainApplication.confirmAction = MainApplication.NewRequestComponent.saveConfirmed;
        $("#confirmModal").modal("show");
    } else {
        MainApplication.confirmAction = MainApplication.NewRequestComponent.actionConfirmed;
        $("#confirmModal").modal("show");
    }
}

MainApplication.NewRequestComponent.actionConfirmed = function () {
    MainApplication.NewRequestComponent.saveDataToList();
}

MainApplication.NewRequestComponent.saveConfirmed = function () {
    MainApplication.NewRequestComponent.saveDataToListAsDraft();
}

MainApplication.NewRequestComponent.saveDataToList = function () {
    globalDefinitions.onActionClicked();
    
    var tempData = $spcontext.bind({});
    if ($spcontext.checkPassedValidation()) {
        var formData = {};
        formData.CMData = MainApplication.NewRequestComponent.collectCommunicationTemplates();
        formData.CMData = JSON.stringify(formData.CMData);

        const contributorEmails = MainApplication.NewRequestComponent.getAllContributorEmails();
        // const complianceSummary = MainApplication.NewRequestComponent.getComplianceSummary();

        const multiUsers = contributorEmails.map(email =>
            SP.FieldUserValue.fromUser(email.trim())
        );
        formData.Contributors = multiUsers;
        formData.Division_Unit = MainApplication.staffDetails[CurrentUserProperties.email].Department;
        let hodmail = MainApplication.staffDetails[CurrentUserProperties.login].HodEmail;
        formData.HOD = SP.FieldUserValue.fromUser(hodmail);
        formData.HODEmail = hodmail;
        // formData.NumberOfEntries = complianceSummary.totalTemplates;
        // formData.NumberOfCompliance = complianceSummary.yesCount;
        // formData.NumberOfNonCompliance = complianceSummary.noCount;



        globalDefinitions.callLoader();
        AppRequest.returned = AppRequest.requestDetails.ReturnForCorrection;

        customWorkflowEngine.updateStageByName({
            name: globalDefinitions.stageDefinitions.hod,
            username: MainApplication.staffDetails[hodmail].Title,
            authenticationValue: hodmail,
            emails: [hodmail],
        });
        console.log(AppRequest.returned);
        console.log(AppRequest.itemId);

        // formData = customWorkflowEngine.routeEngine(customWorkflowEngine).requestHistoryHandler(formData, AppRequest.transactionHistory, { stage: "Auditor", action: "Audit Created" });
        if (AppRequest.returned === "Yes" || (AppRequest.itemId !== null && AppRequest.itemId !== "")) {
            console.log("This runs");
            formData = customWorkflowEngine.routeEngine(customWorkflowEngine).requestHistoryHandler(formData, AppRequest.requestDetails.Transaction_History, { stage: "Auditor", action: "Audit Submitted" });
            formData = customWorkflowEngine.routeEngine(customWorkflowEngine).runRouting(formData);
        }
        else {
            console.log("That runs");
            formData = customWorkflowEngine.routeEngine(customWorkflowEngine).requestHistoryHandler(formData, AppRequest.transactionHistory, { stage: "Auditor", action: "Audit Created" });
            formData = customWorkflowEngine.routeEngine(customWorkflowEngine).runRouting(formData);
        }

        globalDefinitions.onActionCompleted();
        MainApplication.NewRequestComponent.proceedToList(formData, false);
    }
    else {
        globalDefinitions.HandlerError("", true);
        globalDefinitions.onActionFailed();
    }
}

MainApplication.NewRequestComponent.saveDataToListAsDraft = function () {
    globalDefinitions.onActionClicked();
    var tempData = $spcontext.bind({});
    if ($spcontext.checkPassedValidation()) {
        var formData = {};
        formData.CMData = MainApplication.NewRequestComponent.collectCommunicationTemplates();
        formData.CMData = JSON.stringify(formData.CMData);

        const contributorEmails = MainApplication.NewRequestComponent.getAllContributorEmails();
        // const complianceSummary = MainApplication.NewRequestComponent.getComplianceSummary();
        const multiUsers = contributorEmails.map(email =>
            SP.FieldUserValue.fromUser(email.trim())
        );
        formData.Contributors = multiUsers;
        formData.Division_Unit = MainApplication.staffDetails[CurrentUserProperties.email].Department;
        let hodmail = MainApplication.staffDetails[CurrentUserProperties.login].HodEmail;
        formData.HOD = SP.FieldUserValue.fromUser(hodmail);
        formData.HODEmail = hodmail;
        // formData.NumberOfEntries = complianceSummary.totalTemplates;
        // formData.NumberOfCompliance = complianceSummary.yesCount;
        // formData.NumberOfNonCompliance = complianceSummary.noCount;

        formData.Approval_Status = "Pending";
        formData.Current_Approver = "Employee";

        globalDefinitions.callLoader();

        if (AppRequest.itemId !== null && AppRequest.itemId !== "") {
            formData = customWorkflowEngine.routeEngine(customWorkflowEngine).requestHistoryHandler(formData, AppRequest.requestDetails.Transaction_History, { stage: "Auditor", action: "Audit Modified" });
            // formData = customWorkflowEngine.routeEngine(customWorkflowEngine).runRouting(formData, AppRequest.defaultStage, globalDefinitions.stageDefinitions.save);
        } else {
            formData = customWorkflowEngine.routeEngine(customWorkflowEngine).requestHistoryHandler(formData, AppRequest.transactionHistory, { stage: "Auditor", action: "Audit Modified" });
        }
        globalDefinitions.onActionCompleted();

        MainApplication.NewRequestComponent.proceedToList(formData, true);
    }else {
        globalDefinitions.HandlerError("", true);
        globalDefinitions.onActionFailed();
    }
}

MainApplication.NewRequestComponent.proceedToList = function (formData, saveMode) {
    if (AppRequest.itemId == null) {
        commatrix.createItems([formData], "CommunicationMatrixList",
            function (createdItemsProperties) {
                var itemID = createdItemsProperties[0].get_id();
                var updateObj = {};
                updateObj.ID = itemID;
                // var dateCreatedCode = $spcontext.stringnifyDate({
                //     includeTime: true,
                //     timeSpace: false,
                //     format: "dd-mm-yy"
                // });
                // dateCreatedCode = dateCreatedCode.replace(/-/g, "");
                updateObj.WorkflowRequestID = globalDefinitions.stageDefinitions.workflowcode + itemID;

                AppRequest.requestDetails = formData;
                AppRequest.requestDetails.WorkflowRequestID = updateObj.WorkflowRequestID;
                updateObj.Year = $spcontext.serverDate().getFullYear();
                updateObj.RequestCreated = $spcontext.serverDate();
                updateObj.Month = $spcontext.serverDate().getMonth();
                updateObj.Title = updateObj.WorkflowRequestID;
                updateObj.Monitored = "No";

                commatrix.updateItems([updateObj], "CommunicationMatrixList", function () {
                    setTimeout(() => {
                        globalDefinitions.closeLoader();
                    }, 2000);
                    globalDefinitions.HandlerSuccess(saveMode ? "Data entry is saved successfully" : "Data entry Submitted Successfully");

                    globalDefinitions.AuditLogManager_SaveLog({
                        Action: saveMode ? `saved Data ${AppRequest.requestDetails.WorkflowRequestID}` : `submitted Data ${AppRequest.requestDetails.WorkflowRequestID}`
                    });
                    globalDefinitions.onActionCompleted();
                    $spcontext.redirect("#/", false);
                });
            });
    } else {

        MainApplication.NewRequestComponent.compareExistingData(function (oldCMData, latestCMData) {

            console.log("OLD CMData:", oldCMData);
            console.log("LATEST CMData:", latestCMData);

            var hasConflict = JSON.stringify(oldCMData) !== JSON.stringify(latestCMData);

            if (hasConflict) {
                globalDefinitions.HandlerError("This record was modified by another user. Please refresh this page and try again.");
                globalDefinitions.closeLoader();
                return;
            }

            formData.ID = AppRequest.requestDetails.ID;

            if (!saveMode && AppRequest.requestDetails.Year === "") {
                formData.Year = $spcontext.serverDate().getFullYear();
                formData.RequestCreated = $spcontext.serverDate();
            }

            commatrix.updateItems([formData], "CommunicationMatrixList", function () {

                if (AppRequest.requestDetails.ReturnForCorrection !== "Yes") {
                    AppRequest.requestDetails.Current_Approver = formData.Current_Approver;
                }

                setTimeout(() => {
                    globalDefinitions.closeLoader();
                }, 2000);

                globalDefinitions.HandlerSuccess(
                    saveMode ? "Data entry is saved successfully" : "Data entry Submitted Successfully"
                );

                globalDefinitions.AuditLogManager_SaveLog({
                    Action: saveMode 
                        ? `saved Data ${AppRequest.requestDetails.WorkflowRequestID}` 
                        : `submitted Data ${AppRequest.requestDetails.WorkflowRequestID}`
                });

                globalDefinitions.onActionCompleted();
                $spcontext.redirect("#/", false);
            });

        });
    }

}

MainApplication.NewRequestComponent.renderCommunicationTemplatesFromData = function (dataArray) {
    const container = $('#communicationTemplatesContainer');
    // container.empty();

    if (!Array.isArray(dataArray)) return;

    dataArray.forEach((item, index) => {
        const templateId = `communicationTemplate_${Date.now()}_${index}`;

        const COMMUNICATION_MODES = Array.from(MainApplication.modeOfCommunication || [
            "Email", "Phone", "Meeting", "Memo", "Other"
        ]);

        // ---- FIX: Parse ModeOfCommunication & Extract "Other" ----
        let parsedModes = [];
        let otherText = "";

        if (Array.isArray(item.ModeOfCommunication)) {
            item.ModeOfCommunication.forEach(val => {
                if (val.toLowerCase().startsWith("other:")) {
                    parsedModes.push("Other");
                    otherText = val.split(":").slice(1).join(":").trim();
                } else {
                    parsedModes.push(val);
                }
            });
        }

        // ---- Build Mode Checkbox HTML ----
        const modesHTML = COMMUNICATION_MODES.map(mode => {
            const checked = parsedModes.includes(mode) ? "checked" : "";
            const isOther = mode === "Other";

            if (isOther) {
                return `
                    <div class="other-mode-wrapper">
                        <label class="flex items-center space-x-3">
                            <input type="checkbox" 
                                   class="modeCheckbox otherCheckbox w-4 h-4 border-gray-300 focus:ring-primary-500" 
                                   value="${mode}" ${checked}>
                            <span>${mode}</span>
                        </label>

                        <div class="other-input mt-2 ml-7 ${checked ? "" : "hidden"}">
                            <input type="text" 
                                   class="otherModeInput w-full px-3 py-2 border border-gray-300 rounded-md 
                                          placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 
                                          text-sm" 
                                   placeholder="Specify other mode..."
                                   value="${otherText}"
                                   ${checked ? "" : "disabled"} />
                        </div>
                    </div>
                `;
            }

            return `
                <label class="flex items-center space-x-3">
                    <input type="checkbox" 
                           class="modeCheckbox w-4 h-4 border-gray-300 focus:ring-primary-500" 
                           value="${mode}" ${checked}>
                    <span>${mode}</span>
                </label>
            `;
        }).join('');

        const templateHTML = `
            <section id="${templateId}" class="border border-gray-200 shadow-sm rounded mb-5">

                <!-- Accordion Header -->
                <div class="flex justify-between items-center bg-slate-100 px-4 py-3 cursor-pointer accordion-header">
                    <div class="flex gap-3">
                        <h2 class="text-lg font-bold text-navy-900 template-title">
                            ${index + 1}
                        </h2>

                        <p data-bind="ContributorName" class="text-lg font-bold text-navy-900">${item.ContributorName}</p>

                        <input type="hidden" data-bind="ContributorEmail" value="${item.ContributorEmail}" />
                    </div>

                    <div class="flex gap-3">
                        <span class="toggleAccordion inline-flex items-center justify-center transition-transform duration-300">
                            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </span>
                    </div>
                </div>

                <!-- Accordion Body -->
                <div class="accordion-body bg-white p-4 sm:p-6">

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

                        ${MainApplication.NewRequestComponent.renderBoundInput("WhatToCommunicate", "What to Communicate:", item.WhatToCommunicate)}
                        ${MainApplication.NewRequestComponent.renderBoundSelect("ComplianceObligation", "Compliance Obligation:", ["Yes", "No"], item.ComplianceObligation)}
                        ${MainApplication.NewRequestComponent.renderBoundInput("WhenToCommunicate", "When to Communicate:", item.WhenToCommunicate)}
                        ${MainApplication.NewRequestComponent.renderBoundInput("Recipient", "Recipient:", item.Recipient)}
                        ${MainApplication.NewRequestComponent.renderBoundSelect("Type", "Type:", ["Internal", "External"], item.Type)}

                        <!-- Mode of Communication -->
                        <div class="mt-2">
                            <label class="block text-sm font-medium text-blue-600 mb-2">Mode of Communication:</label>
                            <div class="flex flex-wrap gap-2 text-sm modes-container">
                                ${modesHTML}
                            </div>
                        </div>

                        ${MainApplication.NewRequestComponent.renderBoundInput("PrimaryResponsibility", "Primary Responsibility:", item.PrimaryResponsibility)}
                        ${MainApplication.NewRequestComponent.renderBoundInput("SecondaryResponsibility", "Secondary Responsibility:", item.SecondaryResponsibility)}

                    </div>
                </div>
            </section>
        `;

        container.append(templateHTML);
        MainApplication.NewRequestComponent.updateEmptyState();
        $('#addCommunicationTemplateBtn').removeClass('hidden');
        $(".action-btns").removeClass("hidden");
        $(".checkboxcontainer").removeClass("hidden");
    });

    // ---- Enable Other Toggle Behavior ----
    container.find(".otherCheckbox").on("change", function () {
        const wrapper = $(this).closest(".other-mode-wrapper");
        const input = wrapper.find(".otherModeInput");

        if (this.checked) {
            wrapper.find(".other-input").removeClass("hidden");
            input.prop("disabled", false);
        } else {
            wrapper.find(".other-input").addClass("hidden");
            input.prop("disabled", true).val("");
        }
    });

    MainApplication.NewRequestComponent.updateEmptyState();
};

MainApplication.NewRequestComponent.renderBoundInput = function (bind, label, value = "") {
    return `
        <div class="mt-2">
            <label class="block text-sm font-medium text-blue-600 mb-2">${label}</label>
            <input data-bind="${bind}" 
                   speed-bind-validate="TempData"
                   type="text" 
                   value="${value || ""}" 
                   class="w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base" />
        </div>
    `;
}

MainApplication.NewRequestComponent.renderBoundSelect = function (bind, label, options, selected) {
    return `
        <div class="mt-2">
            <label class="block text-sm font-medium text-blue-600 mb-2">${label}</label>
            <select data-bind="${bind}" 
                    speed-bind-validate="TempData"
                    class="w-full px-3 sm:px-4 py-2 sm:py-3 appearance-none dropdown-arrow focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base">
                <option value="">Select</option>
                ${options.map(opt => `
                    <option value="${opt}" ${opt === selected ? "selected" : ""}>${opt}</option>
                `).join("")}
            </select>
        </div>
    `;
}

MainApplication.NewRequestComponent.compareExistingData = function (callback) {

    var query = commatrix.camlBuilder([
        { rowlimit: 1 },
        {
            operator: 'Eq',
            field: 'WorkflowRequestID',
            type: 'Text',
            val: AppRequest.itemId
        }
    ]);

    var extraProperties = ["CMData"];

    commatrix.getListToControl("CommunicationMatrixList", query, extraProperties, function (listProperties) {

        if (!$.isEmptyObject(listProperties)) {

            var oldCMData = AppRequest.requestDetails?.CMData;
            var latestCMData = $spcontext.JSONToObject(listProperties.CMData);

            if (typeof oldCMData === "string") {
                oldCMData = $spcontext.JSONToObject(oldCMData);
            }

            callback(oldCMData, latestCMData);

        } else {
            globalDefinitions.HandlerError("Error...Please try again later.");
            $spcontext.redirect("#/", false);
        }
    });
};
