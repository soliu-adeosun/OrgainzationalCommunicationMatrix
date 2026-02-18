import * as React from 'react';
import Chart from 'chart.js/auto';
import { AnalyticLoader } from '../../../../Global/AnalyticLoader';
(window as any).Chart = Chart;
require("analytics");


export default class Analytics extends React.Component<{}, {}> {
    public render(): React.ReactElement {

        return (
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
                {/* Cards Section */}
                <section className="space-y-4">
                    <AnalyticLoader />
                    <div id="complianceDashboard" className="max-w-7xl mx-auto hidden">
                        {/* Organizational Overview */}
                        <section className="mb-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-navy-900 ">Organizational Compliance Overview</h2>
                                <select name="" id="filterYear" className="filter-select status-dropdown"></select>
                            </div>
                            
                            <div className="bg-white border rounded-xl shadow p-6 card">
                            <div className="h-80">
                                <canvas id="orgComplianceChart" />
                            </div>
                            <p className="text-center mt-4 text-gray-600">
                                Based on <strong id="orgTotalEntries">0</strong> total entries
                            </p>
                            </div>
                        </section>
                        {/* Division Cards */}
                        <section>
                            <h2 className="text-2xl font-bold text-navy-900 mb-6">Compliance by Division / Unit</h2>
                            <div id="divisionCards" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6" />
                        </section>
                    </div>

                </section>
            </div>
        );
    }

    public componentDidMount(): void {
        window.loadAnalyticsComponent();
    }
}
