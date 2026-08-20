import React, { useContext } from 'react';
import { GuardRailContext } from '../context/GuardRailContext.jsx';
import { BarChart3, TrendingUp } from 'lucide-react';
import { formatMoney } from '../utils/helpers.js';

const Bar = ({ pct, color }) => (
    <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
            className="h-full rounded-full"
            style={{
                width: `${pct}%`,
                background: color,
                boxShadow: `0 0 6px ${color}60`,
                transition: 'width 0.6s ease',
            }}
        />
    </div>
);

const ReconciliationChart = () => {
    const { transactions, policy } = useContext(GuardRailContext);

    const approved = transactions.filter(t => t.decision === 'APPROVED');
    const denied = transactions.filter(t => t.decision === 'DENIED');
    const escalated = transactions.filter(t => t.decision === 'ESCALATE');

    const approvedTotal = approved.reduce((a, t) => a + t.total, 0);
    const deniedTotal = denied.reduce((a, t) => a + t.total, 0);
    const total = approvedTotal + deniedTotal;
    const budget = policy.active ? policy.maxBudget : 50;

    const approvedPct = budget > 0 ? Math.min(100, (approvedTotal / budget) * 100) : 0;
    const deniedPct = total > 0 ? (deniedTotal / total) * 100 : 0;

    return (
        <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={15} color="#64748B" />
                <span className="section-label">Reconciliation</span>
            </div>

            {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-full mb-3"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        <TrendingUp size={16} color="#64748B" />
                    </div>
                    <p className="text-[12px] text-[#64748B]">No data yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Approved */}
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full" style={{ background: '#22C55E', boxShadow: '0 0 5px rgba(34,197,94,0.5)' }} />
                                <span className="text-[12px] text-[#94A3B8]">Approved</span>
                                <span className="text-[11px] text-[#64748B] mono">×{approved.length}</span>
                            </div>
                            <span className="text-[13px] font-semibold text-[#F8FAFC]">{formatMoney(approvedTotal)}</span>
                        </div>
                        <Bar pct={approvedPct} color="#22C55E" />
                    </div>

                    {/* Blocked */}
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full" style={{ background: '#EF4444', boxShadow: '0 0 5px rgba(239,68,68,0.5)' }} />
                                <span className="text-[12px] text-[#94A3B8]">Blocked</span>
                                <span className="text-[11px] text-[#64748B] mono">×{denied.length}</span>
                            </div>
                            <span className="text-[13px] font-semibold text-[#F8FAFC]">{formatMoney(deniedTotal)}</span>
                        </div>
                        <Bar pct={deniedPct} color="#EF4444" />
                    </div>

                    {/* Pending */}
                    {escalated.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full" style={{ background: '#F59E0B', boxShadow: '0 0 5px rgba(245,158,11,0.5)' }} />
                                    <span className="text-[12px] text-[#94A3B8]">Pending</span>
                                    <span className="text-[11px] text-[#64748B] mono">×{escalated.length}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Summary */}
                    <div
                        className="rounded-xl p-3 mt-1"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[11px] text-[#64748B]">Total decisions</span>
                            <span className="text-[13px] font-semibold text-[#F8FAFC] mono">{transactions.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] text-[#64748B]">Amount prevented</span>
                            <span className="text-[13px] font-semibold" style={{ color: '#EF4444' }}>{formatMoney(deniedTotal)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReconciliationChart;