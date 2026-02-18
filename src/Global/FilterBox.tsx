import * as React from "react";

import '../Assets/css/style.css';

export const FilterBox = () => {
    return (
        <>
            <div className="search-filter-container sort-box hidden">
                <div className="search-filter-header">
                    <h3 className="search-filter-title">Search Filter</h3>
                    <span id="closesearchfilter" className="close-filter-icon">X</span>
                </div>
                <div className="search-filter-grid">
                    <div className="filter-row">
                        <div className="filter-item">
                            <label className="filter-label" htmlFor="employeeName">Initiator Name</label>
                            <input type="text" id="employeeName" placeholder="Initiator Name" className="filter-input employee-name-input" speed-bind-query="EmployeeName" speed-operator="Contains" />
                        </div>
                        <div className="filter-item">
                            <label className="filter-label" htmlFor="nextApprover">Next Approver</label>
                            <input type="text" id="nextApprover" placeholder="Next Approver" className="filter-input reference-id-input" speed-bind-query="Current_Approver" speed-operator="Contains" />
                        </div>
                    </div>
                    <div className="filter-row">
                        <div className="filter-item">
                            <label className="filter-label" htmlFor="requeststrDate">Request Start Date</label>
                            <input type="date" id="requeststrDate" className="date-input start-date-input" />
                        </div>
                        <div className="filter-item">
                            <label className="filter-label" htmlFor="requestendDate">Request End Date</label>
                            <input type="date" id="requestendDate" className="date-input end-date-input" />
                        </div>
                    </div>
                </div>
                {/* <button id="searchbtn" className="search-button">Search</button> */}
            </div>
        </>
    );
};