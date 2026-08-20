import React, { useContext, useEffect, useState } from 'react';
import { GuardRailContext } from '../context/GuardRailContext.jsx';
import { NavLink, Link, useLocation } from '../router/index.jsx';
import {
    ShieldCheck,
    LayoutDashboard,
    Sliders,
    Bot,
    ArrowLeftRight,
    LineChart,
    ScrollText,
    Menu,
    X,
    Sparkles
} from 'lucide-react';

const NAV_ITEMS = [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    { label: 'Policies', to: '/policies', icon: Sliders },
    { label: 'Agent Commerce', to: '/agent-commerce', icon: Bot, isNew: true },
    { label: 'Transactions', to: '/transactions', icon: ArrowLeftRight },
    { label: 'Insights', to: '/insights', icon: LineChart },
    { label: 'Audit Log', to: '/audit', icon: ScrollText },
];

const Header = () => {
    const { agentRevoked = false, policy = {} } = useContext(GuardRailContext) || {};
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    return (
        <header
            className="sticky top-0 z-40 w-full transition-all duration-300"
            style={{
                background: scrolled || mobileOpen
                    ? 'rgba(7, 11, 20, 0.94)'
                    : 'rgba(7, 11, 20, 0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.5)' : 'none',
            }}
        >
            <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-4 sm:px-6">
                {/* Brand Logo & Positioning */}
                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-3 group focus:outline-none">
                        <div
                            className="flex h-8 w-8 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                            style={{
                                background: 'linear-gradient(135deg, #5B8CFF 0%, #8B5CF6 100%)',
                                boxShadow: '0 0 16px rgba(91,140,255,0.4)',
                            }}
                        >
                            <ShieldCheck size={18} color="white" strokeWidth={2.5} />
                        </div>
                        <span className="text-[17px] font-bold text-[#F8FAFC] tracking-tight">
                            GuardRail
                        </span>
                    </Link>

                    {/* Desktop Navigation (6 Routes) */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isActive = item.to === '/'
                                ? location.pathname === '/'
                                : location.pathname.startsWith(item.to);

                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                                        isActive
                                            ? 'text-[#F8FAFC] bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                                            : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.04]'
                                    }`}
                                >
                                    <Icon size={14} className={isActive ? 'text-[#5B8CFF]' : 'opacity-60'} />
                                    <span>{item.label}</span>
                                    {item.isNew && (
                                        <span className="text-[9px] font-bold px-1 rounded bg-[#8B5CF6]/30 text-[#C4B5FD] border border-[#8B5CF6]/40">AI</span>
                                    )}
                                    {isActive && (
                                        <span
                                            className="absolute bottom-0 left-2.5 right-2.5 h-[2px] rounded-full"
                                            style={{
                                                background: 'linear-gradient(90deg, #5B8CFF 0%, #8B5CF6 100%)',
                                                boxShadow: '0 0 8px #5B8CFF',
                                            }}
                                        />
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                {/* Right Actions & Status */}
                <div className="flex items-center gap-3">
                    <Link
                        to="/agent-commerce"
                        className="hidden sm:flex items-center gap-2 rounded-full px-3.5 py-1.5 transition-all hover:bg-white/10"
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.08)',
                        }}
                    >
                        <span
                            className="status-dot"
                            style={agentRevoked
                                ? { background: '#EF4444', boxShadow: '0 0 8px rgba(239,68,68,0.7)' }
                                : { background: '#22C55E', boxShadow: '0 0 8px rgba(34,197,94,0.7)', animation: 'pulse-green 2.5s ease-in-out infinite' }
                            }
                        />
                        <span className="text-[12px] text-[#94A3B8] font-medium">
                            {agentRevoked ? 'Agent Suspended' : 'Agent Ready'}
                        </span>
                    </Link>

                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-[#94A3B8] hover:text-white"
                        aria-label="Toggle navigation menu"
                    >
                        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            {mobileOpen && (
                <div className="lg:hidden border-t border-white/10 px-4 py-3 bg-[#070B14] space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.to === '/'
                            ? location.pathname === '/'
                            : location.pathname.startsWith(item.to);

                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[14px] font-medium ${
                                    isActive
                                        ? 'text-white bg-white/10'
                                        : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon size={16} className={isActive ? 'text-[#5B8CFF]' : ''} />
                                    <span>{item.label}</span>
                                </div>
                                {item.isNew && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#8B5CF6]/30 text-[#C4B5FD] border border-[#8B5CF6]/40">AI</span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            )}
        </header>
    );
};

export default Header;