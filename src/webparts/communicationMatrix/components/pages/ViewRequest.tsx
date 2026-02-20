import { Link } from "react-router-dom";
import * as React from "react";
import ClientButton from "../../../../Global/ClientButton";
require("viewrequest");

export default class ViewRequest extends React.Component<{}, {}> {
    public render(): React.ReactElement {
        return (
            <section className="bg-white p-4 sm:p-6 border border-gray-200 shadow-sm">
                <div id="communicationTemplatesContainer" className="space-y-6" />


                <div className="action-btns flex justify-center items-center gap-3" style={{ marginTop: "2rem" }}>
                    <ClientButton text={"Update"} func={"MainApplication.ViewRequestComponent.updateStatus"} clax={"px-4 py-2 text-sm font-medium update-button submit-button hidden"} prop="ViewRequest" attr="" />                  
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
