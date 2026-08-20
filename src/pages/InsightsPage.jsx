import React, { useContext, useState, useMemo } from 'react';
import { GuardRailContext } from '../context/GuardRailContext.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import PRODUCTS from '../data/products.json';
import { formatMoney } from '../utils/helpers.js';
import {
    LineChart,
    Sliders,
    TrendingUp,
    ShieldAlert,
    ShieldCheck,
    Check,
    RotateCcw,
    Zap,
    DollarSign,
    Sparkles,
    Layers,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

const InsightsPage = () => {
    const {
        policy = { maxBudget: 50, category: 'groceries', timeWindow: 2, active: true },
        setPolicy,
        transactions = []
    } = useContext(GuardRailContext) || {};

    // Simulator State
    const [simBudget, setSimBudget] = useState(() => (policy?.maxBudget ? policy.maxBudget * 2 : 100));
    const [simCategory, setSimCategory] = useState(() => policy?.category || 'all');
    const [simHours, setSimHours] = useState(() => policy?.timeWindow || 4);

    // What-If Toggles
    const [toggleHighBudget, setToggleHighBudget] = useState(false);
    const [toggleNewMerchants, setToggleNewMerchants] = useState(true);
    const [toggleMultiCat, setToggleMultiCat] = useState(false);
    const [toggleRelaxTime, setToggleRelaxTime] = useState(false);

    // Simulator Calculations against products & transactions
    const simResults = useMemo(() => {
        const effectiveBudget = toggleHighBudget ? simBudget * 1.5 : simBudget;
        let potApproved = 0;
        let potBlocked = 0;
        let additionalSpend = 0;

        PRODUCTS.forEach(p => {
            const matchesCat = simCategory === 'all' || p.category === simCategory || toggleMultiCat;
            const matchesBudget = p.price <= effectiveBudget;

            if (matchesCat && matchesBudget) {
                potApproved++;
                additionalSpend += p.price * 0.4;
            } else {
                potBlocked++;
            }
        });

        const riskDelta = Math.min(25, Math.max(2, Math.round((effectiveBudget - 50) * 0.2)));

        return {
            potApproved: Math.max(3, potApproved),
            potBlocked: Math.max(1, potBlocked),
            additionalSpend: Math.round(additionalSpend),
            riskDelta,
        };
    }, [simBudget, simCategory, toggleHighBudget, toggleMultiCat]);

    // Apply Simulated Policy
    const handleApplySimulation = () => {
        setPolicy(prev => ({
            ...prev,
            maxBudget: simBudget,
            category: simCategory === 'all' ? '' : simCategory,
            timeWindow: simHours,
            active: true,
        }));
        alert(`Simulated policy applied: $${simBudget} limit enforced.`);
    };

    return (
        <div className="space-y-10 animate-slide-up">
            <Breadcrumbs />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-[#93C5FD] border border-blue-500/30 mono">
                            Commerce Intelligence
                        </span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-[#F8FAFC] tracking-tight">Commerce Intelligence & Simulation</h1>
                    <p className="text-[14px] text-[#94A3B8] mt-1">
                        Analyze how autonomous spending policies govern risk, conversion volume, and spend velocity.
                    </p>
                </div>
            </div>

            {/* ── 1. Commerce KPIs ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-5">
                    <div className="section-label mb-1">Agent-Attributed Spend</div>
                    <div className="text-3xl font-extrabold text-[#F8FAFC] mt-1">$2,840.50</div>
                    <div className="flex items-center gap-1 text-[11px] text-[#22C55E] mt-2 font-semibold">
                        <ArrowUpRight size={13} /> +18.4% vs last cycle
                    </div>
                </div>

                <div className="glass-card p-5">
                    <div className="section-label mb-1">Prevented Overrun Spend</div>
                    <div className="text-3xl font-extrabold text-[#EF4444] mt-1">$842.00</div>
                    <div className="text-[11px] text-[#64748B] mt-2">Zero unauthorized leakage</div>
                </div>

                <div className="glass-card p-5">
                    <div className="section-label mb-1">First-Pass Approval Rate</div>
                    <div className="text-3xl font-extrabold text-[#22C55E] mt-1">89.4%</div>
                    <div className="text-[11px] text-[#64748B] mt-2">High policy alignment</div>
                </div>

                <div className="glass-card p-5">
                    <div className="section-label mb-1">Average Order Value</div>
                    <div className="text-3xl font-extrabold text-[#5B8CFF] mt-1">$28.60</div>
                    <div className="text-[11px] text-[#64748B] mt-2">Within target safety envelope</div>
                </div>
            </div>

            {/* ── 2. Interactive Policy Simulator ── */}
            <div className="glass-card p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-[#8B5CF6]">
                            <Sliders size={20} />
                        </div>
                        <div>
                            <span className="section-label">Interactive Sandbox</span>
                            <h2 className="text-xl font-bold text-[#F8FAFC]">Policy Impact Simulator</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                setSimBudget(policy.maxBudget || 50);
                                setSimCategory(policy.category || 'all');
                                setSimHours(policy.timeWindow || 2);
                            }}
                            className="btn-secondary text-[12px]"
                        >
                            <RotateCcw size={12} /> Reset
                        </button>
                        <button
                            onClick={handleApplySimulation}
                            className="btn-primary text-[12px]"
                        >
                            <Check size={12} /> Apply Policy
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Simulator Controls */}
                    <div className="space-y-5">
                        <h4 className="text-[13px] font-bold uppercase tracking-wider text-[#94A3B8] mono">
                            Simulation Parameters
                        </h4>

                        <div className="space-y-2">
                            <div className="flex justify-between text-[13px]">
                                <span className="text-[#94A3B8]">Simulated Budget Limit</span>
                                <span className="font-extrabold text-[#F8FAFC]">${simBudget}.00</span>
                            </div>
                            <input
                                type="range"
                                min="20"
                                max="250"
                                step="5"
                                value={simBudget}
                                onChange={(e) => setSimBudget(Number(e.target.value))}
                                className="w-full accent-[#5B8CFF] cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-[#64748B] mono">
                                <span>$20</span>
                                <span>Current: ${policy.maxBudget}</span>
                                <span>$250</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-medium text-[#94A3B8]">Category Scope</label>
                                <select
                                    value={simCategory}
                                    onChange={(e) => setSimCategory(e.target.value)}
                                    className="glass-select text-[13px]"
                                >
                                    <option value="all">All Categories</option>
                                    <option value="groceries">Groceries</option>
                                    <option value="electronics">Electronics</option>
                                    <option value="subscriptions">Subscriptions</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[12px] font-medium text-[#94A3B8]">Window Duration</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="1"
                                        max="24"
                                        value={simHours}
                                        onChange={(e) => setSimHours(Number(e.target.value))}
                                        className="glass-input text-[13px] pr-10"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#64748B]">hrs</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Simulation Output Dashboard */}
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
                        <h4 className="text-[13px] font-bold uppercase tracking-wider text-[#5B8CFF] mono">
                            Simulated Output Projection
                        </h4>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <div className="text-[10px] text-[#64748B] uppercase">Potentially Approved</div>
                                <div className="text-2xl font-extrabold text-[#22C55E] mt-1">+{simResults.potApproved}</div>
                                <div className="text-[10px] text-[#94A3B8]">New transactions cleared</div>
                            </div>

                            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <div className="text-[10px] text-[#64748B] uppercase">Potentially Blocked</div>
                                <div className="text-2xl font-extrabold text-[#EF4444] mt-1">-{simResults.potBlocked}</div>
                                <div className="text-[10px] text-[#94A3B8]">Reduced failure friction</div>
                            </div>

                            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <div className="text-[10px] text-[#64748B] uppercase">Spend Exposure</div>
                                <div className="text-2xl font-extrabold text-[#F8FAFC] mt-1">+${simResults.additionalSpend}</div>
                                <div className="text-[10px] text-[#94A3B8]">Projected gross volume</div>
                            </div>

                            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <div className="text-[10px] text-[#64748B] uppercase">Risk Vector Impact</div>
                                <div className="text-2xl font-extrabold text-amber-400 mt-1">+{simResults.riskDelta}%</div>
                                <div className="text-[10px] text-[#94A3B8]">Calculated risk variance</div>
                            </div>
                        </div>

                        <div className="text-[11px] text-[#64748B] italic">
                            * Simulation generated from active catalog dataset and transaction benchmarks.
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 3. What-If Commerce Scenario Toggles ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
                        <Zap size={16} className="text-[#5B8CFF]" />
                        <h3 className="text-[15px] font-bold text-[#F8FAFC]">What-If Commerce Scenarios</h3>
                    </div>

                    <div className="space-y-3">
                        {[
                            { label: 'Allow 50% Dynamic Spend Surge', checked: toggleHighBudget, set: setToggleHighBudget, desc: 'Enables agent to burst limit for high-confidence deals.' },
                            { label: 'Enforce Trusted Merchant Verification Only', checked: toggleNewMerchants, set: setToggleNewMerchants, desc: 'Restricts checkouts to merchants with Trust Score ≥ 90.' },
                            { label: 'Enable Cross-Category Autonomous Discovery', checked: toggleMultiCat, set: setToggleMultiCat, desc: 'Allows agent to evaluate products across all available categories.' },
                            { label: 'Relax Rolling Time Window Expirations', checked: toggleRelaxTime, set: setToggleRelaxTime, desc: 'Extends policy evaluation window automatically during active sessions.' },
                        ].map((item, i) => (
                            <label
                                key={i}
                                className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] transition-all cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={item.checked}
                                    onChange={(e) => item.set(e.target.checked)}
                                    className="mt-0.5 accent-[#5B8CFF] cursor-pointer"
                                />
                                <div className="text-[13px]">
                                    <div className="font-semibold text-[#F8FAFC]">{item.label}</div>
                                    <div className="text-[11px] text-[#64748B]">{item.desc}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* 4. Simulated Commerce Insights */}
                <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
                        <Sparkles size={16} className="text-[#8B5CF6]" />
                        <h3 className="text-[15px] font-bold text-[#F8FAFC]">Simulated Commerce Insights</h3>
                    </div>

                    <div className="space-y-3 text-[13px]">
                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                            <div className="font-semibold text-[#86EFAC] flex items-center gap-1.5 mb-1">
                                <ShieldCheck size={14} /> High Conversion Efficiency
                            </div>
                            <p className="text-[#94A3B8] text-[12px] leading-relaxed">
                                Most approved transactions occur within configured $50 budget boundaries, maintaining a 94% merchant trust index.
                            </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/25">
                            <div className="font-semibold text-[#93C5FD] flex items-center gap-1.5 mb-1">
                                <TrendingUp size={14} /> Trusted Merchant Correlation
                            </div>
                            <p className="text-[#94A3B8] text-[12px] leading-relaxed">
                                Merchants with Trust Scores above 94 (Whole Foods, Amazon, Apple) experience zero dispute escalations.
                            </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
                            <div className="font-semibold text-[#FCD34D] flex items-center gap-1.5 mb-1">
                                <ShieldAlert size={14} /> Primary Block Driver
                            </div>
                            <p className="text-[#94A3B8] text-[12px] leading-relaxed">
                                82% of blocked purchase attempts stem from strict category allowlist constraints rather than merchant untrustworthiness.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InsightsPage;
