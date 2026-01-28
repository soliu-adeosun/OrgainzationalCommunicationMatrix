import * as React from 'react';
import { FilterBox } from '../../../../Global/FilterBox';
require("report");


export default class Report extends React.Component<{}, {}> {
    public render(): React.ReactElement {

        return (
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
                {/* Cards Section */}
                <section className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                        <div className="border card audit border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-center">
                                <h3 id='totalAudit' className="text-base sm:text-lg font-semibold text-navy-900 flex-1 mr-2">0</h3>
                                <h3 className="text-base sm:text-lg font-semibold text-navy-900 flex-1 mr-2">
                                    Total Request
                                </h3>
                            </div>
                        </div>
                        <div className="border card pending border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-center">
                                <h3 id='pendingAudit' className="text-base sm:text-lg font-semibold text-navy-900 flex-1 mr-2">0</h3>
                                <h3 className="text-base sm:text-lg font-semibold text-navy-900 flex-1 mr-2">
                                    Pending
                                </h3>
                            </div>
                        </div>
                        <div className="border card completed border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-center">
                                <h3 id='completedAudit' className="text-base sm:text-lg font-semibold text-navy-900 flex-1 mr-2">0</h3>
                                <h3 className="text-base sm:text-lg font-semibold text-navy-900 flex-1 mr-2">
                                    Completed
                                </h3>
                            </div>
                        </div>
                    </div>
                </section>
                {/* <section className="flex btn-action">
                    <button className="px-4 py-2 bg-slate-700 text-white text-sm font-medium hover:bg-slate-800 transition-colors">
                        Create
                    </button>
                </section> */}
                {/* Data Table Section */}
                <section className="bg-white border border-gray-200 shadow-sm">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-navy-900">Report</h2>
                                <p className="text-sm text-blue-500 mt-1">Manage and track all request</p>
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
                                <button id="filter-btn" className="flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 text-blue-500 text-sm font-medium hover:bg-gray-50 transition-colors">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    Filter
                                </button>

                                <button id="exportbtn" className="flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 text-blue-500 text-sm font-medium hover:bg-gray-50 transition-colors">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Export
                                </button>
                            </div>
                        </div>
                        <FilterBox />

                    </div>


                    <div>
                        {/* Panels */}

                        <div className="overflow-x-auto">
                            <div className="norequest hidden text-center py-6 text-gray-500 text-sm sm:text-base">
                                No requests...
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
        window.loadReportComponent();
    }
}
