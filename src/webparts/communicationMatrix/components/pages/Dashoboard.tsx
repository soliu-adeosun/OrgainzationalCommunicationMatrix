import * as React from 'react';
import AuditCardSkeleton from '../../../../Global/AuditCardSkeleton';
require("dashboard");


export default class Dashboard extends React.Component<{}, {}> {
    public render(): React.ReactElement {

        return (
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
                {/* Cards Section */}
                <div id='dashboardCards'>
                    <AuditCardSkeleton />
                </div>


                {/* Data Table Section */}
                <section className="bg-white border border-gray-200 shadow-sm">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-navy-900">Organizational Communication Matrix</h2>
                                <p className="text-sm text-blue-500 mt-1">Manage and track all your request</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <div className="relative search-bar">
                                    <svg className="absolute left-3 transform -translate-y-1/2 w-4 h-4 text-slate-400"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                    <input id='reportsearchfield' type="text" placeholder="Search..."
                                        className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                                </div>
                                <a href='#/newrequest' className="flex items-center justify-center px-3 sm:px-4 py-2 bg-slate-700 text-white text-sm font-medium hover:bg-slate-800 transition-colors issue-new-nc-btn">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    New Request
                                </a>
                            </div>
                        </div>
                    </div>


                    <div>
                        <div id='dashboard-tabs' />
                        {/* Panels */}

                        <div className="overflow-x-auto">
                            <div className="norequest hidden text-center py-6 text-gray-500 text-sm sm:text-base">
                                No Requests...
                            </div>
                            <table className="w-full hidden table-mobile" id="tasktable">
                                <thead className="border-b border-gray-200">
                                    <tr>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider">S/N</th>
                                        <th speed-table-data="WorkflowRequestID" className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider">REF ID</th>
                                        <th speed-table-data="Division_Unit" className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider">DIVISION/UNIT</th>
                                        <th speed-table-data="Approval_Status" className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider">STATUS</th>
                                        <th speed-table-data="Current_Approver" className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider">NEXT APPROVER</th>
                                        <th speed-table-data="Modified" className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider">MODIFIED</th>
                                        <th speed-table-data="Created" className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200" id="speed-data-table" />

                            </table>
                            <div>
                                <ul id="myrequestpagination" className="pagination">
                                </ul>
                            </div>
                        </div>

                    </div>




                </section>
            </div>
        );
    }

    public componentDidMount(): void {
        window.loadDashboardComponent();
    }
}
