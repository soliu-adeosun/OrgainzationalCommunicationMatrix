import * as React from "react";
import { Link, useLocation } from "react-router-dom";

const GlobalSideNav: React.FC = () => {
    const location = useLocation();
    const [activeLink, setActiveLink] = React.useState(location.pathname || '/');

    // Update activeLink whenever the location changes
    React.useEffect(() => {
        setActiveLink(location.pathname);
    }, [location.pathname]);

    const handleSetActiveLink = (link: string) => {
        setActiveLink(link);
    };

    return (
        <>
            {/* Desktop Sidebar - Only show on xl screens (1280px+) */}
            <div className="hidden xl:block w-72 sidebar-gradient relative overflow-hidden">
                {/* Diagonal Lines Pattern Overlay */}
                <div className="absolute inset-0 diagonal-lines-pattern" />
                <div className="relative z-10">
                    <div className="p-6 border-b border-slate-600">
                        <div className="flex gap-3 items-center mb-3">
                            <img
                                src={require("../Assets/img/rslogo_mono.png")}
                                style={{ marginLeft: '-10px', maxWidth: '100%' }}
                                alt="logo"
                            />
                            <h2 className="text-xl font-bold text-white">
                                Organizational Communication Matrix
                            </h2>
                        </div>
                        <h2 className="text-xl font-semibold text-white">
                            OCM Revision: <span id="auditmanagementversion"></span>
                        </h2>
                        <h2 className="text-lg font-semibold text-white">
                            Effective Date: <span id="versioneffectivedate"></span>
                        </h2>
                    </div>
                    <nav className="mt-2" id="desktop-nav">
                        <div className="relative">
                            {activeLink === '/' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
                            <Link
                                to="/"
                                onClick={() => handleSetActiveLink('/')}
                                className={`w-full flex items-center px-6 py-4 text-left transition-all duration-200 hover:bg-slate-600 ${
                                    activeLink === '/' ? 'bg-slate-600 text-white border-r-2 border-red-500' : 'text-slate-300 hover:text-white'
                                }`}
                            >
                                <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                                    />
                                </svg>
                                <span className="font-medium">Dashboard</span>
                            </Link>
                        </div>
                        <div className="relative newNCNav">
                            {activeLink === '/newrequest' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
                            <Link
                                to="/newrequest"
                                onClick={() => handleSetActiveLink('/newrequest')}
                                className={`w-full flex items-center px-6 py-4 text-left transition-all duration-200 hover:bg-slate-600 ${
                                    activeLink === '/newrequest' ? 'bg-slate-600 text-white border-r-2 border-red-500' : 'text-slate-300 hover:text-white'
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
                            {activeLink === '/approverequest' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
                            <div
                                className={`w-full flex items-center px-6 py-4 text-left transition-all duration-200 hover:bg-slate-600 ${
                                    activeLink === '/approverequest' ? 'bg-slate-600 text-white border-r-2 border-red-500' : 'text-slate-300 hover:text-white'
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
                            {activeLink === '/viewrequest' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
                            <div
                                className={`w-full flex items-center px-6 py-4 text-left transition-all duration-200 hover:bg-slate-600 ${
                                    activeLink === '/viewrequest' ? 'bg-slate-600 text-white border-r-2 border-red-500' : 'text-slate-300 hover:text-white'
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

                        <div className="relative reportNav hidden">
                            {activeLink === '/report' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
                            <Link
                                to="/report"
                                onClick={() => handleSetActiveLink('/report')}
                                className={`w-full flex items-center px-6 py-4 text-left transition-all duration-200 hover:bg-slate-600 ${
                                    activeLink === '/report' ? 'bg-slate-600 text-white border-r-2 border-red-500' : 'text-slate-300 hover:text-white'
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
                    </nav>
                </div>
            </div>
        </>
    );
};

export default GlobalSideNav;