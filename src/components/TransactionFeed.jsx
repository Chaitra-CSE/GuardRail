import React, { useContext, useState } from 'react';
import { GuardRailContext } from '../context/GuardRailContext.jsx';
import TransactionCard from './TransactionCard.jsx';
import { runShoppingAgent } from '../agents/shoppingAgent.js';
import { runGuardrailAgent } from '../agents/guardrailAgent.js';
import { Activity, Play, Loader } from 'lucide-react';

const TransactionFeed = () => {
    const {
        policy, transactions, addTransaction,
        agentRevoked, setPendingEscalation
    } = useContext(GuardRailContext);

    const [isRunning, setIsRunning] = useState(false);
    const [policyError, setPolicyError] = useState(false);

    const runAgent = async () => {
        if (!policy.active) {
            setPolicyError(true);
            setTimeout(() => setPolicyError(false), 3000);
            return;
        }
        setPolicyError(false);
        setIsRunning(true);

        await new Promise(r => setTimeout(r, 600));

        const result = runShoppingAgent('order groceries', policy);
        if (result.items.length === 0) { setIsRunning(false); return; }

        const transaction = {
            items: result.items,
            total: result.total,
            category: policy.category,
            merchant: result.items[0]?.name || 'unknown',
            timestamp: Date.now(),
        };

        const { decision, reason } = runGuardrailAgent(transaction, policy, agentRevoked);
        if (decision === 'ESCALATE') {
            new Promise(resolve => setPendingEscalation({ transaction, resolve }));
        }

        addTransaction({ ...transaction, decision, reason, timestamp: Date.now() });
        setIsRunning(false);
    };

    return (
        <div className="glass-card overflow-hidden">
            {/* Header */}
            <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
                <div className="flex items-center gap-2.5">
                    <Activity size={15} color="#64748B" />
                    <span className="section-label">Transaction Activity</span>
                    <span
                        className="rounded-md px-2 py-0.5 text-[11px] font-medium mono"
                        style={{ background: 'rgba(255,255,255,0.06)', color: '#64748B' }}
                    >
                        {transactions.length}
                    </span>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <button
                        onClick={runAgent}
                        disabled={isRunning}
                        className="btn-primary"
                        style={{ fontSize: '12px', padding: '7px 14px' }}
                    >
                        {isRunning
                            ? <><Loader size={12} className="animate-spin" /> Running...</>
                            : <><Play size={12} fill="white" /> Run Shopping Agent</>
                        }
                    </button>
                    {policyError && (
                        <span className="text-[11px] font-medium" style={{ color: '#EF4444' }}>
                            Activate a policy first
                        </span>
                    )}
                </div>
            </div>

            {/* Feed */}
            <div className="p-4 space-y-3 max-h-[520px] overflow-y-auto">
                {transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                        <div
                            className="flex h-12 w-12 items-center justify-center rounded-full mb-4"
                            style={{ background: 'rgba(91,140,255,0.08)', border: '1px solid rgba(91,140,255,0.15)' }}
                        >
                            <Activity size={20} color="#5B8CFF" />
                        </div>
                        <p className="text-[14px] font-medium text-[#94A3B8] mb-1">No transactions yet</p>
                        <p className="text-[12px] text-[#64748B] max-w-xs">
                            Activate a spending policy and run the shopping agent to generate transaction activity.
                        </p>
                    </div>
                ) : (
                    transactions.map((tx, idx) => (
                        <TransactionCard key={idx} tx={tx} />
                    ))
                )}
            </div>
        </div>
    );
};

export default TransactionFeed;