var MainApplication = new MainStartPoint();
var customWorkflowEngine;
var CurrentUserProperties = {};

var configProperties = {
  restrictedlinks: [],
};

var configPropertiesRoot = {
    restrictedlinks: [],
};

var speedctxRoot;
var globalDefinitions;
var rsBAContext;

function MainStartPoint() {
  this.url = window.location.href;
  this.notyf = new Notyf({
    duration: 5000,
    //dismissible: true,
    position: {
      x: 'right', // 'left' or 'right'
      y: 'top'   // 'top' or 'bottom'
    },
    types: [
      {
        type: 'black',
        background: 'black',
        icon: {
          className: 'material-icons',
          tagName: 'i',
          text: 'info' // optional icon
        },
        duration: 3000
      }
    ]
  });
  this.profilephoto = `/_layouts/15/userphoto.aspx?size=M&accountname=`;
  this.profilephotoLarge = `/_layouts/15/userphoto.aspx?size=L&accountname=`;
  this.messageTemplate = {};
  this.cachedState = {
    mode: false,
    pageStateCall: null,
    reportAdmin: false,
    isWorkflowActor: false,
    workflowActors: {},
    isAdmin: false,
    isReportAdmin: false,
    ipaddress: "",
    departments: [],
    hods: {},
    currentUserIsHod: {
      auth: false,
      department: ""
    },
  };
  this.staffDetails = {};
  this.staffList = [];

  this.AuditDetails = {};
  this.AuditList = [];

  this.configuredTaskMembers = {};
  this.isUserAnActor = false;
  this.isPureHOD = false;



  this.NewRequestComponent = {};
  this.DashboardComponent = {};
  this.ApproveRequestComponent = {};
  this.ViewRequestComponent = {};
  this.ReportComponent = {};
  this.AnalyticsComponent = {};

  this.CurrentPageSubmitFunction = null;
  this.modeOfCommunication = [];
  this.processes = [];
  // this.procedures = [];

  this.auditNavigationClicks = function(clicklocation){
    globalDefinitions.AuditLogManager_SaveLog({
        Action : `Authorized accessed ${clicklocation}`,
        Message : `user visited the ${clicklocation} at ${$spcontext.stringnifyDate({ format : "dd/mm/yy", includeTime : true})}`
    });
  }

}

function whenLayoutLoaded() {
  //load view port to enable page to be mobile responsive
  $("head").append(`<meta name="viewport" content="width=device-width, initial-scale=1">`);
  var $contentRegion = $('div[data-is-scrollable="true"][data-automation-id="contentScrollRegion"]');
  $contentRegion.removeClass("flex");
  //============================================================================================
  $spcontext.loadSPDependencies(
    function () {
      var dependenciesCount = 0;
      var expectedDepenciesCount = 7;
      // speedctxRoot = new Speed();
      globalDefinitions = new GlobalDefinitionsManager();

      globalDefinitions.callLoader();

      window.globalProp.getClientIP().then((response)=>{
        MainApplication.cachedState.ipaddress = response;
        checkAppDependency();
      }).catch((error)=>{
         checkAppDependency();
      })

      $spcontext.currentUserDetails((user) => {
        CurrentUserProperties.email = user.get_email();
        CurrentUserProperties.email = CurrentUserProperties.email.toLowerCase();
        CurrentUserProperties.login = CurrentUserProperties.email;
        CurrentUserProperties.title = user.get_title();

        var name = CurrentUserProperties.title.split(" ");
        var initials = "";
        try {
          initials += name[0].charAt(0);
          initials += name[1].charAt(0);
        } catch (e) { }

        $("#currentusername").text(CurrentUserProperties.title);
        //$("#userinitials").attr("title", CurrentUserProperties.title);
        checkAppDependency();
      });

      $spcontext.getItem("Configuration", $spcontext.camlBuilder(), function (configObjects) {
        var listEnumerator = configObjects.getEnumerator();
        while (listEnumerator.moveNext()) {
          var settingType = listEnumerator.get_current().get_item("SettingType");
          var configObj = {};
          configObj.title = listEnumerator.get_current().get_item("Title");
          configObj.setting = listEnumerator.get_current().get_item("Setting");
          if (settingType == "Restricted") {
            configPropertiesRoot.restrictedlinks.push(configObj);
          } else {
            configPropertiesRoot[configObj.title] = configObj;
          }
        }

        rsBAContext = new Speed(configPropertiesRoot.POPCONTEXT.setting);
        popContext = new Speed(configPropertiesRoot.REALPOPCONTEXT.setting);

        speedctxRoot = new Speed(configPropertiesRoot.AUDITMANAGEMENTURL.setting);
        commatrix = new Speed(configPropertiesRoot.COMMATRIXURL.setting);

        // testContext = new Speed("/sites");
        commatrix.errorHandler = globalDefinitions.errorHandler;

          commatrix.getItem("Configuration", commatrix.camlBuilder(), function (configObjects) {
            var listEnumerator = configObjects.getEnumerator();
            while (listEnumerator.moveNext()) {
              var settingType = listEnumerator.get_current().get_item("SettingType");
              var configObj = {};
              configObj.title = listEnumerator.get_current().get_item("Title");
              configObj.setting = listEnumerator.get_current().get_item("Setting");
              if (settingType == "Restricted") {
                configProperties.restrictedlinks.push(configObj);
              } else {
                configProperties[configObj.title] = configObj;
              }
            }

            globalDefinitions.stageDefinitions.workflowcode = configProperties.WORKFLOWCODE.setting;
            globalDefinitions.stageDefinitions.workflow = configProperties.WORKFLOWNAME.setting;

            $("#auditmanagementversion").text(configProperties.NCVERSION.setting);
            $("#versioneffectivedate").text(configProperties.VERSIONEFFECTIVEDATE.setting);
            $("#auditmanagementversionMobile").text(configProperties.NCVERSION.setting);
            $("#versioneffectivedateMobile").text(configProperties.VERSIONEFFECTIVEDATE.setting);

            checkAppDependency();
          });

          popContext.isUserMemberOfGroup(
            [
              configPropertiesRoot.MANAGEMENT.setting,
              configPropertiesRoot.CEO.setting,
              configPropertiesRoot.REPORTADMIN.setting,
              configPropertiesRoot.HOD.setting,
              configPropertiesRoot.COMMATRIX_ADMIN.setting
            ],
            { email : CurrentUserProperties.email, groupEmails: true },
            function(isUserMember, groupUserProperties){
                  MainApplication.isUserAnActor = isUserMember || false;
                  MainApplication.configuredTaskMembers = groupUserProperties || {};

                  const isInHOD = groupUserProperties[configPropertiesRoot.HOD.setting]?.belongs || false;
                  const isInManagement = groupUserProperties[configPropertiesRoot.MANAGEMENT.setting]?.belongs || false; // adjust key if needed
                  const isInCEO = groupUserProperties[configPropertiesRoot.CEO.setting]?.belongs || false; // adjust key
                  const isInReportAdmin = groupUserProperties[configPropertiesRoot.REPORTADMIN.setting]?.belongs || false; // adjust key
                  const isInCommatrixAdmin = groupUserProperties[configPropertiesRoot.COMMATRIX_ADMIN.setting]?.belongs || false;

                  MainApplication.isPureHOD = isInHOD && !isInManagement && !isInCEO && !isInReportAdmin && !isInCommatrixAdmin;
                  checkAppDependency();
              })

          popContext.isCurrentUserMemberOfGroup(configPropertiesRoot.REPORTADMIN.setting, function (isAdmin) {
              MainApplication.cachedState.isReportAdmin = isAdmin || false;
              checkAppDependency();
          });


          var basicQuery = [
                {
                    viewScope: 'RecursiveAll'
                }
            ];

          commatrix.getItem("ModeOfCommunication", commatrix.camlBuilder(basicQuery), function (_spMeta) {
              var listEnumerator = _spMeta.getEnumerator();
              MainApplication.modeOfCommunication = [];
              while (listEnumerator.moveNext()) {
                  var title = listEnumerator.get_current().get_item("Title");
                  MainApplication.modeOfCommunication.push(title);
              }
              checkAppDependency();
          })

          var employeeInfoColumns = [
            "ID",
            "Title",
            "EMAIL_x0020_ADDRESS",
            "DESIGNATION",
            "SUPERVISOR",
            "PERSONAL_x0020_NUMBER",
            "DEPARTMENT",
            "EID",
            "D_x002e_O_x002e_E_x0020__x002f__",
            "Job_x0020_Role",
            "Active",
            "HOD",
            "HOD_x0020_EMAIL"
        ];

        rsBAContext.getListToItems(
            "Staff List",
            [{
                orderby: "ID",
                ascending: "FALSE"
              },
              {
              operator: 'Eq',
              field: 'Active',
              type: 'Text',
              val: "Yes"
            }
            ],
            {
                ignoreThreshold: false,
                data: employeeInfoColumns,
                merge: false,
            },
            false,
            function (item) {
                // Transform item to use new field names
                const transformedItem = {
                    ID: item.ID || '',
                    Title: item.Title || '',
                    Email: item.EMAIL_x0020_ADDRESS || '',
                    Designation: item.DESIGNATION || '',
                    Supervisor: item.SUPERVISOR || '',
                    PersonalNumber: item.PERSONAL_x0020_NUMBER || '',
                    Department: item.DEPARTMENT || '',
                    EmployeeId: item.EID || '',
                    DateOfEmployment: item.D_x002e_O_x002e_E_x0020__x002f__ || '',
                    JobRole: item.Job_x0020_Role || '',
                    Active: item.Active || '',
                    Hod: item.HOD || '',
                    HodEmail: item.HOD_x0020_EMAIL || ''
                };

                if (transformedItem.Email !== "") {
                    if (typeof MainApplication.staffDetails[transformedItem.Email.toLowerCase()] === "undefined") {
                        MainApplication.staffDetails[transformedItem.Email.toLowerCase()] = transformedItem;
                        MainApplication.staffList.push(transformedItem);
                    }
                }

                return transformedItem;
            },
            function (items) {
                MainApplication.staffList = items;
                checkAppDependency();
            }
        );

      });

      

      function checkAppDependency() {
        dependenciesCount++;
        if (dependenciesCount === expectedDepenciesCount) {
          
          console.log("Dependency count: ", dependenciesCount);
          console.log("Expected Dependencies: ", expectedDepenciesCount);
          globalDefinitions.AuditLogManager_SaveLog({
            Action: `Logged into/Opened Audit Management application`,
            Message: `user logged in to application at ${$spcontext.stringnifyDate({ format: "dd/mm/yy", includeTime: true })}`
          });
          if (MainApplication.isUserAnActor){
            $(".reportNav").show();
            $(".reportNavMobile").show();
            $(".analyticsNav").show();
            $(".analyticsNavMobile").show();

            // $(".newNCNav").show();
            // $(".newNCNavMobile").show();
          }

          $spcontext.errorHandler = globalDefinitions.errorHandler;
          MainApplication.cachedState.mode = true;
          MainApplication.cachedState.pageStateCall();
        }
      }
    }
  );
}


MainApplication.reportSyncSearch = function (keyquery, data) {
  if (!keyquery || keyquery.trim().length < 3) {
    return data;
  }

  keyquery = keyquery.trim().toLowerCase();

  return data.filter(item =>
    item.EmployeeName?.toLowerCase().includes(keyquery) ||
    item.WorkflowRequestID?.toLowerCase().includes(keyquery) ||
    item.Title?.toLowerCase().includes(keyquery) ||
    item.EmployeeDivision?.toLowerCase().includes(keyquery) ||
    item.EmployeeEmail?.toLowerCase().includes(keyquery) ||
    item.Approval_Status?.toLowerCase().includes(keyquery) ||
    item.Current_Approver?.toLowerCase().includes(keyquery) ||
    item.Year?.toLowerCase().includes(keyquery) ||
    item.Division_Unit?.toLowerCase().includes(keyquery)
  );
};

MainApplication.renderCommunicationTemplatesReadOnly = function (dataArray) {
    const container = $('#communicationTemplatesContainer');
    // container.empty();

    if (!Array.isArray(dataArray)) return;

    dataArray.forEach((item, index) => {
        const templateId = `communicationTemplate_${Date.now()}_${index}`;

        // ---- Parse ModeOfCommunication ----
        let displayModes = [];

        if (Array.isArray(item.ModeOfCommunication)) {
            item.ModeOfCommunication.forEach(val => {
                if (val.toLowerCase().startsWith("other:")) {
                    displayModes.push(val); // Keep full text like "Other: Town Crier"
                } else {
                    displayModes.push(val);
                }
            });
        }

        // ---- Render Mode List HTML ----
        const modesHTML = displayModes.length
            ? displayModes.map(mode => `
                <span class="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                    ${mode}
                </span>
            `).join("")
            : `<span class="text-slate-400 italic text-sm">No mode selected</span>`;

        const templateHTML = `
            <section id="${templateId}" class="border border-gray-200 shadow-sm rounded mb-5">

                <!-- Accordion Header -->
                <div class="flex justify-between items-center bg-slate-100 px-4 py-3 cursor-pointer accordion-header">
                    <div class="flex gap-3">
                        <h2 class="text-lg font-bold text-navy-900 template-title">
                            ${index + 1}
                        </h2>

                        <p data-bind="ContributorName" class="text-lg font-bold text-navy-900">
                            ${item.ContributorName || ""}
                        </p>

                        <input type="hidden" data-bind="ContributorEmail" value="${item.ContributorEmail || ""}" />
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

                        ${MainApplication.renderReadOnlyInput("WhatToCommunicate", "What to Communicate:", item.WhatToCommunicate)}
                        ${MainApplication.renderReadOnlySelect("ComplianceObligation", "Compliance Obligation:", ["Yes","No"], item.ComplianceObligation)}
                        ${MainApplication.renderReadOnlyInput("WhenToCommunicate", "When to Communicate:", item.WhenToCommunicate)}
                        ${MainApplication.renderReadOnlyInput("Recipient", "Recipient:", item.Recipient)}
                        ${MainApplication.renderReadOnlySelect("Type", "Type:", ["Internal","External","Internal/External"], item.Type)}

                        <!-- Mode of Communication (Read Only List) -->
                        <div class="mt-2">
                            <label class="block text-sm font-medium text-blue-600 mb-2">Mode of Communication:</label>
                            <div class="flex flex-wrap gap-2 text-sm">
                                ${modesHTML}
                            </div>
                        </div>

                        ${MainApplication.renderReadOnlyInput("PrimaryResponsibility", "Primary Responsibility:", item.PrimaryResponsibility)}
                        ${MainApplication.renderReadOnlyInput("SecondaryResponsibility", "Secondary Responsibility:", item.SecondaryResponsibility)}

                    </div>
                </div>
            </section>
        `;

        container.append(templateHTML);
    });

};

MainApplication.renderCMTemplateForProcessAdmin = function (dataArray) {
    const container = $('#communicationTemplatesContainer');
    // container.empty();

    if (!Array.isArray(dataArray)) return;

    dataArray.forEach((item, index) => {
        const templateId = `communicationTemplate_${Date.now()}_${index}`;

        // ---- Parse ModeOfCommunication ----
        let displayModes = [];

        if (Array.isArray(item.ModeOfCommunication)) {
            item.ModeOfCommunication.forEach(val => {
                if (val.toLowerCase().startsWith("other:")) {
                    displayModes.push(val); // Keep full text like "Other: Town Crier"
                } else {
                    displayModes.push(val);
                }
            });
        }

        // ---- Render Mode List HTML ----
        const modesHTML = displayModes.length
            ? displayModes.map(mode => `
                <span class="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                    ${mode}
                </span>
            `).join("")
            : `<span class="text-slate-400 italic text-sm">No mode selected</span>`;

        const templateHTML = `
            <section id="${templateId}" class="border border-gray-200 shadow-sm rounded mb-5">

                <!-- Accordion Header -->
                <div class="flex justify-between items-center bg-slate-100 px-4 py-3 cursor-pointer accordion-header">
                    <div class="flex gap-3">
                        <h2 class="text-lg font-bold text-navy-900 template-title">
                            ${index + 1}
                        </h2>

                        <p data-bind="ContributorName" class="text-lg font-bold text-navy-900">
                            ${item.ContributorName || ""}
                        </p>

                        <input type="hidden" data-bind="ContributorEmail" value="${item.ContributorEmail || ""}" />
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

                        ${MainApplication.renderReadOnlyInput("WhatToCommunicate", "What to Communicate:", item.WhatToCommunicate)}
                        ${MainApplication.renderReadOnlySelect("ComplianceObligation", "Compliance Obligation:", ["Yes","No"], item.ComplianceObligation)}
                        ${MainApplication.renderReadOnlyInput("WhenToCommunicate", "When to Communicate:", item.WhenToCommunicate)}
                        ${MainApplication.renderReadOnlyInput("Recipient", "Recipient:", item.Recipient)}
                        ${MainApplication.renderReadOnlySelect("Type", "Type:", ["Internal","External","Internal/External"], item.Type)}

                        <!-- Mode of Communication (Read Only List) -->
                        <div class="mt-2">
                            <label class="block text-sm font-medium text-blue-600 mb-2">Mode of Communication:</label>
                            <div class="flex flex-wrap gap-2 text-sm">
                                ${modesHTML}
                            </div>
                        </div>

                        ${MainApplication.renderReadOnlyInput("PrimaryResponsibility", "Primary Responsibility:", item.PrimaryResponsibility)}
                        ${MainApplication.renderReadOnlyInput("SecondaryResponsibility", "Secondary Responsibility:", item.SecondaryResponsibility)}
                        ${MainApplication.renderEditableSelect(
                            "Status",
                            "Status:",
                            ["Conformance", "Non-Conformance", "Not Applicable"] || ""
                        )}

                    </div>
                </div>
            </section>
        `;

        container.append(templateHTML);
    });

};

MainApplication.renderReadOnlyInput = function (bind, label, value = "") {
    return `
        <div class="mt-2">
            <label class="block text-sm font-medium text-blue-600 mb-2">${label}</label>
            <input data-bind="${bind}" 
                   type="text"
                   value="${value || ""}"
                   readonly
                   class="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 text-slate-700 border border-gray-200 focus:outline-none text-sm sm:text-base" />
        </div>
    `;
};

MainApplication.renderReadOnlySelect = function (bind, label, options, selected) {
    return `
        <div class="mt-2">
            <label class="block text-sm font-medium text-blue-600 mb-2">${label}</label>
            <select data-bind="${bind}" 
                    disabled
                    class="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border border-gray-200 text-slate-700 appearance-none text-sm sm:text-base">
                ${options.map(opt => `
                    <option value="${opt}" ${opt === selected ? "selected" : ""}>${opt}</option>
                `).join("")}
            </select>
        </div>
    `;
};

MainApplication.renderEditableSelect = function (bind, label, options, selected) {
    return `
        <div class="mt-2">
            <label class="block text-sm font-medium text-blue-600 mb-2">${label}</label>
            <select data-bind="${bind}" speed-bind-validate='TempData' speed-validate-msg="Please select a status"
                    class="w-full px-3 sm:px-4 py-2 sm:py-3 appearance-none dropdown-arrow focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base">
                <option value="">Select Status</option>
                ${options.map(opt => `
                    <option value="${opt}" ${opt === selected ? "selected" : ""}>${opt}</option>
                `).join("")}
            </select>
        </div>
    `;
};

MainApplication.mergeStatusesIntoCMData = function (existingData) {

    if (!Array.isArray(existingData)) return existingData;

    $('#communicationTemplatesContainer section').each(function (index) {

        const selectedStatus = $(this)
            .find('[data-bind="Status"]')
            .val();

        // Merge into original array by index
        if (existingData[index]) {
            existingData[index].Status = selectedStatus || "";
        }

    });

    return existingData;
};

MainApplication.countStatusSummary = function (dataArray) {

    const summary = {
        conformance: 0,
        nonConformance: 0,
        notApplicable: 0,
        total: 0
    };

    if (!Array.isArray(dataArray)) return summary;

    dataArray.forEach(item => {

        switch (item.Status) {
            case "Conformance":
                summary.conformance++;
                summary.total++;
                break;

            case "Non-Conformance":
                summary.nonConformance++;
                summary.total++;
                break;

            case "Not Applicable":
                summary.notApplicable++;
                summary.total++;
                break;
        }

    });

    return summary;
};

whenLayoutLoaded();
