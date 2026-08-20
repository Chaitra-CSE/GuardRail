import React, { useContext, useState } from 'react';
import { GuardRailContext } from '../context/GuardRailContext.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import OverridePanel from '../components/OverridePanel.jsx';
import {
    Sliders,
    Shield,
    Plus,
    Check,
    Pencil,
    Trash2,
    Clock,
    History,
    AlertCircle,
    Lock,
    Unlock,
    DollarSign,
    Layers
} from 'lucide-react';
import { formatTime } from '../utils/helpers.js';

const PoliciesPage = () => {
    const {
        policy = { maxBudget: 50, category: 'groceries', timeWindow: 2, active: true },
        setPolicy,
        policyHistory = []
    } = useContext(GuardRailContext) || {};

    const [isCreating, setIsCreating] = useState(() => !policy?.active);
    const [budget, setBudget] = useState(() => policy?.maxBudget || 50);
    const [category, setCategory] = useState(() => policy?.category || 'groceries');
    const [hours, setHours] = useState(() => policy?.timeWindow || 2);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleSavePolicy = (e) => {
        e.preventDefault();
        const numBudget = Number(budget);
        const numHours = Number(hours);

        if (isNaN(numBudget) || numBudget <= 0) {
            setErrorMsg('Budget limit must be greater than $0.');
            return;
        }
        if (!category) {
            setErrorMsg('Please select a spend category.');
            return;
        }
        if (isNaN(numHours) || numHours <= 0) {
            setErrorMsg('Time window duration must be at least 1 hour.');
            return;
        }

        setErrorMsg('');
        setPolicy({
            id: 'pol-' + Date.now(),
            maxBudget: numBudget,
            category: category,
            timeWindow: numHours,
            allowlist: [],
            blocklist: [],
            active: true,
            _startTime: Date.now(),
            createdAt: Date.now(),
        });

        setIsCreating(false);
        setSuccessMsg('Spending policy enforced successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const handleDeactivate = () => {
        setPolicy(prev => ({ ...prev, active: false }));
        setIsCreating(true);
        setSuccessMsg('Policy deactivated.');
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    return (
        <div className="space-y-8 animate-slide-up">
            <Breadcrumbs />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#F8FAFC] tracking-tight">Spending Policies</h1>
                    <p className="text-[14px] text-[#94A3B8] mt-1">
                        Define the deterministic boundaries and rules that control autonomous AI spending.
                    </p>
                </div>
                {!isCreating && (
                    <button
                        onClick={() => {
                            setBudget(policy.maxBudget);
                            setCategory(policy.category);
                            setHours(policy.timeWindow);
                            setIsCreating(true);
                        }}
                        className="btn-primary self-start sm:self-auto"
                    >
                        <Plus size={15} />
                        <span>Create / Update Policy</span>
                    </button>
                )}
            </div>

            {/* Feedback Banners */}
            {successMsg && (
                <div className="rounded-xl p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[13px] flex items-center gap-2 animate-slide-up">
                    <Check size={16} />
                    <span>{successMsg}</span>
                </div>
            )}
            {errorMsg && (
                <div className="rounded-xl p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-[13px] flex items-center gap-2 animate-slide-up">
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Sandbox Simulation Callout */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/20 text-[#5B8CFF] flex items-center justify-center flex-shrink-0">
                        <Sliders size={16} />
                    </div>
                    <div>
                        <div className="text-[13px] font-bold text-[#F8FAFC]">Simulate Policy Adjustments Before Enforcing</div>
                        <div className="text-[11px] text-[#94A3B8]">Test how changing ceilings and categories alters agent approval rates and risk exposure.</div>
                    </div>
                </div>
                <a href="/insights" className="btn-secondary text-[12px] py-1.5 px-3 whitespace-nowrap self-start sm:self-auto">
                    <span>Open Policy Simulator →</span>
                </a>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Active Policy & Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Policy Showcase Card */}
                    {policy.active && !isCreating ? (
                        <div
                            className="glass-card p-6 relative overflow-hidden"
                            style={{ animation: 'border-glow 4s ease-in-out infinite' }}
                        >
                            {/* Shield watermark */}
                            <div className="absolute right-4 top-4 opacity-5 pointer-events-none">
                                <Shield size={160} />
                            </div>

                            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/25 text-[#5B8CFF]">
                                        <Lock size={18} />
                                    </div>
                                    <div>
                                        <span className="section-label">Active Spending Rule</span>
                                        <div className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
                                            <span>Enforced Governance Policy</span>
                                            <span
                                                className="badge-base"
                                                style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#86EFAC' }}
                                            >
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.8)', animation: 'pulse-green 2.5s ease-in-out infinite', display: 'inline-block' }} />
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setBudget(policy.maxBudget);
                                            setCategory(policy.category);
                                            setHours(policy.timeWindow);
                                            setIsCreating(true);
                                        }}
                                        className="btn-secondary text-[12px]"
                                    >
                                        <Pencil size={12} /> Edit
                                    </button>
                                    <button
                                        onClick={handleDeactivate}
                                        className="btn-destructive text-[12px]"
                                    >
                                        <Trash2 size={12} /> Deactivate
                                    </button>
                                </div>
                            </div>

                            {/* Active Metrics */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                    <div className="section-label mb-1.5 flex items-center gap-1.5">
                                        <DollarSign size={12} /> Max Budget
                                    </div>
                                    <div className="text-2xl font-extrabold text-[#F8FAFC]">${policy.maxBudget}.00</div>
                                    <div className="text-[11px] text-[#64748B] mt-1">Per evaluation cycle</div>
                                </div>

                                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                    <div className="section-label mb-1.5 flex items-center gap-1.5">
                                        <Layers size={12} /> Category Scope
                                    </div>
                                    <div className="text-2xl font-extrabold text-[#F8FAFC] capitalize">
                                        {policy.category || 'All Categories'}
                                    </div>
                                    <div className="text-[11px] text-[#64748B] mt-1">Strict allowlist</div>
                                </div>

                                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                    <div className="section-label mb-1.5 flex items-center gap-1.5">
                                        <Clock size={12} /> Time Window
                                    </div>
                                    <div className="text-2xl font-extrabold text-[#F8FAFC]">{policy.timeWindow} Hours</div>
                                    <div className="text-[11px] text-[#64748B] mt-1">Rolling validity window</div>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* Policy Configuration Form */}
                    {isCreating && (
                        <div className="glass-card p-6 space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/25 text-[#8B5CF6]">
                                        <Sliders size={18} />
                                    </div>
                                    <div>
                                        <span className="section-label">Policy Configuration</span>
                                        <div className="text-lg font-bold text-[#F8FAFC]">
                                            {policy.active ? 'Edit Enforcement Rules' : 'Create New Spending Policy'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSavePolicy} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-semibold text-[#94A3B8] flex items-center gap-1">
                                            <span>Maximum Budget Limit</span>
                                            <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] text-sm font-semibold">$</span>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                step="1"
                                                value={budget}
                                                onChange={(e) => setBudget(e.target.value)}
                                                className="glass-input text-base font-medium pl-8"
                                                placeholder="50"
                                            />
                                        </div>
                                        <span className="text-[11px] text-[#64748B]">Total allowed per autonomous batch.</span>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[12px] font-semibold text-[#94A3B8] flex items-center gap-1">
                                            <span>Authorized Category</span>
                                            <span className="text-red-400">*</span>
                                        </label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="glass-select text-base font-medium"
                                        >
                                            <option value="groceries">Groceries</option>
                                            <option value="electronics">Electronics</option>
                                            <option value="subscriptions">Subscriptions</option>
                                            <option value="office supplies">Office Supplies</option>
                                        </select>
                                        <span className="text-[11px] text-[#64748B]">Purchases outside will be blocked.</span>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[12px] font-semibold text-[#94A3B8] flex items-center gap-1">
                                            <span>Validity Window</span>
                                            <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                value={hours}
                                                onChange={(e) => setHours(e.target.value)}
                                                className="glass-input text-base font-medium pr-12"
                                                placeholder="2"
                                            />
                                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] text-[12px] font-medium">hrs</span>
                                        </div>
                                        <span className="text-[11px] text-[#64748B]">Time window duration.</span>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
                                    {policy.active && (
                                        <button
                                            type="button"
                                            onClick={() => setIsCreating(false)}
                                            className="btn-secondary"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button type="submit" className="btn-primary">
                                        <Check size={14} />
                                        <span>Save & Enforce Policy</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Policy History */}
                    <div className="glass-card p-6 space-y-4">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.08]">
                            <History size={16} className="text-[#5B8CFF]" />
                            <h3 className="text-[15px] font-bold text-[#F8FAFC]">Policy Audit & History</h3>
                        </div>

                        {policyHistory.length === 0 ? (
                            <p className="text-[13px] text-[#64748B] py-4 text-center">No policy history changes recorded.</p>
                        ) : (
                            <div className="relative space-y-4 pt-2">
                                <div className="absolute left-[9px] top-3 bottom-3 w-px bg-white/10" />

                                {policyHistory.map((item, idx) => (
                                    <div key={item.id || idx} className="flex items-start gap-4 relative">
                                        <div className="h-5 w-5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center flex-shrink-0 mt-0.5 z-10">
                                            <div className="h-1.5 w-1.5 rounded-full bg-[#5B8CFF]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[13px] font-semibold text-[#F8FAFC]">{item.title}</span>
                                                <span className="text-[11px] text-[#64748B] mono">{formatTime(item.timestamp)}</span>
                                            </div>
                                            <p className="text-[12px] text-[#94A3B8] mt-0.5">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Col: Access Control & Overrides */}
                <div className="space-y-6">
                    <OverridePanel />

                    {/* Policy Info Card */}
                    <div className="glass-card p-5 space-y-3">
                        <span className="section-label">How GuardRail Works</span>
                        <p className="text-[13px] text-[#94A3B8] leading-relaxed">
                            Every time an autonomous agent submits a checkout payload, GuardRail evaluates:
                        </p>
                        <ul className="space-y-2 text-[12px] text-[#64748B]">
                            <li className="flex items-start gap-2">
                                <Check size={14} className="text-[#22C55E] flex-shrink-0 mt-0.5" />
                                <span>Agent cryptographic authority & revocation status</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Check size={14} className="text-[#22C55E] flex-shrink-0 mt-0.5" />
                                <span>Cumulative spending against configured budget limits</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Check size={14} className="text-[#22C55E] flex-shrink-0 mt-0.5" />
                                <span>Category allowlist conformance</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Check size={14} className="text-[#22C55E] flex-shrink-0 mt-0.5" />
                                <span>Time-bound window expiration</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PoliciesPage;
