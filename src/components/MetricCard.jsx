import React from 'react';

const MetricCard = ({ title, value, icon, subtitle, children }) => {
    return (
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 card-shadow flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3 text-[#64748b]">
                {icon}
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">{title}</h3>
            </div>
            <div>
                <div className="text-2xl font-bold text-[#0f172a] tracking-tight">{value}</div>
                {subtitle && <div className="text-[13px] font-medium text-[#64748b] mt-0.5">{subtitle}</div>}
            </div>
            {children && <div className="mt-4">{children}</div>}
        </div>
    );
};

export default MetricCard;
