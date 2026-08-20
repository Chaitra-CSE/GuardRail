import React, { useContext, useState, useMemo } from 'react';
import { GuardRailContext } from '../context/GuardRailContext.jsx';
import { useSearchParams, Link } from '../router/index.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import TransactionDrawer from '../components/TransactionDrawer.jsx';
import { formatMoney, formatTime } from '../utils/helpers.js';
import {
    ArrowLeftRight,
    Search,
    Filter,
    Play,
    Loader,
    Check,
    X,
    AlertTriangle,
    ShoppingBag,
    Tag,
    Clock,
    ChevronRight,
    Store,
    Bot,
    Shield
} from 'lucide-react';

const TransactionsPage = () => {
    const {
        transactions = [],
        policy = { maxBudget: 50, category: 'groceries', timeWindow: 2, active: true },
        agentRevoked = false
    } = useContext(GuardRailContext) || {};

    const [searchParams, setSearchParams] = useSearchParams();
    const currentStatusFilter = searchParams.get('status') || 'all';

    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [merchantFilter, setMerchantFilter] = useState('all');
    const [riskFilter, setRiskFilter] = useState('all');
    const [selectedTx, setSelectedTx] = useState(null);

    // Filter counts
    const approvedCount = (transactions || []).filter(t => t.decision === 'APPROVED').length;
    const blockedCount = (transactions || []).filter(t => t.decision === 'DENIED').length;
    const pendingCount = (transactions || []).filter(t => t.decision === 'ESCALATE').length;

    const handleSetStatusFilter = (status) => {
        if (status === 'all') {
            searchParams.delete('status');
            setSearchParams(searchParams);
        } else {
            setSearchParams({ ...Object.fromEntries(searchParams.entries()), status });
        }
    };

    // Filtered transactions
    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            if (currentStatusFilter === 'approved' && tx.decision !== 'APPROVED') return false;
            if (currentStatusFilter === 'blocked' && tx.decision !== 'DENIED') return false;
            if (currentStatusFilter === 'pending' && tx.decision !== 'ESCALATE') return false;

            if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;
            if (merchantFilter !== 'all' && tx.merchant !== merchantFilter) return false;
            if (riskFilter !== 'all' && tx.riskLevel !== riskFilter) return false;

            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const merchantMatch = tx.merchant?.toLowerCase().includes(q);
                const itemMatch = tx.items?.some(i => i.name.toLowerCase().includes(q));
                const reasonMatch = tx.reason?.toLowerCase().includes(q);
                const catMatch = tx.category?.toLowerCase().includes(q);
                if (!merchantMatch && !itemMatch && !reasonMatch && !catMatch) return false;
            }

            return true;
        });
    }, [transactions, currentStatusFilter, categoryFilter, merchantFilter, riskFilter, searchQuery]);

    // Unique merchants
    const uniqueMerchants = useMemo(() => {
        const set = new Set(transactions.map(t => t.merchant).filter(Boolean));
        return Array.from(set);
    }, [transactions]);

    return (
        <div className="space-y-8 animate-slide-up">
            <Breadcrumbs />

            {/* Slide Drawer */}
            <TransactionDrawer transaction={selectedTx} onClose={() => setSelectedTx(null)} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#F8FAFC] tracking-tight">Autonomous Transactions</h1>
                    <p className="text-[14px] text-[#94A3B8] mt-1">
                        Inspect purchase intents, risk scores, and deterministic governance decisions in real time.
                    </p>
                </div>

                <Link to="/agent-commerce" className="btn-primary self-start sm:self-auto">
                    <Bot size={14} />
                    <span>Launch Shopping Mission</span>
                </Link>
            </div>

            {/* ── KPI Status Cards (Interactive Filters) ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {[
                    { label: 'Total Invocations', count: transactions.length, status: 'all', color: '#5B8CFF', border: 'rgba(91,140,255,0.3)' },
                    { label: 'Approved & Cleared', count: approvedCount, status: 'approved', color: '#22C55E', border: 'rgba(34,197,94,0.3)' },
                    { label: 'Blocked & Prevented', count: blockedCount, status: 'blocked', color: '#EF4444', border: 'rgba(239,68,68,0.3)' },
                    { label: 'Review Escalations', count: pendingCount, status: 'pending', color: '#F59E0B', border: 'rgba(245,158,11,0.3)' },
                ].map(stat => {
                    const isSelected = currentStatusFilter === stat.status;
                    return (
                        <button
                            key={stat.status}
                            onClick={() => handleSetStatusFilter(stat.status)}
                            className={`p-4 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                                isSelected
                                    ? 'bg-white/[0.08] shadow-[0_0_20px_rgba(91,140,255,0.15)] ring-1'
                                    : 'bg-white/[0.03] hover:bg-white/[0.06]'
                            }`}
                            style={{
                                border: `1px solid ${isSelected ? stat.border : 'rgba(255,255,255,0.08)'}`,
                            }}
                        >
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">{stat.label}</div>
                            <div className="text-2xl font-extrabold mt-1" style={{ color: stat.color }}>{stat.count}</div>
                            <div className="text-[10px] text-[#64748B] mt-1">Filter list view</div>
                        </button>
                    );
                })}
            </div>

            {/* ── Toolbar: Search & Multi-Filters ── */}
            <div className="glass-card p-4 space-y-3">
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                    {/* Search Bar */}
                    <div className="relative w-full md:max-w-md">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                        <input
                            type="text"
                            placeholder="Search by merchant, product, or rule..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="glass-input pl-9 text-[13px]"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Status Tabs */}
                    <div className="flex p-1 rounded-lg bg-white/[0.04] border border-white/[0.08] w-full md:w-auto overflow-x-auto">
                        {[
                            { label: 'All', value: 'all' },
                            { label: 'Approved', value: 'approved' },
                            { label: 'Blocked', value: 'blocked' },
                            { label: 'Pending', value: 'pending' },
                        ].map(tab => (
                            <button
                                key={tab.value}
                                onClick={() => handleSetStatusFilter(tab.value)}
                                className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                                    currentStatusFilter === tab.value
                                        ? 'bg-[#5B8CFF] text-white shadow-sm font-semibold'
                                        : 'text-[#94A3B8] hover:text-white'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Secondary Filters: Category, Merchant, Risk */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06] text-[12px]">
                    <div className="flex items-center gap-1.5 text-[#64748B]">
                        <Filter size={13} />
                        <span>Filter by:</span>
                    </div>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="glass-select py-1.5 px-2.5 w-auto text-[12px]"
                    >
                        <option value="all">All Categories</option>
                        <option value="groceries">Groceries</option>
                        <option value="electronics">Electronics</option>
                        <option value="subscriptions">Subscriptions</option>
                    </select>

                    <select
                        value={merchantFilter}
                        onChange={(e) => setMerchantFilter(e.target.value)}
                        className="glass-select py-1.5 px-2.5 w-auto text-[12px]"
                    >
                        <option value="all">All Merchants</option>
                        {uniqueMerchants.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>

                    <select
                        value={riskFilter}
                        onChange={(e) => setRiskFilter(e.target.value)}
                        className="glass-select py-1.5 px-2.5 w-auto text-[12px]"
                    >
                        <option value="all">All Risk Levels</option>
                        <option value="LOW">Low Risk (Score ≥80)</option>
                        <option value="MODERATE">Moderate Risk</option>
                        <option value="HIGH">High Risk</option>
                    </select>
                </div>
            </div>

            {/* ── Transaction List ── */}
            <div className="glass-card overflow-hidden">
                {filteredTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                        <ShoppingBag size={24} className="text-[#64748B] mb-2" />
                        <h3 className="text-base font-bold text-[#F8FAFC]">No matching transactions found</h3>
                        <p className="text-[13px] text-[#94A3B8] max-w-sm mt-1 mb-5">
                            Adjust your active search query or filters to browse more records.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/[0.06]">
                        {filteredTransactions.map((tx) => {
                            const isApp = tx.decision === 'APPROVED';
                            const isDen = tx.decision === 'DENIED';
                            const score = tx.score || (isApp ? 94 : 35);
                            const riskLevel = tx.riskLevel || (score >= 80 ? 'LOW' : score >= 60 ? 'MODERATE' : 'HIGH');

                            return (
                                <div
                                    key={tx.id}
                                    onClick={() => setSelectedTx(tx)}
                                    className="p-4 sm:p-5 hover:bg-white/[0.04] transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                >
                                    <div className="flex items-start gap-3.5 min-w-0">
                                        <div
                                            className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                                            style={{
                                                background: isApp ? 'rgba(34,197,94,0.12)' : isDen ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                                                border: `1px solid ${isApp ? 'rgba(34,197,94,0.25)' : isDen ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
                                            }}
                                        >
                                            <ShoppingBag size={18} color={isApp ? '#22C55E' : isDen ? '#EF4444' : '#F59E0B'} />
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[15px] font-bold text-[#F8FAFC] group-hover:text-[#5B8CFF] transition-colors truncate">
                                                    {tx.items?.[0]?.name || tx.merchant}
                                                </span>
                                                <span className="text-[11px] text-[#64748B] mono">ID: {tx.id?.substring(0, 8)}</span>
                                            </div>

                                            <p className="text-[13px] text-[#94A3B8] mt-0.5 line-clamp-1">
                                                {tx.reason}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#64748B] mt-2">
                                                <span className="flex items-center gap-1 text-[#93C5FD] font-medium">
                                                    <Store size={11} /> {tx.merchant}
                                                </span>
                                                <span className="opacity-30">·</span>
                                                <span className="capitalize">{tx.category}</span>
                                                <span className="opacity-30">·</span>
                                                <span className="mono">Score: <strong className="text-white">{score}/100</strong> ({riskLevel})</span>
                                                <span className="opacity-30">·</span>
                                                <span>{formatTime(tx.timestamp)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Amount & Status Badge */}
                                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                                        <div className="text-lg font-extrabold text-[#F8FAFC]">
                                            {formatMoney(tx.total)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`badge-base ${
                                                    isApp ? 'badge-approve' : isDen ? 'badge-deny' : 'badge-escalate'
                                                }`}
                                            >
                                                {isApp ? <Check size={11} strokeWidth={3} /> : isDen ? <X size={11} strokeWidth={3} /> : <AlertTriangle size={11} strokeWidth={3} />}
                                                {isApp ? 'Approved' : isDen ? 'Blocked' : 'Review'}
                                            </span>
                                            <ChevronRight size={15} className="text-[#64748B] group-hover:text-white group-hover:translate-x-0.5 transition-all hidden sm:block" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionsPage;
