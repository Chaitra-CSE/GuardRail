import React from 'react';
import { Link, useLocation } from '../router/index.jsx';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_NAMES = {
    '/': 'Dashboard',
    '/policies': 'Policies',
    '/agent-commerce': 'Agent Commerce',
    '/transactions': 'Transactions',
    '/insights': 'Commerce Intelligence',
    '/audit': 'Audit Log',
};

const Breadcrumbs = ({ extraPath }) => {
    const location = useLocation();
    const currentPath = location.pathname;

    if (currentPath === '/') return null;

    const pageName = ROUTE_NAMES[currentPath] || 'Section';

    return (
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-[12px] text-[#64748B]">
            <Link
                to="/"
                className="flex items-center gap-1 transition-colors hover:text-[#F8FAFC]"
            >
                <Home size={12} />
                <span>Dashboard</span>
            </Link>
            <ChevronRight size={12} className="opacity-40" />
            <span className="text-[#94A3B8] font-medium">{pageName}</span>
            {extraPath && (
                <>
                    <ChevronRight size={12} className="opacity-40" />
                    <span className="text-[#F8FAFC] font-medium">{extraPath}</span>
                </>
            )}
        </nav>
    );
};

export default Breadcrumbs;
