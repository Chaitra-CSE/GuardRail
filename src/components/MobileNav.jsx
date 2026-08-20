import React from 'react';
import { NavLink, useLocation } from '../router/index.jsx';
import { LayoutDashboard, Sliders, Bot, ArrowLeftRight, LineChart, ScrollText } from 'lucide-react';

const MobileNav = () => {
    const location = useLocation();

    const items = [
        { label: 'Dashboard', to: '/', icon: LayoutDashboard },
        { label: 'Policies', to: '/policies', icon: Sliders },
        { label: 'Agent', to: '/agent-commerce', icon: Bot },
        { label: 'Txs', to: '/transactions', icon: ArrowLeftRight },
        { label: 'Insights', to: '/insights', icon: LineChart },
        { label: 'Audit', to: '/audit', icon: ScrollText },
    ];

    return (
        <nav
            aria-label="Mobile Navigation"
            className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-1 py-2 border-t border-white/10 bg-[#070B14]/95 backdrop-blur-xl"
        >
            {items.map((item) => {
                const Icon = item.icon;
                const isActive = item.to === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.to);

                return (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[9px] font-medium transition-colors ${
                            isActive ? 'text-[#5B8CFF]' : 'text-[#64748B] hover:text-[#94A3B8]'
                        }`}
                    >
                        <Icon size={16} />
                        <span>{item.label}</span>
                    </NavLink>
                );
            })}
        </nav>
    );
};

export default MobileNav;
