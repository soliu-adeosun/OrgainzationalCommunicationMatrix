import * as React from "react";

import '../Assets/css/analoader.css';

export const AnalyticLoader = () => {
    return (
        <>
            <div id="analyticsSkeleton">
                {/* Top Card */}
                <div className="card skeleton-card">
                    <div className="skeleton skeleton-title" />
                    <div className="skeleton skeleton-donut large" />
                    <div className="skeleton skeleton-legend" />
                    <div className="skeleton skeleton-legend small" />
                </div>
                {/* Division Section Title */}
                <div className="skeleton skeleton-section-title" />
                {/* Division Cards */}
                <div className="division-grid">
                    <div className="card skeleton-card">
                    <div className="skeleton skeleton-title small" />
                    <div className="skeleton skeleton-donut medium" />
                    </div>
                    <div className="card skeleton-card">
                    <div className="skeleton skeleton-title small" />
                    <div className="skeleton skeleton-donut medium" />
                    </div>
                    <div className="card skeleton-card">
                    <div className="skeleton skeleton-title small" />
                    <div className="skeleton skeleton-donut medium" />
                    </div>
                </div>
            </div>


        </>
    );
};