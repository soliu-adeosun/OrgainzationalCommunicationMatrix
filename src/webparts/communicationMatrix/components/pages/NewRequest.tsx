import * as React from "react";
import { Link } from "react-router-dom";
import ClientButton from "../../../../Global/ClientButton";
require("newrequest");

export default class NewRequest extends React.Component<{}, {}> {
	public render(): React.ReactElement {
		return (
			<section className="bg-white p-4 sm:p-6 border border-gray-200 shadow-sm">
				{/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
					<div className="mt-2">
						<label className="block text-sm font-medium text-blue-600 mb-2">Division/Unit</label>
						<input type="text" readOnly id="division" className="w-full px-3 sm:px-4 py-2 sm:py-3  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none bg-no-repeat bg-right pr-8 sm:pr-10 text-sm sm:text-base" />
					</div>
				</div> */}

			<div id="communicationTemplatesContainer" className="space-y-6">
				{/* Empty state – shown when no templates */}
				<div id="emptyState" className="flex flex-col items-center justify-center py-4 px-4 text-center bg-white border-2 border-dashed border-slate-300 rounded-xl shadow-sm min-h-[300px]">
					<svg className="w-16 h-16 text-slate-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
					<h3 className="text-xl font-semibold text-slate-800 mb-3">
					No Communication Templates Yet
					</h3>
					<p className="text-slate-500 mb-8 max-w-md">
					Get started by adding your first communication template. This helps outline what, when, how, and to whom you need to communicate for compliance.
					</p>
					<button id="addFirstTemplateBtn" className="px-4 py-2 bg-slate-700 text-white text-sm font-medium hover:bg-slate-800 transition-colors">
					<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
					</svg>
					Add Entry
					</button>
				</div>
				{/* Dynamically added sections will go here */}
			</div>

			<button id="addCommunicationTemplateBtn" className="hidden px-4 py-2 bg-slate-700 text-white text-sm font-medium hover:bg-slate-800 transition-colors">
				Add Entry
			</button>

				<div style={{ marginTop: "2.2rem" }} className="hidden" id="commentBox">
					<div>
						<label className="block text-sm font-medium text-blue-600 mb-2">Comment</label>
						<textarea
							speed-bind="Comment"
							speed-include-control="false"
							speed-as-static="true"
							speed-validate-type="Comment"
							speed-event-switch="false"
							placeholder="Enter text here..."
							className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base"
							defaultValue={""}
							readOnly
						/>
					</div>
				</div>

				<div style={{ marginTop: '2rem' }} className="hidden checkboxcontainer">
					<label className="flex items-center space-x-3">
						<input id="checkbox" type="checkbox" className="w-4 h-4 text-red-500 border-gray-300 focus:ring-red-500" />
						<span className="text-lg text-red-500 font-medium">Only check this box when all required contributors from your Division/Unit have completed the form and it is fully ready for approval. <b/>
							Otherwise, click "Save" to register your own entry.
						</span>
					</label>
				</div>

				<div className="action-btns hidden flex justify-center items-center gap-3" style={{ marginTop: "2rem" }}>
					<ClientButton text={"Submit"} func={"MainApplication.NewRequestComponent.confirmSubmit"} clax={"px-4 py-2 text-sm font-medium submit-button"} prop="NewRequest" attr="" />
					<ClientButton text={"Save"} func={"MainApplication.NewRequestComponent.confirmSubmit"} clax={"px-4 py-2 bg-slate-500 text-white text-sm font-medium hover:bg-slate-600 transition-colors"} prop="Draft" attr="id='draftbtn'" />
					<Link to="/" className="px-4 py-2 bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
						Cancel
					</Link>
				</div>
			</section>
		);
	}

	public componentDidMount(): void {
		window.loadNewRequestComponent();
	}
}
