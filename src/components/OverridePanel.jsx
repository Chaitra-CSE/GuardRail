import React, { useContext, useState } from 'react';
import { GuardRailContext } from '../context/GuardRailContext.jsx';
import { ShieldOff, ShieldCheck, AlertTriangle, Check, X, Bot } from 'lucide-react';
import { formatMoney } from '../utils/helpers.js';

const ConfirmDialog = ({ onConfirm, onCancel }) => (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(7,11,20,0.75)', backdropFilter: 'blur(10px)' }}
    >
        <div
            className="glass-card mx-4 w-full max-w-sm p-6"
            style={{ animation: 'slide-up-in 0.2s ease' }}
        >
            <div
                className="flex h-10 w-10 items-center justify-center rounded-xl mb-4"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}
            >
                <ShieldOff size={18} color="#EF4444" />
            </div>
            <h3 className="text-[15px] font-semibold text-[#F8FAFC] mb-2">Revoke agent access?</h3>
            <p className="text-[13px] text-[#64748B] mb-5">
                The shopping agent will no longer be allowed to execute transactions. All future runs will be blocked until access is restored.
            </p>
            <div className="flex gap-3 justify-end">
                <button onClick={onCancel} className="btn-secondary">Cancel</button>
                <button onClick={onConfirm} className="btn-destructive">Revoke Access</button>
            </div>
        </div>
    </div>
);

const OverridePanel = () => {
    const {
        agentRevoked, setAgentRevoked,
        pendingEscalation, setPendingEscalation, addTransaction
    } = useContext(GuardRailContext);

    const [showConfirm, setShowConfirm] = useState(false);

    const handleRevoke = () => {
        if (agentRevoked) { setAgentRevoked(false); }
        else { setShowConfirm(true); }
    };

    const resolveEscalation = (approved) => {
        if (!pendingEscalation) return;
        const { transaction, resolve } = pendingEscalation;
        const decision = approved ? 'APPROVED' : 'DENIED';
        const reason = approved ? 'Human approved escalation.' : 'Human denied escalation.';
        addTransaction({ ...transaction, decision, reason, timestamp: Date.now() });
        resolve(decision);
        setPendingEscalation(null);
    };

    return (
        <>
            {showConfirm && (
                <ConfirmDialog
                    onConfirm={() => { setAgentRevoked(true); setShowConfirm(false); }}
                    onCancel={() => setShowConfirm(false)}
                />
            )}

            <div className="glass-card p-4 space-y-4">
                {/* Header */}
                <div className="section-label">Agent Access</div>

                {/* Agent status */}
                <div
                    className="flex items-center justify-between rounded-xl p-3"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-9 w-9 items-center justify-center rounded-lg"
                            style={{
                                background: agentRevoked
                                    ? 'rgba(239,68,68,0.12)'
                                    : 'rgba(91,140,255,0.12)',
                                border: `1px solid ${agentRevoked ? 'rgba(239,68,68,0.25)' : 'rgba(91,140,255,0.25)'}`,
                            }}
                        >
                            <Bot size={16} color={agentRevoked ? '#EF4444' : '#5B8CFF'} />
                        </div>
                        <div>
                            <div className="text-[13px] font-medium text-[#F8FAFC]">Shopping Agent</div>
                            <div
                                className="text-[11px] font-medium"
                                style={{ color: agentRevoked ? '#EF4444' : '#22C55E' }}
                            >
                                {agentRevoked ? '● Access Revoked' : '● Authorized'}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleRevoke}
                        className={agentRevoked ? 'btn-secondary' : 'btn-destructive'}
                        style={{ fontSize: '12px', padding: '5px 10px' }}
                    >
                        {agentRevoked
                            ? <><ShieldCheck size={12} /> Restore</>
                            : <><ShieldOff size={12} /> Revoke</>
                        }
                    </button>
                </div>

                {/* Escalation panel */}
                {pendingEscalation && (
                    <div
                        className="rounded-xl p-3"
                        style={{
                            background: 'rgba(245,158,11,0.08)',
                            border: '1px solid rgba(245,158,11,0.25)',
                            animation: 'slide-up-in 0.25s ease',
                        }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle size={13} color="#F59E0B" />
                            <span className="text-[11px] font-semibold text-[#FCD34D] uppercase tracking-wider">Escalation Required</span>
                        </div>
                        <p className="text-[12px] text-[#94A3B8] mb-3">
                            {pendingEscalation.transaction.items.map(i => i.name).join(', ')}
                            {' · '}
                            <span className="text-[#F8FAFC] font-medium">{formatMoney(pendingEscalation.transaction.total)}</span>
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => resolveEscalation(true)}
                                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-medium text-white transition-all"
                                style={{ background: 'rgba(34,197,94,0.20)', border: '1px solid rgba(34,197,94,0.35)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.30)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,197,94,0.20)'}
                            >
                                <Check size={12} strokeWidth={3} /> Approve
                            </button>
                            <button
                                onClick={() => resolveEscalation(false)}
                                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-medium text-white transition-all"
                                style={{ background: 'rgba(239,68,68,0.20)', border: '1px solid rgba(239,68,68,0.35)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.30)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.20)'}
                            >
                                <X size={12} strokeWidth={3} /> Deny
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default OverridePanel;