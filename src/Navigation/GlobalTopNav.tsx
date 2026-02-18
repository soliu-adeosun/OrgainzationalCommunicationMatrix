import * as React from "react";
import { Link, useLocation } from "react-router-dom";

const GlobalTopNav: React.FC = () => {
    // State for the mobile menu's open/closed status
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    // Get the current location object for tracking the active link
    const location = useLocation();

    // The active path is determined directly from the URL
    const activePath = location.pathname;

    // Toggle the mobile menu state
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(prevState => !prevState);
    };

    // Close the mobile menu. This is used when a link is clicked.
    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            {/* Top Navigation Bar */}
            <header className="h-16 bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 flex items-center justify-between shadow-sm relative z-30">
                <div className="flex items-center space-x-2 sm:space-x-4">
                    {/* Hamburger Menu Button - Show on all screens except xl+ */}
                    <button
                        className="xl:hidden text-slate-600 hover:text-slate-800 transition-colors p-1"
                        onClick={toggleMobileMenu}
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                    >
                        <svg
                            id="menu-icon"
                            className={`w-6 h-6 ${isMobileMenuOpen ? "hidden" : "block"}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        <svg
                            id="close-icon"
                            className={`w-6 h-6 ${isMobileMenuOpen ? "block" : "hidden"}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <h1 className="text-base sm:text-lg md:text-xl font-semibold text-slate-800 truncate">
                        {/* Title placeholder */}
                    </h1>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
                    <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 pl-2 md:pl-4 border-l border-gray-200">
                        <div className="flex items-center justify-center">
                            <span className="text-sm font-medium text-slate-800" id="currentusername" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Dropdown - Show on all screens except xl+ */}
            <div
                id="mobile-menu"
                className={`xl:hidden sidebar-gradient border-b border-slate-600 transition-all duration-300 ease-in-out overflow-hidden relative z-20 ${
                    isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                {/* Diagonal Lines Pattern Overlay for Mobile Menu */}
                <div className="absolute inset-0 diagonal-lines-pattern" />
                <div className="relative z-10">
                    {/* Mobile Menu Header */}
                    <div className="px-4 sm:px-6 py-4 border-b border-slate-600">
                        <div className="flex gap-3 items-center">
                            <img src={require("../Assets/img/rslogo_mono.png")} style={{ marginLeft: "-10px", maxWidth: "100%" }} id="companylogo" alt="Company logo" />
                            <h2 className="text-xl font-semibold text-white">OCM Revision: <span id="auditmanagementversionMobile"></span></h2>
                        </div>
                        <h2 className="text-lg font-semibold text-white">Effective Date: <span id="versioneffectivedateMobile"></span></h2>
                    </div>
                    {/* Mobile Navigation */}
                    <nav className="py-2" id="mobile-nav">
                        <div className="relative">
                            {activePath === "/" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
                            <Link
                                to="/"
                                onClick={closeMobileMenu}
                                className={`w-full flex items-center px-6 py-4 text-left transition-all duration-200 hover:bg-slate-600 ${
                                    activePath === "/" ? "bg-slate-600 text-white border-r-2 border-red-500" : "text-slate-300 hover:text-white"
                                }`}
                            >
                                <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                </svg>
                                <span className="font-medium">Dashboard</span>
                            </Link>
                        </div>
                        <div className="relative newNCNavMobile">
                            {activePath === "/newrequest" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
                            <Link
                                to="/newrequest"
                                onClick={closeMobileMenu}
                                className={`w-full flex items-center px-6 py-4 text-left transition-all duration-200 hover:bg-slate-600 ${
                                    activePath === "/newrequest" ? "bg-slate-600 text-white border-r-2 border-red-500" : "text-slate-300 hover:text-white"
                                }`}
                            >
                                <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                <span className="font-medium">New Request</span>
                            </Link>
                        </div>
                        <div className="relative cursor-not-allowed hidden">
                            {activePath === "/approverequest" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
                            <div
                                className={`w-full flex items-center px-6 py-4 text-left transition-all duration-200 hover:bg-slate-600 ${
                                    activePath === "/approverequest" ? "bg-slate-600 text-white border-r-2 border-red-500" : "text-slate-300 hover:text-white"
                                }`}
                            >
                                <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </svg>
                                <span className="font-medium">Approval</span>
                            </div>
                        </div>
                        <div className="relative cursor-not-allowed hidden">
                            {activePath === "/viewrequest" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
                            <div
                                className={`w-full flex items-center px-6 py-4 text-left transition-all duration-200 hover:bg-slate-600 ${
                                    activePath === "/viewrequest" ? "bg-slate-600 text-white border-r-2 border-red-500" : "text-slate-300 hover:text-white"
                                }`}
                            >
                                <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </svg>
                                <span className="font-medium">View</span>
                            </div>
                        </div>

                        <div className="relative reportNavMobile hidden">
                            {activePath === "/report" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
                            <Link
                                to="/report"
                                onClick={closeMobileMenu}
                                className={`w-full flex items-center px-6 py-4 text-left transition-all duration-200 hover:bg-slate-600 ${
                                    activePath === "/report" ? "bg-slate-600 text-white border-r-2 border-red-500" : "text-slate-300 hover:text-white"
                                }`}
                            >
                                <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </svg>
                                <span className="font-medium">Report</span>
                            </Link>
                        </div>
                        <div className="relative analyticsNavMobile hidden">
                            {activePath === "/analytics" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
                            <Link
                                to="/analytics"
                                onClick={closeMobileMenu}
                                className={`w-full flex items-center px-6 py-4 text-left transition-all duration-200 hover:bg-slate-600 ${
                                    activePath === "/analytics" ? "bg-slate-600 text-white border-r-2 border-red-500" : "text-slate-300 hover:text-white"
                                }`}
                            >
                                <svg className="w-5 h-5 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
                                </svg>
                                <span className="font-medium">Analytics</span>
                            </Link>
                        </div>
                    </nav>
                </div>
            </div>
        </>
    );
};

export default GlobalTopNav;
