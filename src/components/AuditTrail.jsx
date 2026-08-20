import React, { useContext } from 'react';
import { GuardRailContext } from '../context/GuardRailContext.jsx';
import { ScrollText, Check, X, AlertTriangle, Settings, ShieldOff } from 'lucide-react';
import { formatTime, formatMoney } from '../utils/helpers.js';

const EVENT_CONFIG = {
    APPROVED:  { Icon: Check,         bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.25)',   color: '#86EFAC' },
    DENIED:    { Icon: X,             bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)',   color: '#FCA5A5' },
    ESCALATE:  { Icon: AlertTriangle, bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)',  color: '#FCD34D' },
    policy:    { Icon: Settings,      bg: 'rgba(91,140,255,0.12)',  border: 'rgba(91,140,255,0.25)',  color: '#93C5FD' },
    revoked:   { Icon: ShieldOff,     bg: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.20)',   color: '#FCA5A5' },
};

const AuditTrail = () => {
    const { transactions, policy, agentRevoked } = useContext(GuardRailContext);

    const events = [];
    if (policy.active && policy._startTime) {
        events.push({
            type: 'policy',
            label: 'Policy activated',
            detail: `$${policy.maxBudget} · ${policy.category || 'any'} · ${policy.timeWindow}h`,
            ts: policy._startTime,
        });
    }
    if (agentRevoked) {
        events.push({ type: 'revoked', label: 'Agent access revoked', detail: 'Shopping Agent blocked', ts: Date.now() });
    }
    transactions.forEach(tx => {
        events.push({
            type: tx.decision,
            label: tx.decision === 'APPROVED' ? 'Transaction approved'
                : tx.decision === 'DENIED' ? 'Transaction blocked'
                : 'Escalation required',
            detail: `${tx.items?.[0]?.name || tx.merchant} · ${formatMoney(tx.total)}`,
            ts: tx.timestamp,
        });
    });
    events.sort((a, b) => (b.ts || 0) - (a.ts || 0));

    return (
        <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
                <ScrollText size={15} color="#64748B" />
                <span className="section-label">Audit Trail</span>
            </div>

            {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                    <ScrollText size={18} color="#64748B" />
                    <p className="text-[12px] text-[#64748B] mt-2">No events yet</p>
                </div>
            ) : (
                <div className="relative space-y-3 max-h-72 overflow-y-auto pr-1">
                    {/* Timeline line */}
                    <div
                        className="absolute left-[9px] top-2 bottom-2 w-px"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                    />
                    {events.map((ev, i) => {
                        const cfg = EVENT_CONFIG[ev.type] || EVENT_CONFIG.policy;
                        return (
                            <div key={i} className="flex items-start gap-3 relative">
                                <div
                                    className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full mt-0.5"
                                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, zIndex: 1 }}
                                >
                                    <cfg.Icon size={9} color={cfg.color} strokeWidth={3} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[12px] font-medium text-[#F8FAFC]">{ev.label}</p>
                                    <p className="text-[11px] text-[#64748B] truncate">{ev.detail}</p>
                                </div>
                                <p className="flex-shrink-0 text-[10px] mono text-[#64748B]">
                                    {ev.ts ? formatTime(ev.ts) : '—'}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AuditTrail;
