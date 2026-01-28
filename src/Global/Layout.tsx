import * as React from "react";

import {Outlet} from "react-router";
import GlobalSideNav from "../Navigation/GlobalSideNav";
import GlobalTopNav from "../Navigation/GlobalTopNav";
import "notyf/notyf.min.css";
import Modal from "../Modals/Modal";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "bootstrap/dist/css/bootstrap.min.css";

import "../Assets/css/style.css";
import "../Assets/css/dashboard.css";
import '../Assets/css/sharepointuifix.css';

require("speedpoint_core");
require("workflowengine");
require("global");
require("notyf");
require("jQueryUI");
require("globalext");

export const Layout = () => {
    return (
        <>
            <div className="min-h-screen bg-gray-50 lg:flex">
                {/* side global navigation */}
                <GlobalSideNav />
                <div className="flex-1 flex flex-col">
                    {/* side global navigation */}
                    <GlobalTopNav />
                    {/* Main Content */}
                    <main className="flex-1 overflow-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
            <Modal />
        </>
    );
};
