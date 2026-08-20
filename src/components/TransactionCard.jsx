import React, { useState } from 'react';
import { formatMoney, formatTime } from '../utils/helpers.js';
import { ShoppingCart, Shield, Clock, Check, X, ChevronDown, ChevronUp } from 'lucide-react';

const PolicyCheck = ({ label, passed }) => (
    <div className="flex items-center gap-2 text-[12px]">
        <div
            className="flex h-4 w-4 items-center justify-center rounded-full flex-shrink-0"
            style={{
                background: passed ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                border: `1px solid ${passed ? 'rgba(34,197,94,0.30)' : 'rgba(239,68,68,0.30)'}`,
            }}
        >
            {passed
                ? <Check size={9} color="#22C55E" strokeWidth={3} />
                : <X size={9} color="#EF4444" strokeWidth={3} />
            }
        </div>
        <span style={{ color: passed ? '#94A3B8' : '#FCA5A5' }}>{label}</span>
    </div>
);

const CategoryIcon = ({ category }) => {
    const Icon = category === 'electronics' ? Shield : category === 'subscriptions' ? Clock : ShoppingCart;
    return <Icon size={15} color="#64748B" />;
};

const TransactionCard = ({ tx }) => {
    const [expanded, setExpanded] = useState(false);
    const isApproved = tx.decision === 'APPROVED';
    const isDenied = tx.decision === 'DENIED';

    const leftColor = isApproved ? '#22C55E' : isDenied ? '#EF4444' : '#F59E0B';
    const glowColor = isApproved
        ? 'rgba(34,197,94,0.08)'
        : isDenied
            ? 'rgba(239,68,68,0.08)'
            : 'rgba(245,158,11,0.08)';

    const badgeClass = isApproved ? 'badge-approve' : isDenied ? 'badge-deny' : 'badge-escalate';
    const badgeText = isApproved ? 'Approved' : isDenied ? 'Blocked' : 'Review';
    const BadgeIcon = isApproved ? Check : isDenied ? X : Shield;

    const budgetOk = isApproved || tx.decision === 'ESCALATE';
    const categoryOk = !tx.reason?.toLowerCase().includes('category');
    const timeOk = !tx.reason?.toLowerCase().includes('time window');
    const authOk = !tx.reason?.toLowerCase().includes('revoked');

    return (
        <div
            className="rounded-xl overflow-hidden transition-all duration-250"
            style={{
                background: `rgba(255,255,255,0.04)`,
                border: `1px solid rgba(255,255,255,0.08)`,
                borderLeft: `3px solid ${leftColor}`,
                boxShadow: expanded ? `0 0 30px ${glowColor}` : 'none',
                animation: 'slide-up-in 0.3s ease',
                transition: 'box-shadow 0.25s ease, background 0.25s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
        >
            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                        <div
                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            <CategoryIcon category={tx.category} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[13px] font-medium text-[#F8FAFC] truncate">
                                {tx.items?.[0]?.name || tx.merchant || 'Transaction'}
                            </p>
                            <p className="text-[11px] text-[#64748B] mt-0.5 capitalize">
                                {tx.category} <span className="mx-1 opacity-40">·</span> {formatTime(tx.timestamp)}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2.5">
                        <span className="text-[13px] font-semibold text-[#F8FAFC]">{formatMoney(tx.total)}</span>
                        <span className={`badge-base ${badgeClass}`}>
                            <BadgeIcon size={10} strokeWidth={3} />
                            {badgeText}
                        </span>
                    </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                    <p className="text-[12px] text-[#64748B] max-w-[65%] truncate">{tx.reason}</p>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-1 text-[12px] font-medium transition-colors"
                        style={{ color: '#5B8CFF' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#7BA3FF'}
                        onMouseLeave={e => e.currentTarget.style.color = '#5B8CFF'}
                    >
                        {expanded ? 'Hide' : 'Details'}
                        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                </div>
            </div>

            {/* Expanded panel */}
            {expanded && (
                <div
                    className="px-4 pb-4"
                    style={{ animation: 'slide-up-in 0.2s ease' }}
                >
                    <div
                        className="rounded-xl p-3 grid grid-cols-2 gap-4"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <div>
                            <p className="section-label mb-2">Policy Checks</p>
                            <div className="space-y-1.5">
                                <PolicyCheck label="Category allowed" passed={categoryOk} />
                                <PolicyCheck label="Within budget" passed={budgetOk} />
                                <PolicyCheck label="Time window valid" passed={timeOk} />
                                <PolicyCheck label="Agent authorized" passed={authOk} />
                            </div>
                        </div>
                        <div>
                            <p className="section-label mb-2">Items</p>
                            <div className="space-y-1.5">
                                {tx.items?.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <span className="text-[12px] text-[#64748B] truncate pr-2">{item.name}</span>
                                        <span className="text-[12px] font-medium text-[#94A3B8] flex-shrink-0">{formatMoney(item.price)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionCard;