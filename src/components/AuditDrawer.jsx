import React, { useEffect } from 'react';
import { X, ScrollText, User, Shield, Clock, ArrowRight, Check, AlertTriangle, ShieldAlert } from 'lucide-react';
import { formatTime } from '../utils/helpers.js';
import { useNavigate } from '../router/index.jsx';

const AuditDrawer = ({ event, onClose }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!event) return null;

    const isTx = event.type === 'transaction';
    const isPolicy = event.type === 'policy';
    const isAccess = event.type === 'access' || event.type === 'agent';

    const handleViewTransactions = () => {
        onClose();
        navigate('/transactions');
    };

    const handleViewPolicy = () => {
        onClose();
        navigate('/policies');
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-[#070B14]/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Slide Drawer */}
            <div
                className="relative z-10 h-full w-full max-w-md border-l border-white/10 bg-[#0B1220]/95 p-6 shadow-2xl backdrop-blur-2xl overflow-y-auto flex flex-col justify-between"
                style={{ animation: 'slide-up-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
                <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20">
                                <ScrollText size={16} className="text-[#8B5CF6]" />
                            </div>
                            <div>
                                <span className="section-label">Audit Event Record</span>
                                <div className="text-[12px] text-[#64748B] mono">ID: {event.id || 'evt-live'}</div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Main Title */}
                    <div className="py-6 border-b border-white/10">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-[#F8FAFC]">
                                    {event.title}
                                </h2>
                                <p className="text-[13px] text-[#94A3B8] mt-1">
                                    Type: <span className="capitalize text-[#F8FAFC] font-medium">{event.type}</span>
                                </p>
                            </div>
                            <span
                                className={`badge-base ${
                                    event.status === 'APPROVED' || event.status === 'SUCCESS' || event.status === 'ACTIVE'
                                        ? 'badge-approve'
                                        : event.status === 'BLOCKED' || event.status === 'DENIED' || event.status === 'REVOKED'
                                        ? 'badge-deny'
                                        : 'badge-escalate'
                                }`}
                            >
                                {event.status || 'RECORDED'}
                            </span>
                        </div>
                    </div>

                    {/* Metadata Specs */}
                    <div className="py-5 border-b border-white/10 space-y-3">
                        <span className="section-label">Event Parameters</span>
                        <div className="grid grid-cols-2 gap-3 text-[13px]">
                            <div className="rounded-xl p-3 bg-white/[0.03] border border-white/[0.06]">
                                <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 mb-1">
                                    <Clock size={12} /> Timestamp
                                </div>
                                <div className="font-medium text-[#F8FAFC]">{formatTime(event.timestamp)}</div>
                            </div>
                            <div className="rounded-xl p-3 bg-white/[0.03] border border-white/[0.06]">
                                <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 mb-1">
                                    <User size={12} /> Origin Actor
                                </div>
                                <div className="font-medium text-[#F8FAFC]">{event.actor || 'System'}</div>
                            </div>
                            <div className="rounded-xl p-3 bg-white/[0.03] border border-white/[0.06] col-span-2">
                                <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 mb-1">
                                    <Shield size={12} /> GuardRail Component
                                </div>
                                <div className="font-medium text-[#5B8CFF]">{event.guardrailEngine || 'Policy Core Engine'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Full Description / Log Payload */}
                    <div className="py-5 border-b border-white/10 space-y-3">
                        <span className="section-label">Audit Log Details</span>
                        <div className="rounded-xl p-4 bg-white/[0.03] border border-white/[0.06]">
                            <p className="text-[13px] text-[#F8FAFC] leading-relaxed">
                                {event.description}
                            </p>
                        </div>
                    </div>

                    {/* Metadata Payload if present */}
                    {event.metadata && (
                        <div className="py-5 space-y-3">
                            <span className="section-label">Payload Attributes</span>
                            <div className="rounded-xl p-3 bg-black/40 border border-white/10 mono text-[11px] text-[#94A3B8] overflow-x-auto space-y-1">
                                {Object.entries(event.metadata).map(([k, v]) => (
                                    <div key={k} className="flex justify-between py-0.5">
                                        <span className="text-[#64748B]">{k}:</span>
                                        <span className="text-[#E2E8F0] font-medium">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="pt-6 border-t border-white/10 space-y-2">
                    <div className="flex gap-2">
                        {isTx && (
                            <button
                                onClick={handleViewTransactions}
                                className="btn-primary flex-1 text-[12px] py-2.5"
                            >
                                View Transactions <ArrowRight size={13} />
                            </button>
                        )}
                        {isPolicy && (
                            <button
                                onClick={handleViewPolicy}
                                className="btn-primary flex-1 text-[12px] py-2.5"
                            >
                                View Spending Policy <ArrowRight size={13} />
                            </button>
                        )}
                        {isAccess && (
                            <button
                                onClick={handleViewPolicy}
                                className="btn-primary flex-1 text-[12px] py-2.5"
                            >
                                Manage Agent Controls <ArrowRight size={13} />
                            </button>
                        )}
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

export default AuditDrawer;
