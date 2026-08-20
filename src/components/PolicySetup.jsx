import React, { useContext, useState } from 'react';
import { GuardRailContext } from '../context/GuardRailContext.jsx';
import { Shield, Settings2, Pencil, Trash2 } from 'lucide-react';

const PolicySetup = () => {
    const { policy, setPolicy } = useContext(GuardRailContext);
    const [budget, setBudget] = useState(policy.maxBudget || '');
    const [category, setCategory] = useState(policy.category || 'groceries');
    const [hours, setHours] = useState(policy.timeWindow || '');
    const [isEditing, setIsEditing] = useState(!policy.active);

    const handleApply = (e) => {
        e.preventDefault();
        setPolicy({
            maxBudget: Number(budget),
            category,
            timeWindow: Number(hours),
            allowlist: [],
            blocklist: [],
            active: true,
            _startTime: Date.now(),
        });
        setIsEditing(false);
    };

    const handleDeactivate = () => {
        setPolicy({ ...policy, active: false });
        setIsEditing(true);
    };

    if (policy.active && !isEditing) {
        return (
            <div
                className="glass-card p-5"
                style={{ animation: 'border-glow 4s ease-in-out infinite' }}
            >
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <div
                            className="flex h-7 w-7 items-center justify-center rounded-lg"
                            style={{ background: 'rgba(91,140,255,0.15)', border: '1px solid rgba(91,140,255,0.25)' }}
                        >
                            <Shield size={14} color="#5B8CFF" />
                        </div>
                        <span className="section-label">Spending Policy</span>
                        <span
                            className="badge-base"
                            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#86EFAC' }}
                        >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.7)', animation: 'pulse-green 2.5s ease-in-out infinite', display: 'inline-block', flexShrink: 0 }} />
                            Active
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                        >
                            <Pencil size={12} /> Edit
                        </button>
                        <button
                            onClick={handleDeactivate}
                            className="btn-destructive"
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                        >
                            <Trash2 size={12} /> Deactivate
                        </button>
                    </div>
                </div>

                <div
                    className="grid grid-cols-3 gap-4 rounded-xl p-4"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                    {[
                        { label: 'Max Budget', value: `$${policy.maxBudget}` },
                        { label: 'Category', value: policy.category ? policy.category.charAt(0).toUpperCase() + policy.category.slice(1) : 'Any' },
                        { label: 'Time Window', value: `${policy.timeWindow}h` },
                    ].map(({ label, value }) => (
                        <div key={label}>
                            <div className="section-label mb-2">{label}</div>
                            <div className="text-xl font-bold text-[#F8FAFC] tracking-tight">{value}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-5">
            <div className="flex items-center gap-2.5 mb-5">
                <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                >
                    <Settings2 size={14} color="#64748B" />
                </div>
                <span className="section-label">Configure Policy</span>
            </div>

            <form onSubmit={handleApply} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-[12px] font-medium text-[#94A3B8]">Max Budget</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] text-sm">$</span>
                            <input
                                type="number" required min="1"
                                value={budget}
                                onChange={e => setBudget(e.target.value)}
                                className="glass-input"
                                style={{ paddingLeft: '24px' }}
                                placeholder="50"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[12px] font-medium text-[#94A3B8]">Category</label>
                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="glass-select"
                        >
                            <option value="groceries">Groceries</option>
                            <option value="electronics">Electronics</option>
                            <option value="subscriptions">Subscriptions</option>
                            <option value="">Any Category</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[12px] font-medium text-[#94A3B8]">Time Window</label>
                        <div className="relative">
                            <input
                                type="number" required min="1"
                                value={hours}
                                onChange={e => setHours(e.target.value)}
                                className="glass-input"
                                style={{ paddingRight: '36px' }}
                                placeholder="2"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] text-[12px]">hrs</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-1">
                    {policy.active && (
                        <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
                            Cancel
                        </button>
                    )}
                    <button type="submit" className="btn-primary">
                        {policy.active ? 'Save Changes' : 'Activate Policy'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PolicySetup;