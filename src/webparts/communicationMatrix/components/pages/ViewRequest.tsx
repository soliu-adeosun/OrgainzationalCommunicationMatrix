import { Link } from "react-router-dom";
import * as React from "react";
require("viewrequest");

export default class ViewRequest extends React.Component<{}, {}> {
    public render(): React.ReactElement {
        return (
            <section className="bg-white p-4 sm:p-6 border border-gray-200 shadow-sm">
                <div id="communicationTemplatesContainer" className="space-y-6" />

                <div id="statusSection" style={{ marginTop: "2rem" }} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 hidden">
                    <div className="mt-2">
                        <label className="block text-sm font-medium text-blue-600 mb-2">Update Status:</label>
                        <select id="statusSelect" className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base">
                            <option value="">Select status</option>
                            <option value="Compliance">Compliance</option>
                            <option value="Non-Compliance">Non-Compliance</option>
                            <option value="Not Applicable">Not Applicable</option>
                        </select>
                    </div>
                    <div className="mt-2">
                        <label className="block text-sm font-medium text-blue-600 mb-2">Status:</label>
                        <input speed-bind='Status' id="currentStatus" readOnly type="text" className="w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm sm:text-base" />
                    </div>
                </div>

                <div className="action-btns flex justify-center items-center gap-3" style={{ marginTop: "2rem" }}>                    
                    <Link to="/" className="px-4 py-2 bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
                        Cancel
                    </Link>
                </div>

                <div className="row mt-3">
                    <h3>Audit Trail</h3>
                    <table className="w-full table-mobile">
                        <thead className="border-b border-gray-200">
                            <tr>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider" scope="col">Name</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider" scope="col">Stage</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider" scope="col">Action</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider" scope="col">Comment</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider" scope="col">Action Time</th>
                            </tr>
                        </thead>
                        <tbody id="logs">

                        </tbody>
                    </table>
                </div>

            </section>
        );
    }

    public componentDidMount(): void {
        window.loadViewRequestComponent();
    }
}
