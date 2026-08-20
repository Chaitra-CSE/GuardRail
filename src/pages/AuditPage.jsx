import React, { useContext, useState, useMemo } from 'react';
import { GuardRailContext } from '../context/GuardRailContext.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import AuditDrawer from '../components/AuditDrawer.jsx';
import { formatTime } from '../utils/helpers.js';
import {
    ScrollText,
    Search,
    Filter,
    Shield,
    Sliders,
    Bot,
    ArrowLeftRight,
    Lock,
    User,
    Check,
    X,
    AlertTriangle,
    Clock,
    ChevronRight
} from 'lucide-react';

const CATEGORY_CONFIG = {
    all: { label: 'All Events', icon: ScrollText },
    policy: { label: 'Policy Changes', icon: Sliders },
    agent: { label: 'Agent Actions', icon: Bot },
    transaction: { label: 'Transactions', icon: ArrowLeftRight },
    access: { label: 'Security & Access', icon: Lock },
};

const AuditPage = () => {
    const { auditEvents = [] } = useContext(GuardRailContext) || {};
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedEvent, setSelectedEvent] = useState(null);

    const filteredEvents = useMemo(() => {
        return (auditEvents || []).filter(event => {
            // Category filter
            if (selectedCategory !== 'all') {
                if (selectedCategory === 'agent' && event.type !== 'agent') return false;
                if (selectedCategory === 'policy' && event.type !== 'policy') return false;
                if (selectedCategory === 'transaction' && event.type !== 'transaction') return false;
                if (selectedCategory === 'access' && event.type !== 'access') return false;
            }

            // Search query
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const titleMatch = event.title?.toLowerCase().includes(q);
                const descMatch = event.description?.toLowerCase().includes(q);
                const actorMatch = event.actor?.toLowerCase().includes(q);
                const engineMatch = event.guardrailEngine?.toLowerCase().includes(q);
                if (!titleMatch && !descMatch && !actorMatch && !engineMatch) return false;
            }

            return true;
        });
    }, [auditEvents, selectedCategory, searchQuery]);

    const getIconForType = (type) => {
        switch (type) {
            case 'policy': return Sliders;
            case 'agent': return Bot;
            case 'transaction': return ArrowLeftRight;
            case 'access': return Lock;
            default: return ScrollText;
        }
    };

    return (
        <div className="space-y-8 animate-slide-up">
            <Breadcrumbs />

            {/* Slide Drawer */}
            <AuditDrawer event={selectedEvent} onClose={() => setSelectedEvent(null)} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#F8FAFC] tracking-tight">Compliance & Audit Log</h1>
                    <p className="text-[14px] text-[#94A3B8] mt-1">
                        An immutable, chronological record of every policy enforcement, agent invocation, and transaction decision.
                    </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[12px] text-[#94A3B8] mono">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{auditEvents.length} Recorded Events</span>
                </div>
            </div>

            {/* ── Toolbar: Search & Category Filter Tabs ── */}
            <div className="glass-card p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
                {/* Search Bar */}
                <div className="relative w-full md:max-w-md">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                    <input
                        type="text"
                        placeholder="Search audit records by actor, action, or reason..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="glass-input pl-9 text-[13px]"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Category Tabs */}
                <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                        const Icon = config.icon;
                        const isSelected = selectedCategory === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setSelectedCategory(key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all whitespace-nowrap ${
                                    isSelected
                                        ? 'bg-[#8B5CF6] text-white shadow-sm font-semibold'
                                        : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.04]'
                                }`}
                            >
                                <Icon size={13} />
                                <span>{config.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Chronological Glowing Timeline ── */}
            <div className="glass-card p-6 sm:p-8">
                {filteredEvents.length === 0 ? (
                    <div className="py-14 text-center">
                        <ScrollText size={24} className="mx-auto text-[#64748B] mb-2" />
                        <h3 className="text-base font-bold text-[#F8FAFC]">No audit records match your filters</h3>
                        <p className="text-[13px] text-[#94A3B8] mt-1">Try clearing your search query or selecting All Events.</p>
                    </div>
                ) : (
                    <div className="relative space-y-6">
                        {/* Connecting vertical line */}
                        <div
                            className="absolute left-[17px] sm:left-[21px] top-4 bottom-4 w-[2px]"
                            style={{
                                background: 'linear-gradient(180deg, rgba(139,92,246,0.5) 0%, rgba(91,140,255,0.2) 100%)',
                            }}
                        />

                        {filteredEvents.map((event) => {
                            const Icon = getIconForType(event.type);
                            const isApproved = event.status === 'APPROVED' || event.status === 'ACTIVE' || event.status === 'SUCCESS';
                            const isBlocked = event.status === 'BLOCKED' || event.status === 'DENIED' || event.status === 'REVOKED';

                            return (
                                <div
                                    key={event.id}
                                    onClick={() => setSelectedEvent(event)}
                                    className="relative flex items-start gap-4 sm:gap-6 group cursor-pointer"
                                >
                                    {/* Glowing Icon Dot */}
                                    <div
                                        className="h-9 w-9 sm:h-11 sm:w-11 rounded-2xl flex items-center justify-center flex-shrink-0 z-10 transition-all duration-300 group-hover:scale-110"
                                        style={{
                                            background: isApproved
                                                ? 'rgba(34,197,94,0.15)'
                                                : isBlocked
                                                ? 'rgba(239,68,68,0.15)'
                                                : 'rgba(139,92,246,0.15)',
                                            border: `1px solid ${
                                                isApproved
                                                    ? 'rgba(34,197,94,0.35)'
                                                    : isBlocked
                                                    ? 'rgba(239,68,68,0.35)'
                                                    : 'rgba(139,92,246,0.35)'
                                            }`,
                                            boxShadow: isApproved
                                                ? '0 0 16px rgba(34,197,94,0.2)'
                                                : isBlocked
                                                ? '0 0 16px rgba(239,68,68,0.2)'
                                                : '0 0 16px rgba(139,92,246,0.2)',
                                        }}
                                    >
                                        <Icon
                                            size={17}
                                            color={isApproved ? '#86EFAC' : isBlocked ? '#FCA5A5' : '#C4B5FD'}
                                        />
                                    </div>

                                    {/* Event Card Content */}
                                    <div className="flex-1 p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] group-hover:bg-white/[0.05] group-hover:border-white/[0.12] transition-all">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-[15px] font-bold text-[#F8FAFC] group-hover:text-[#8B5CF6] transition-colors">
                                                    {event.title}
                                                </span>
                                                <span
                                                    className={`badge-base ${
                                                        isApproved ? 'badge-approve' : isBlocked ? 'badge-deny' : 'badge-escalate'
                                                    }`}
                                                >
                                                    {event.status || 'RECORDED'}
                                                </span>
                                            </div>

                                            <div className="text-[11px] text-[#64748B] mono flex items-center gap-1">
                                                <Clock size={11} />
                                                <span>{formatTime(event.timestamp)}</span>
                                            </div>
                                        </div>

                                        <p className="text-[13px] text-[#94A3B8] leading-relaxed">
                                            {event.description}
                                        </p>

                                        {/* Actor and Engine Metadata Tags */}
                                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#64748B] mt-3 pt-3 border-t border-white/[0.04]">
                                            <span className="flex items-center gap-1 text-[#94A3B8]">
                                                <User size={11} /> Actor: <strong className="text-[#F8FAFC]">{event.actor || 'System'}</strong>
                                            </span>
                                            <span className="opacity-30">·</span>
                                            <span className="flex items-center gap-1 text-[#94A3B8]">
                                                <Shield size={11} /> Engine: <span className="text-[#5B8CFF]">{event.guardrailEngine || 'Policy Engine'}</span>
                                            </span>
                                            <span className="opacity-30">·</span>
                                            <span className="text-[#8B5CF6] font-medium flex items-center gap-1 ml-auto group-hover:translate-x-0.5 transition-transform">
                                                <span>Inspect Record</span>
                                                <ChevronRight size={12} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditPage;
