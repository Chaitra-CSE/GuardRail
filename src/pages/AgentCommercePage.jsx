import React, { useContext, useState, useEffect } from 'react';
import { GuardRailContext } from '../context/GuardRailContext.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import PRODUCTS from '../data/products.json';
import MERCHANTS from '../data/merchants.json';
import { runGuardrailAgent } from '../agents/guardrailAgent.js';
import { formatMoney, formatTime } from '../utils/helpers.js';
import {
    Bot,
    Play,
    Loader,
    Check,
    X,
    AlertTriangle,
    Shield,
    ShieldCheck,
    ShoppingBag,
    Star,
    ExternalLink,
    Store,
    ArrowRight,
    Search,
    Zap,
    TrendingUp,
    Filter,
    Clock,
    Award
} from 'lucide-react';

const PIPELINE_STAGES = [
    { id: 'discovery', label: 'Discovery' },
    { id: 'eval', label: 'Product Evaluation' },
    { id: 'policy', label: 'Policy Check' },
    { id: 'merchant', label: 'Merchant Trust' },
    { id: 'risk', label: 'Risk Evaluation' },
    { id: 'decision', label: 'GuardRail Decision' },
    { id: 'checkout', label: 'Checkout' },
    { id: 'audit', label: 'Audit Log' },
];

const AgentCommercePage = () => {
    const {
        policy = { maxBudget: 50, category: 'groceries', timeWindow: 2, active: true },
        transactions = [],
        addTransaction,
        agentRevoked = false,
        agentActivityStream = [],
        addActivity,
        addAuditEvent
    } = useContext(GuardRailContext) || {};

    const [isMissionRunning, setIsMissionRunning] = useState(false);
    const [currentStageIdx, setCurrentStageIdx] = useState(-1);
    const [pipelineStatus, setPipelineStatus] = useState({}); // stageId: 'idle' | 'processing' | 'complete' | 'blocked'
    const [missionTask, setMissionTask] = useState('Find the best grocery deal under $50');
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [discoveredProducts, setDiscoveredProducts] = useState(() => (PRODUCTS || []).slice(0, 6));
    const [evaluationDrawer, setEvaluationDrawer] = useState(null);

    // Filter discovered products by current policy
    useEffect(() => {
        if (policy?.category && Array.isArray(PRODUCTS)) {
            const matches = PRODUCTS.filter(p => p.category === policy.category);
            const others = PRODUCTS.filter(p => p.category !== policy.category);
            setDiscoveredProducts([...matches.slice(0, 4), ...others.slice(0, 2)]);
        }
    }, [policy?.category]);

    // Mission Execution Orchestrator
    const handleStartMission = async () => {
        if (!policy.active) {
            alert('Please activate a spending policy in Policies first.');
            return;
        }

        setIsMissionRunning(true);
        setPipelineStatus({});
        addActivity(`Mission initiated: "${missionTask}"`, 'info');

        addAuditEvent({
            type: 'agent',
            title: 'Agent Mission Started',
            actor: 'Shopping Agent',
            guardrailEngine: 'Autonomous Commerce Engine',
            description: `Autonomous mission: "${missionTask}" targeting ${policy.category || 'all categories'} within $${policy.maxBudget} budget ceiling.`,
            status: 'ACTIVE',
        });

        // Stage 1: Discovery
        setCurrentStageIdx(0);
        setPipelineStatus({ discovery: 'processing' });
        await new Promise(r => setTimeout(r, 600));
        setPipelineStatus(prev => ({ ...prev, discovery: 'complete' }));
        addActivity('Discovered 6 product candidates matching query parameters', 'info');

        // Stage 2: Product Evaluation
        setCurrentStageIdx(1);
        setPipelineStatus(prev => ({ ...prev, eval: 'processing' }));
        await new Promise(r => setTimeout(r, 600));
        setPipelineStatus(prev => ({ ...prev, eval: 'complete' }));
        addActivity('Evaluating candidate specifications and price competitiveness', 'info');

        // Pick top product candidate
        const categoryPool = PRODUCTS.filter(p => p.category === (policy.category || 'groceries'));
        const chosenProduct = categoryPool.length > 0
            ? categoryPool[Math.floor(Math.random() * categoryPool.length)]
            : PRODUCTS[0];

        setSelectedCandidate(chosenProduct);

        // Stage 3: Policy Check
        setCurrentStageIdx(2);
        setPipelineStatus(prev => ({ ...prev, policy: 'processing' }));
        await new Promise(r => setTimeout(r, 500));
        const policyOk = chosenProduct.price <= policy.maxBudget && chosenProduct.category === policy.category;
        setPipelineStatus(prev => ({ ...prev, policy: policyOk ? 'complete' : 'blocked' }));
        addActivity(`Policy check: ${chosenProduct.name} ($${chosenProduct.price}) vs $${policy.maxBudget} limit`, policyOk ? 'success' : 'danger');

        // Stage 4: Merchant Trust
        setCurrentStageIdx(3);
        setPipelineStatus(prev => ({ ...prev, merchant: 'processing' }));
        await new Promise(r => setTimeout(r, 500));
        const merchantInfo = MERCHANTS[chosenProduct.merchant] || { trustScore: 90 };
        setPipelineStatus(prev => ({ ...prev, merchant: 'complete' }));
        addActivity(`Merchant Trust evaluated: ${chosenProduct.merchant} (Trust Score ${merchantInfo.trustScore}/100)`, 'info');

        // Stage 5: Risk Evaluation
        setCurrentStageIdx(4);
        setPipelineStatus(prev => ({ ...prev, risk: 'processing' }));
        await new Promise(r => setTimeout(r, 500));
        setPipelineStatus(prev => ({ ...prev, risk: 'complete' }));

        // Stage 6: GuardRail Decision
        setCurrentStageIdx(5);
        setPipelineStatus(prev => ({ ...prev, decision: 'processing' }));
        await new Promise(r => setTimeout(r, 600));

        const mockTx = {
            merchant: chosenProduct.merchant,
            items: [{ name: chosenProduct.name, price: chosenProduct.price }],
            total: chosenProduct.price,
            category: chosenProduct.category,
            timestamp: Date.now(),
        };

        const evalResult = runGuardrailAgent(mockTx, policy, agentRevoked);
        const isApproved = evalResult.decision === 'APPROVED';

        setPipelineStatus(prev => ({
            ...prev,
            decision: isApproved ? 'complete' : 'blocked',
            checkout: isApproved ? 'complete' : 'blocked',
            audit: 'complete',
        }));

        // Save transaction & record
        const saved = addTransaction({
            ...mockTx,
            decision: evalResult.decision,
            reason: evalResult.reason,
            score: evalResult.score,
            riskLevel: evalResult.riskLevel,
            checks: evalResult.checks,
            merchantInfo: evalResult.merchantInfo,
        });

        setIsMissionRunning(false);
        setEvaluationDrawer({ product: chosenProduct, evalResult: { ...evalResult, transaction: saved } });
    };

    // Evaluate single candidate from catalog
    const handleEvaluateCandidate = (product) => {
        const mockTx = {
            merchant: product.merchant,
            items: [{ name: product.name, price: product.price }],
            total: product.price,
            category: product.category,
            timestamp: Date.now(),
        };
        const evalResult = runGuardrailAgent(mockTx, policy, agentRevoked);
        setEvaluationDrawer({ product, evalResult: { ...evalResult, transaction: mockTx } });
    };

    return (
        <div className="space-y-10 animate-slide-up">
            <Breadcrumbs />

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-[#C4B5FD] border border-purple-500/30 mono">
                            Agentic Commerce Core
                        </span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-[#F8FAFC] tracking-tight">Agent Commerce</h1>
                    <p className="text-[14px] text-[#94A3B8] mt-1">
                        Monitor autonomous shopping missions from candidate discovery to checkout and governance.
                    </p>
                </div>
            </div>

            {/* ── 1. Mission Control Hero Card ── */}
            <section className="glass-card p-6 relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[#5B8CFF] mono">
                            <Bot size={15} />
                            <span>Autonomous Agent Mission Controller</span>
                        </div>
                        <h2 className="text-2xl font-bold text-[#F8FAFC]">
                            {missionTask}
                        </h2>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <div className="text-[10px] text-[#64748B] uppercase font-semibold">Budget Ceiling</div>
                                <div className="text-base font-extrabold text-[#F8FAFC]">${policy.maxBudget}.00</div>
                            </div>
                            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <div className="text-[10px] text-[#64748B] uppercase font-semibold">Scope</div>
                                <div className="text-base font-extrabold text-[#F8FAFC] capitalize">{policy.category || 'All'}</div>
                            </div>
                            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <div className="text-[10px] text-[#64748B] uppercase font-semibold">Window</div>
                                <div className="text-base font-extrabold text-[#F8FAFC]">{policy.timeWindow} Hours</div>
                            </div>
                            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <div className="text-[10px] text-[#64748B] uppercase font-semibold">Merchant Trust</div>
                                <div className="text-base font-extrabold text-[#22C55E]">Trusted Only</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-start lg:items-end gap-3 flex-shrink-0">
                        <button
                            onClick={handleStartMission}
                            disabled={isMissionRunning}
                            className="btn-primary py-3 px-6 text-sm"
                        >
                            {isMissionRunning ? (
                                <>
                                    <Loader size={16} className="animate-spin" />
                                    <span>Executing Commerce Pipeline...</span>
                                </>
                            ) : (
                                <>
                                    <Play size={15} fill="white" />
                                    <span>Start Autonomous Mission</span>
                                </>
                            )}
                        </button>
                        <span className="text-[11px] text-[#64748B]">Runs full 8-stage automated governance pipeline</span>
                    </div>
                </div>
            </section>

            {/* ── 2. Animated 8-Stage Commerce Pipeline ── */}
            <section className="glass-card p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2">
                        <Zap size={16} className="text-[#5B8CFF]" />
                        <h3 className="text-[15px] font-bold text-[#F8FAFC]">Agent Commerce Pipeline</h3>
                    </div>
                    <span className="text-[12px] text-[#94A3B8] mono">
                        {isMissionRunning ? 'Stage ' + (currentStageIdx + 1) + ' of 8 active' : 'Pipeline Standby'}
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-2">
                    {PIPELINE_STAGES.map((stage, idx) => {
                        const status = pipelineStatus[stage.id] || 'idle';
                        const isProcessing = status === 'processing';
                        const isComplete = status === 'complete';
                        const isBlocked = status === 'blocked';

                        return (
                            <div
                                key={stage.id}
                                className={`relative p-3 rounded-xl flex flex-col justify-between min-h-[96px] transition-all duration-300 ${
                                    isProcessing
                                        ? 'bg-blue-500/15 border border-blue-500/40 shadow-[0_0_15px_rgba(91,140,255,0.2)]'
                                        : isComplete
                                        ? 'bg-emerald-500/10 border border-emerald-500/30'
                                        : isBlocked
                                        ? 'bg-red-500/10 border border-red-500/30'
                                        : 'bg-white/[0.02] border border-white/[0.06] opacity-60'
                                }`}
                            >
                                <div className="flex items-center justify-between text-[10px] text-[#64748B] mono">
                                    <span>0{idx + 1}</span>
                                    {isProcessing && <Loader size={11} className="animate-spin text-[#5B8CFF]" />}
                                    {isComplete && <Check size={11} className="text-[#22C55E]" strokeWidth={3} />}
                                    {isBlocked && <X size={11} className="text-[#EF4444]" strokeWidth={3} />}
                                </div>

                                <div className="text-[12px] font-bold text-[#F8FAFC] mt-1 leading-tight">
                                    {stage.label}
                                </div>

                                <div className="mt-2">
                                    <span
                                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                            isProcessing
                                                ? 'bg-blue-500/30 text-[#93C5FD]'
                                                : isComplete
                                                ? 'bg-emerald-500/20 text-[#86EFAC]'
                                                : isBlocked
                                                ? 'bg-red-500/20 text-[#FCA5A5]'
                                                : 'text-[#64748B]'
                                        }`}
                                    >
                                        {isProcessing ? 'Processing' : isComplete ? 'Complete' : isBlocked ? 'Blocked' : 'Queued'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── 3. Product Discovery Grid & Live Activity Stream ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Product Discovery Catalog */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShoppingBag size={16} className="text-[#5B8CFF]" />
                            <h3 className="text-[16px] font-bold text-[#F8FAFC]">Autonomous Product Discovery</h3>
                        </div>
                        <span className="text-[12px] text-[#64748B]">{discoveredProducts.length} Candidates Discovered</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {discoveredProducts.map((prod) => {
                            const isWithinBudget = prod.price <= (policy.maxBudget || 50);
                            const isCategoryMatch = !policy.category || prod.category === policy.category;
                            const isPolicyMatch = isWithinBudget && isCategoryMatch;
                            const merchantInfo = MERCHANTS[prod.merchant] || { trustScore: 92 };

                            return (
                                <div
                                    key={prod.id}
                                    className="glass-card p-4 flex flex-col justify-between space-y-3 group hover:border-blue-500/30 transition-all duration-200"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="text-[11px] text-[#64748B] flex items-center gap-1">
                                                    <Store size={11} /> {prod.merchant}
                                                </div>
                                                <h4 className="text-[14px] font-bold text-[#F8FAFC] mt-0.5 line-clamp-1 group-hover:text-[#5B8CFF] transition-colors">
                                                    {prod.name}
                                                </h4>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="text-[15px] font-extrabold text-[#F8FAFC]">{formatMoney(prod.price)}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 mt-3 text-[11px]">
                                            <span className="flex items-center gap-1 text-amber-400 font-semibold">
                                                <Star size={11} fill="currentColor" /> {prod.rating}
                                            </span>
                                            <span className="text-[#64748B]">({prod.reviewsCount} reviews)</span>
                                            <span className="ml-auto text-[#22C55E] font-medium mono">Trust {merchantInfo.trustScore}/100</span>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                                        <span
                                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                                                isPolicyMatch
                                                    ? 'bg-emerald-500/15 text-[#86EFAC] border border-emerald-500/30'
                                                    : 'bg-red-500/15 text-[#FCA5A5] border border-red-500/30'
                                            }`}
                                        >
                                            {isPolicyMatch ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
                                            {isPolicyMatch ? 'Policy Compliant' : 'Violates Policy'}
                                        </span>

                                        <button
                                            onClick={() => handleEvaluateCandidate(prod)}
                                            className="btn-secondary text-[11px] py-1.5 px-3"
                                        >
                                            <span>Evaluate</span>
                                            <ArrowRight size={11} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Col: Live Agent Activity Stream */}
                <div className="glass-card p-5 flex flex-col justify-between space-y-4">
                    <div>
                        <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
                            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <h3 className="text-[14px] font-bold text-[#F8FAFC]">Live Agent Stream</h3>
                        </div>

                        <div className="mt-3 space-y-3 max-h-[380px] overflow-y-auto pr-1">
                            {agentActivityStream.map((act) => (
                                <div key={act.id} className="text-[12px] p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                                    <div className="flex items-center justify-between text-[10px] text-[#64748B] mono mb-1">
                                        <span>{formatTime(act.time)}</span>
                                        <span className="capitalize">{act.type}</span>
                                    </div>
                                    <p className="text-[#F8FAFC] leading-snug">{act.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-3 border-t border-white/[0.06] text-center text-[11px] text-[#64748B]">
                        Real-time deterministic agent telemetry
                    </div>
                </div>
            </div>

            {/* ── 4. Agent Performance & Commerce Conversion Funnel ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Agent Performance Card */}
                <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
                        <Award size={16} className="text-[#5B8CFF]" />
                        <h3 className="text-[15px] font-bold text-[#F8FAFC]">Agent Performance Metrics</h3>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                            <div className="text-[11px] text-[#64748B]">Shopping Missions</div>
                            <div className="text-2xl font-extrabold text-[#F8FAFC] mt-1">{transactions.length + 12}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                            <div className="text-[11px] text-[#64748B]">Successful Orders</div>
                            <div className="text-2xl font-extrabold text-[#22C55E] mt-1">
                                {transactions.filter(t => t.decision === 'APPROVED').length + 10}
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                            <div className="text-[11px] text-[#64748B]">Policy Compliance</div>
                            <div className="text-2xl font-extrabold text-[#5B8CFF] mt-1">94%</div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2 text-[12px]">
                        <div className="flex justify-between">
                            <span className="text-[#94A3B8]">Autonomous Approval Rate</span>
                            <span className="font-bold text-[#F8FAFC]">88%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#94A3B8]">Average Transaction Value</span>
                            <span className="font-bold text-[#F8FAFC]">$24.80</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#94A3B8]">Merchant Trust Verification</span>
                            <span className="font-bold text-[#22C55E]">100% Passed</span>
                        </div>
                    </div>
                </div>

                {/* Commerce Conversion Funnel */}
                <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
                        <TrendingUp size={16} className="text-[#8B5CF6]" />
                        <h3 className="text-[15px] font-bold text-[#F8FAFC]">Agent Commerce Conversion Funnel</h3>
                    </div>

                    <div className="space-y-3 pt-1">
                        {[
                            { label: 'Discovery Pool', pct: 100, count: '100%', color: '#5B8CFF' },
                            { label: 'Product Evaluation', pct: 76, count: '76%', color: '#6366F1' },
                            { label: 'Policy Clearance', pct: 64, count: '64%', color: '#8B5CF6' },
                            { label: 'Checkout Intent', pct: 52, count: '52%', color: '#A855F7' },
                            { label: 'Completed Purchase', pct: 44, count: '44%', color: '#22C55E' },
                        ].map((step, idx) => (
                            <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-[#94A3B8] font-medium">{step.label}</span>
                                    <span className="font-bold text-[#F8FAFC] mono">{step.count}</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${step.pct}%`, background: step.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── 5. Product Evaluation Inspection Drawer ── */}
            {evaluationDrawer && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div
                        className="fixed inset-0 bg-[#070B14]/80 backdrop-blur-sm"
                        onClick={() => setEvaluationDrawer(null)}
                    />
                    <div
                        className="relative z-10 h-full w-full max-w-md border-l border-white/10 bg-[#0B1220]/95 p-6 shadow-2xl backdrop-blur-2xl overflow-y-auto flex flex-col justify-between"
                        style={{ animation: 'slide-up-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
                    >
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-white/10">
                                <div>
                                    <span className="section-label">Product Decision Evaluation</span>
                                    <h3 className="text-xl font-bold text-[#F8FAFC] mt-0.5">{evaluationDrawer.product.name}</h3>
                                </div>
                                <button
                                    onClick={() => setEvaluationDrawer(null)}
                                    className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* GuardRail Decision Score Gauge */}
                            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-5">
                                <div className="relative flex-shrink-0" style={{ width: 80, height: 80 }}>
                                    <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                                        <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                                        <circle
                                            cx="40" cy="40" r="32"
                                            fill="none"
                                            stroke={evaluationDrawer.evalResult.score >= 80 ? '#22C55E' : evaluationDrawer.evalResult.score >= 60 ? '#F59E0B' : '#EF4444'}
                                            strokeWidth="6"
                                            strokeLinecap="round"
                                            strokeDasharray={2 * Math.PI * 32}
                                            strokeDashoffset={2 * Math.PI * 32 * (1 - evaluationDrawer.evalResult.score / 100)}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-base font-extrabold text-[#F8FAFC]">{evaluationDrawer.evalResult.score}</span>
                                        <span className="text-[8px] text-[#64748B] mono">/ 100</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[11px] text-[#64748B] uppercase font-semibold">GuardRail Decision Score</div>
                                    <div className="text-lg font-bold text-[#F8FAFC]">
                                        {evaluationDrawer.evalResult.riskLevel} RISK
                                    </div>
                                    <div className="text-[12px] font-semibold mt-0.5" style={{ color: evaluationDrawer.evalResult.decision === 'APPROVED' ? '#86EFAC' : '#FCA5A5' }}>
                                        {evaluationDrawer.evalResult.decision === 'APPROVED' ? '✓ APPROVED FOR CHECKOUT' : '✕ BLOCKED BY GOVERNANCE'}
                                    </div>
                                </div>
                            </div>

                            {/* Decision Checks */}
                            <div className="space-y-2">
                                <span className="section-label">Decision Checks</span>
                                {[
                                    { name: 'Policy Compliance', ok: evaluationDrawer.evalResult.checks?.policyCompliant },
                                    { name: 'Budget Availability', ok: evaluationDrawer.evalResult.checks?.budgetAvailable },
                                    { name: 'Category Allowlist', ok: evaluationDrawer.evalResult.checks?.categoryAllowed },
                                    { name: 'Merchant Trusted', ok: evaluationDrawer.evalResult.checks?.merchantTrusted },
                                    { name: 'Agent Cryptographic Authorization', ok: evaluationDrawer.evalResult.checks?.agentAuthorized },
                                    { name: 'Time Window Valid', ok: evaluationDrawer.evalResult.checks?.timeWindowValid },
                                ].map((chk, i) => (
                                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[12px]">
                                        <span className="text-[#94A3B8]">{chk.name}</span>
                                        <span className={chk.ok ? 'text-[#86EFAC] font-semibold' : 'text-[#FCA5A5] font-semibold'}>
                                            {chk.ok ? '✓ PASS' : '✕ FAIL'}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Merchant Intelligence */}
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                                <span className="section-label">Merchant Intelligence</span>
                                <div className="text-[14px] font-bold text-[#F8FAFC] flex items-center justify-between">
                                    <span>{evaluationDrawer.product.merchant}</span>
                                    <span className="text-[#22C55E] text-[12px] font-semibold">Verified Merchant</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-[#94A3B8]">
                                    <div>Trust Rating: <strong className="text-white">96/100</strong></div>
                                    <div>Return Risk: <strong className="text-white">LOW</strong></div>
                                    <div>Policy Match: <strong className="text-white">HIGH</strong></div>
                                    <div>Checkout: <strong className="text-white">Automated</strong></div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-6 border-t border-white/10">
                            <button
                                onClick={() => setEvaluationDrawer(null)}
                                className="w-full btn-primary py-2.5 text-center text-[13px]"
                            >
                                Close Evaluation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentCommercePage;
