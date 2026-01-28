import { Link } from "react-router-dom";
import ClientButton from "../../../../Global/ClientButton";
import * as React from "react";
require("approverequest");

export default class ApproveRequest extends React.Component<{}, {}> {
	public render(): React.ReactElement {
		return (
			<section className="bg-white p-4 sm:p-6 border border-gray-200 shadow-sm">
				<div id="communicationTemplatesContainer" className="space-y-6" />

				<div id="actorSection" />

				<div id="commentBox">
					<div>
						<label className="block text-sm font-medium text-blue-600 mb-2">Comment</label>
						<textarea
							id="approvercomment"
							speed-bind-validate="Comment"
							speed-include-control="false"
							speed-as-static="true"
							speed-validate-type="Comment"
							speed-event-switch="false"
							speed-validate-msg="Please tell us why you want to decline the RDC!"
							placeholder="Enter text here..."
							className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base"
							defaultValue={""}
						/>
					</div>
				</div>

				<div className="action-btns flex justify-center items-center gap-3" style={{ marginTop: "2rem" }}>
					<ClientButton text={"Approve"} func={"MainApplication.ApproveRequestComponent.confirmSubmit"} clax={"px-4 py-2 bg-slate-700 text-white text-sm font-medium hover:bg-slate-800 transition-colors approver-btn"} prop="Approved" attr="" />

					<ClientButton text={"Decline"} func={"MainApplication.ApproveRequestComponent.confirmSubmit"} clax={"px-4 py-2 bg-slate-500 text-white text-sm font-medium hover:bg-slate-600 transition-colors "} prop="Declined" attr="id='rtnBtn'" />
					<Link to="/" className="px-4 py-2 bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
						Cancel
					</Link>
				</div>

				<div className="row mt-3">
					<h3>Audit Trail</h3>
					<table className="w-full table-mobile">
						<thead className="border-b border-gray-200">
							<tr>
								<th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider" scope="col">
									Name
								</th>
								<th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider" scope="col">
									Stage
								</th>
								<th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider" scope="col">
									Action
								</th>
								<th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider" scope="col">
									Comment
								</th>
								<th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider" scope="col">
									Action Time
								</th>
							</tr>
						</thead>
						<tbody id="logs"></tbody>
					</table>
				</div>
			</section>
		);
	}

	public componentDidMount(): void {
		window.loadApproveRequestComponent();
	}
}
