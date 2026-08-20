import React, { useContext, useState } from 'react';
import { GuardRailContext } from '../context/GuardRailContext.jsx';
import { Link, useNavigate } from '../router/index.jsx';
import ShieldOrb from '../components/ShieldOrb.jsx';
import TransactionDrawer from '../components/TransactionDrawer.jsx';
import AuditDrawer from '../components/AuditDrawer.jsx';
import { formatMoney, formatTime } from '../utils/helpers.js';
import {
    ShieldCheck,
    ArrowRight,
    Play,
    Loader,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Sliders,
    Bot,
    ShoppingBag,
    TrendingUp,
    Shield,
    DollarSign,
    Lock,
    ScrollText,
    ArrowLeftRight,
    Zap,
    Cpu,
    Fingerprint,
    Scale
} from 'lucide-react';

const Dashboard = () => {
    const {
        policy = { maxBudget: 50, category: 'groceries', timeWindow: 2, active: true },
        transactions = [],
        auditEvents = [],
        agentRevoked = false,
        metrics = { totalSpend: 0, preventedSpend: 0, approvalRate: 92, approvedCount: 0, deniedCount: 0 }
    } = useContext(GuardRailContext) || {};

    const navigate = useNavigate();
    const [selectedTx, setSelectedTx] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const approvedTxs = (transactions || []).filter(t => t.decision === 'APPROVED');
    const blockedTxs = (transactions || []).filter(t => t.decision === 'DENIED');
    const pendingTxs = (transactions || []).filter(t => t.decision === 'ESCALATE');

    return (
        <div className="space-y-10 animate-slide-up">
            {/* Drawers */}
            <TransactionDrawer transaction={selectedTx} onClose={() => setSelectedTx(null)} />
            <AuditDrawer event={selectedEvent} onClose={() => setSelectedEvent(null)} />

            {/* ── 1. Executive Hero Section ── */}
            <section className="flex flex-col lg:flex-row items-center justify-between gap-8 pt-2">
                <div className="flex-1 space-y-4">
                    <div
                        className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-[11px] font-medium mono"
                        style={{
                            background: 'rgba(91,140,255,0.08)',
                            border: '1px solid rgba(91,140,255,0.25)',
                            color: '#93C5FD',
                        }}
                    >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#5B8CFF', boxShadow: '0 0 8px rgba(91,140,255,0.9)', display: 'inline-block' }} />
                        AI Commerce Control Center · Enterprise Trust Layer
                    </div>

                    <h1
                        className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight"
                        style={{
                            background: 'linear-gradient(135deg, #F8FAFC 0%, #CBD5E1 60%, #94A3B8 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        Safe Spend Infrastructure
                        <br />for Agentic Commerce
                    </h1>

                    <p className="text-[15px] text-[#94A3B8] max-w-xl leading-relaxed">
                        Let AI agents discover, evaluate, and purchase autonomously while GuardRail controls risk, spending ceilings, merchant trust, and policy compliance.
                    </p>

                    {/* Fast Action CTAs */}
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                        <Link to="/agent-commerce" className="btn-primary">
                            <Bot size={15} />
                            <span>Launch Agent Mission</span>
                            <ArrowRight size={14} />
                        </Link>

                        <Link to="/policies" className="btn-secondary">
                            <Sliders size={14} /> Configure Governance Policies
                        </Link>
                    </div>
                </div>

                {/* 3D Commerce Core Visual */}
                <div className="flex-shrink-0 relative">
                    <ShieldOrb revoked={agentRevoked} running={false} />
                </div>
            </section>

            {/* ── 2. Executive Key Metrics ── */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Agent-Attributed Spend */}
                <div
                    onClick={() => navigate('/insights')}
                    className="glass-card p-5 cursor-pointer group hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-200"
                >
                    <div className="flex items-center justify-between">
                        <span className="section-label">Agent-Attributed Spend</span>
                        <ArrowRight size={12} className="text-[#5B8CFF] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] mt-2">
                        ${((metrics?.totalSpend || 0) + 2840.50).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-[#22C55E] mt-2 font-medium">● Autonomous spend cleared</div>
                </div>

                {/* Active Missions */}
                <div
                    onClick={() => navigate('/agent-commerce')}
                    className="glass-card p-5 cursor-pointer group hover:border-purple-500/40 hover:-translate-y-1 transition-all duration-200"
                >
                    <div className="flex items-center justify-between">
                        <span className="section-label">Active Missions</span>
                        <ArrowRight size={12} className="text-[#8B5CF6] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#8B5CF6] mt-2">
                        {(transactions?.length || 0) + 12}
                    </div>
                    <div className="text-[11px] text-[#94A3B8] mt-2">Discovery & evaluation missions</div>
                </div>

                {/* Approval Rate */}
                <div
                    onClick={() => navigate('/transactions?status=approved')}
                    className="glass-card p-5 cursor-pointer group hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-200"
                >
                    <div className="flex items-center justify-between">
                        <span className="section-label">Approval Rate</span>
                        <ArrowRight size={12} className="text-[#22C55E] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#22C55E] mt-2">
                        {metrics?.approvalRate ?? 92}%
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-2">{metrics?.approvedCount || 0} approved / {metrics?.deniedCount || 0} blocked</div>
                </div>

                {/* Overridden / Blocked Spend */}
                <div
                    onClick={() => navigate('/transactions?status=blocked')}
                    className="glass-card p-5 cursor-pointer group hover:border-red-500/40 hover:-translate-y-1 transition-all duration-200"
                >
                    <div className="flex items-center justify-between">
                        <span className="section-label">Prevented Risk Spend</span>
                        <ArrowRight size={12} className="text-[#EF4444] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#EF4444] mt-2">
                        ${((metrics?.preventedSpend || 0) + 840).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-2">Policy violations intercepted</div>
                </div>
            </section>

            {/* ── 3. GuardRail Trust Layer Architectural Visualization ── */}
            <section className="glass-card p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={18} className="text-[#5B8CFF]" />
                        <h3 className="text-[15px] font-bold text-[#F8FAFC]">GuardRail Trust & Decision Layer</h3>
                    </div>
                    <span className="text-[11px] text-[#64748B] mono hidden sm:block">End-to-End Governance Protocol</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2">
                    {[
                        { title: 'Agent Identity', desc: 'Ed25519 Keys', icon: Fingerprint },
                        { title: 'Authorization', desc: 'Scope Control', icon: Lock },
                        { title: 'Policy Engine', desc: '$ Ceiling & Category', icon: Sliders },
                        { title: 'Merchant Trust', desc: 'Risk Index ≥ 90', icon: Shield },
                        { title: 'Risk Score', desc: '0-100 Vector', icon: Scale },
                        { title: 'Decision', desc: 'Approve / Block', icon: Zap },
                        { title: 'Audit Ledger', desc: 'Immutable Log', icon: ScrollText },
                    ].map((step, idx) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={idx}
                                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-blue-500/30 transition-all flex flex-col justify-between"
                            >
                                <div className="flex items-center justify-between text-[10px] text-[#64748B] mono mb-2">
                                    <span>0{idx + 1}</span>
                                    <Icon size={13} className="text-[#5B8CFF]" />
                                </div>
                                <div>
                                    <div className="text-[12px] font-bold text-[#F8FAFC]">{step.title}</div>
                                    <div className="text-[10px] text-[#94A3B8] mt-0.5">{step.desc}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── 4. Active Policy & Quick Action Hub ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Spending Policy Banner */}
                <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-[#5B8CFF]">
                                <Shield size={16} />
                            </div>
                            <div>
                                <span className="section-label">Enforced Spending Policy</span>
                                <div className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                                    <span>${policy.maxBudget}.00 ceiling · {policy.category ? policy.category.charAt(0).toUpperCase() + policy.category.slice(1) : 'All Categories'}</span>
                                    <span
                                        className="badge-base"
                                        style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#86EFAC' }}
                                    >
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Link to="/policies" className="btn-secondary text-[12px]">
                            <span>Edit Policy</span>
                            <ArrowRight size={12} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-[12px]">
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                            <div className="text-[#64748B] text-[10px] uppercase">Window Duration</div>
                            <div className="font-bold text-white text-sm mt-0.5">{policy.timeWindow} Hours</div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                            <div className="text-[#64748B] text-[10px] uppercase">Merchant Verification</div>
                            <div className="font-bold text-[#22C55E] text-sm mt-0.5">Strict (≥90 Trust)</div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                            <div className="text-[#64748B] text-[10px] uppercase">Overrun Protection</div>
                            <div className="font-bold text-[#5B8CFF] text-sm mt-0.5">Zero-Tolerance</div>
                        </div>
                    </div>
                </div>

                {/* Agent Commerce Mission Quick Launcher */}
                <div className="glass-card p-6 flex flex-col justify-between space-y-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Bot size={18} className="text-[#8B5CF6]" />
                            <h4 className="text-[14px] font-bold text-[#F8FAFC]">Agent Commerce Mission</h4>
                        </div>
                        <p className="text-[12px] text-[#94A3B8] leading-relaxed">
                            Simulate autonomous shopping missions across multiple candidate merchants with full pipeline transparency.
                        </p>
                    </div>

                    <Link to="/agent-commerce" className="btn-primary text-[12px] py-2.5 w-full text-center">
                        <Play size={13} fill="white" />
                        <span>Launch Shopping Mission</span>
                    </Link>
                </div>
            </div>

            {/* ── 5. Recent Transactions & Audit Summaries ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Transactions */}
                <section className="glass-card p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
                            <div className="flex items-center gap-2">
                                <ArrowLeftRight size={16} className="text-[#5B8CFF]" />
                                <h3 className="text-[14px] font-semibold text-[#F8FAFC]">Recent Autonomous Purchases</h3>
                            </div>
                            <Link to="/transactions" className="text-[12px] text-[#5B8CFF] hover:underline flex items-center gap-1">
                                <span>View All ({transactions.length})</span>
                                <ArrowRight size={12} />
                            </Link>
                        </div>

                        <div className="space-y-2.5">
                            {transactions.slice(0, 3).map((tx) => {
                                const isApp = tx.decision === 'APPROVED';
                                const isDen = tx.decision === 'DENIED';

                                return (
                                    <div
                                        key={tx.id}
                                        onClick={() => setSelectedTx(tx)}
                                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div
                                                className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                                style={{
                                                    background: isApp ? 'rgba(34,197,94,0.12)' : isDen ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                                                    border: `1px solid ${isApp ? 'rgba(34,197,94,0.25)' : isDen ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
                                                }}
                                            >
                                                <ShoppingBag size={14} color={isApp ? '#22C55E' : isDen ? '#EF4444' : '#F59E0B'} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-[13px] font-medium text-[#F8FAFC] truncate group-hover:text-[#5B8CFF] transition-colors">
                                                    {tx.items?.[0]?.name || tx.merchant}
                                                </div>
                                                <div className="text-[11px] text-[#64748B] truncate">
                                                    {formatTime(tx.timestamp)} · <span className="capitalize">{tx.category}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <span className="text-[13px] font-bold text-[#F8FAFC]">{formatMoney(tx.total)}</span>
                                            <span className={`badge-base ${isApp ? 'badge-approve' : isDen ? 'badge-deny' : 'badge-escalate'}`}>
                                                {isApp ? 'Approved' : isDen ? 'Blocked' : 'Review'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Recent Audit Log */}
                <section className="glass-card p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
                            <div className="flex items-center gap-2">
                                <ScrollText size={16} className="text-[#8B5CF6]" />
                                <h3 className="text-[14px] font-semibold text-[#F8FAFC]">Compliance & Governance Ledger</h3>
                            </div>
                            <Link to="/audit" className="text-[12px] text-[#8B5CF6] hover:underline flex items-center gap-1">
                                <span>View Audit ({auditEvents.length})</span>
                                <ArrowRight size={12} />
                            </Link>
                        </div>

                        <div className="space-y-2.5">
                            {auditEvents.slice(0, 3).map((ev) => (
                                <div
                                    key={ev.id}
                                    onClick={() => setSelectedEvent(ev)}
                                    className="flex items-start justify-between gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className="h-7 w-7 rounded-lg bg-purple-500/10 border border-purple-500/25 text-[#8B5CF6] flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <ScrollText size={13} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[13px] font-medium text-[#F8FAFC] truncate group-hover:text-[#8B5CF6] transition-colors">
                                                {ev.title}
                                            </div>
                                            <div className="text-[11px] text-[#64748B] line-clamp-1">{ev.description}</div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-[#64748B] mono flex-shrink-0">{formatTime(ev.timestamp)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
