import React, { useEffect } from 'react';
import { X, ShieldCheck, ShieldAlert, Check, AlertTriangle, ArrowRight, ExternalLink, Clock, Tag, ShoppingBag, Cpu, Store, Award } from 'lucide-react';
import { formatMoney, formatTime } from '../utils/helpers.js';
import { useNavigate } from '../router/index.jsx';

const TransactionDrawer = ({ transaction, onClose }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!transaction) return null;

    const isApproved = transaction.decision === 'APPROVED';
    const isDenied = transaction.decision === 'DENIED';
    const score = transaction.score || (isApproved ? 94 : 35);
    const riskLevel = transaction.riskLevel || (score >= 80 ? 'LOW' : score >= 60 ? 'MODERATE' : 'HIGH');
    const merchantInfo = transaction.merchantInfo || { trustScore: 94, successRate: 98, returnRisk: 'LOW' };

    const handleViewAudit = () => {
        onClose();
        navigate('/audit');
    };

    const handleViewPolicy = () => {
        onClose();
        navigate('/policies');
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-[#070B14]/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Slide Drawer */}
            <div
                className="relative z-10 h-full w-full max-w-lg border-l border-white/10 bg-[#0B1220]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl overflow-y-auto flex flex-col justify-between"
                style={{ animation: 'slide-up-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-[#5B8CFF]">
                                <ShoppingBag size={16} />
                            </div>
                            <div>
                                <span className="section-label">Autonomous Transaction Record</span>
                                <div className="text-[12px] text-[#64748B] mono">ID: {transaction.id || 'tx-live'}</div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-[#94A3B8] hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Hero Info */}
                    <div className="flex items-start justify-between pb-6 border-b border-white/10">
                        <div>
                            <h2 className="text-2xl font-bold text-[#F8FAFC]">
                                {transaction.items?.[0]?.name || transaction.merchant}
                            </h2>
                            <p className="text-[13px] text-[#94A3B8] mt-1 flex items-center gap-2">
                                <span className="text-[#5B8CFF] font-semibold flex items-center gap-1">
                                    <Store size={12} /> {transaction.merchant}
                                </span>
                                <span className="opacity-30">·</span>
                                <span className="capitalize">{transaction.category}</span>
                            </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <div className="text-2xl font-extrabold text-[#F8FAFC]">
                                {formatMoney(transaction.total)}
                            </div>
                            <span
                                className={`badge-base mt-1.5 ${
                                    isApproved ? 'badge-approve' : isDenied ? 'badge-deny' : 'badge-escalate'
                                }`}
                            >
                                {isApproved ? <Check size={11} strokeWidth={3} /> : isDenied ? <X size={11} strokeWidth={3} /> : <AlertTriangle size={11} strokeWidth={3} />}
                                {isApproved ? 'Approved' : isDenied ? 'Blocked' : 'Escalated'}
                            </span>
                        </div>
                    </div>

                    {/* GuardRail Decision Score Card */}
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-5">
                        <div className="relative flex-shrink-0" style={{ width: 76, height: 76 }}>
                            <svg width="76" height="76" viewBox="0 0 76 76" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="38" cy="38" r="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                                <circle
                                    cx="38" cy="38" r="30"
                                    fill="none"
                                    stroke={score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444'}
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    strokeDasharray={2 * Math.PI * 30}
                                    strokeDashoffset={2 * Math.PI * 30 * (1 - score / 100)}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-base font-extrabold text-[#F8FAFC]">{score}</span>
                                <span className="text-[8px] text-[#64748B] mono">/ 100</span>
                            </div>
                        </div>

                        <div>
                            <div className="text-[11px] text-[#64748B] uppercase font-semibold">GuardRail Decision Score</div>
                            <div className="text-lg font-bold text-[#F8FAFC]">
                                {riskLevel} RISK VECTOR
                            </div>
                            <div className="text-[12px] font-semibold mt-0.5" style={{ color: isApproved ? '#86EFAC' : '#FCA5A5' }}>
                                {isApproved ? '✓ Policy Compliant Transaction' : '✕ Governance Violation Detected'}
                            </div>
                        </div>
                    </div>

                    {/* Context Specs */}
                    <div className="space-y-2">
                        <span className="section-label">Request Context</span>
                        <div className="grid grid-cols-2 gap-3 text-[13px]">
                            <div className="rounded-xl p-3 bg-white/[0.02] border border-white/[0.04]">
                                <div className="text-[10px] text-[#64748B] flex items-center gap-1.5 mb-1">
                                    <Cpu size={12} /> Autonomous Agent
                                </div>
                                <div className="font-semibold text-[#F8FAFC]">Shopping Agent v1</div>
                            </div>
                            <div className="rounded-xl p-3 bg-white/[0.02] border border-white/[0.04]">
                                <div className="text-[10px] text-[#64748B] flex items-center gap-1.5 mb-1">
                                    <Clock size={12} /> Timestamp
                                </div>
                                <div className="font-semibold text-[#F8FAFC]">{formatTime(transaction.timestamp)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Decision Checks Breakdown */}
                    <div className="space-y-2">
                        <span className="section-label">Deterministic Decision Checks</span>
                        <div className="space-y-2">
                            {[
                                { name: 'Agent Cryptographic Authorization', ok: transaction.checks?.agentAuthorized ?? true },
                                { name: 'Cumulative Budget Ceiling Clearance', ok: transaction.checks?.budgetAvailable ?? (isApproved || transaction.total <= 50) },
                                { name: 'Strict Category Allowlist Conformance', ok: transaction.checks?.categoryAllowed ?? !transaction.reason?.toLowerCase().includes('category') },
                                { name: 'Merchant Trust & Risk Verification', ok: transaction.checks?.merchantTrusted ?? true },
                                { name: 'Rolling Time Window Validity', ok: transaction.checks?.timeWindowValid ?? true },
                            ].map((chk, i) => (
                                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[12px]">
                                    <span className="text-[#94A3B8]">{chk.name}</span>
                                    <span className={chk.ok ? 'text-[#86EFAC] font-semibold' : 'text-[#FCA5A5] font-semibold'}>
                                        {chk.ok ? '✓ PASS' : '✕ FAIL'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Decision Reasoning */}
                    <div className="space-y-2">
                        <span className="section-label">GuardRail Decision Engine Reason</span>
                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                            <p className="text-[13px] text-[#F8FAFC] leading-relaxed">
                                {transaction.reason}
                            </p>
                        </div>
                    </div>

                    {/* Merchant Intelligence */}
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                        <span className="section-label">Merchant Intelligence</span>
                        <div className="text-[14px] font-bold text-[#F8FAFC] flex items-center justify-between">
                            <span>{transaction.merchant}</span>
                            <span className="text-[#22C55E] text-[12px] font-semibold">Trust Index {merchantInfo.trustScore || 94}/100</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-[#94A3B8]">
                            <div>Success Rate: <strong className="text-white">{merchantInfo.successRate || 98}%</strong></div>
                            <div>Return Risk: <strong className="text-white">{merchantInfo.returnRisk || 'LOW'}</strong></div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-6 border-t border-white/10 space-y-2">
                    <div className="flex gap-2">
                        {isDenied && (
                            <button
                                onClick={handleViewPolicy}
                                className="btn-secondary flex-1 text-[12px] py-2.5"
                            >
                                <ExternalLink size={13} /> View Policy
                            </button>
                        )}
                        <button
                            onClick={handleViewAudit}
                            className="btn-primary flex-1 text-[12px] py-2.5"
                        >
                            View Audit Record <ArrowRight size={13} />
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-full text-center text-[12px] text-[#64748B] hover:text-[#94A3B8] py-1"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionDrawer;
