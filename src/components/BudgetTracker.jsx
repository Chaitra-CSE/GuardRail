import React, { useContext } from 'react';
import { GuardRailContext } from '../context/GuardRailContext.jsx';
import { formatMoney } from '../utils/helpers.js';

const BudgetTracker = () => {
    const { policy, transactions } = useContext(GuardRailContext);

    const spent = transactions
        .filter(t => t.decision === 'APPROVED')
        .reduce((acc, t) => acc + t.total, 0);

    const budget = policy.active ? policy.maxBudget : 0;
    const remaining = Math.max(0, budget - spent);
    const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;

    const accentColor = pct >= 90 ? '#EF4444' : pct >= 70 ? '#F59E0B' : '#5B8CFF';
    const glowColor = pct >= 90 ? 'rgba(239,68,68,0.4)' : pct >= 70 ? 'rgba(245,158,11,0.4)' : 'rgba(91,140,255,0.4)';

    // Arc SVG parameters
    const r = 40;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;

    return (
        <div className="glass-card p-4">
            <div className="section-label mb-4">Budget</div>

            <div className="flex items-center gap-4">
                {/* Circular progress */}
                <div className="relative flex-shrink-0" style={{ width: 90, height: 90 }}>
                    <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform: 'rotate(-90deg)' }}>
                        {/* Track */}
                        <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                        {/* Fill */}
                        <circle
                            cx="45" cy="45" r={r}
                            fill="none"
                            stroke={accentColor}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={circ}
                            strokeDashoffset={offset}
                            style={{
                                filter: `drop-shadow(0 0 4px ${accentColor})`,
                                transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease',
                            }}
                        />
                    </svg>
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[15px] font-bold text-[#F8FAFC]">{pct.toFixed(0)}%</span>
                        <span className="text-[9px] text-[#64748B] mono">used</span>
                    </div>
                </div>

                {/* Values */}
                <div className="flex-1 space-y-2">
                    <div>
                        <div className="text-[11px] text-[#64748B] mb-0.5">Spent</div>
                        <div className="text-lg font-bold text-[#F8FAFC]">{formatMoney(spent)}</div>
                    </div>
                    <div
                        className="h-px w-full"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                    />
                    <div className="flex justify-between items-center text-[12px]">
                        <span className="text-[#64748B]">Limit</span>
                        <span className="text-[#94A3B8] font-medium">{formatMoney(budget)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px]">
                        <span className="text-[#64748B]">Remaining</span>
                        <span style={{ color: accentColor, fontWeight: 600 }}>{formatMoney(remaining)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetTracker;