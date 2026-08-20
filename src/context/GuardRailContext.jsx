import React, { createContext, useState, useCallback, useMemo } from 'react';
import { generateId } from '../utils/helpers.js';
import MERCHANTS from '../data/merchants.json';

export const GuardRailContext = createContext();

const INITIAL_AUDIT_EVENTS = [
    {
        id: 'evt-1',
        type: 'agent',
        title: 'Autonomous Shopping Agent Provisioned',
        actor: 'Security Controller',
        guardrailEngine: 'Access Control Layer',
        description: 'Agent granted restricted commerce authority with real-time GuardRail telemetry.',
        timestamp: Date.now() - 3600000 * 4,
        status: 'SUCCESS',
        metadata: {
            agentId: 'shopping-agent-v1',
            scope: ['discovery', 'price_comparison', 'checkout_intent'],
        },
    },
    {
        id: 'evt-2',
        type: 'policy',
        title: 'Commerce Spending Policy Enforced',
        actor: 'Finance Controller',
        guardrailEngine: 'Deterministic Policy Engine',
        description: 'Max budget limit enforced: $50.00 ceiling on Groceries with rolling 2h window.',
        timestamp: Date.now() - 3600000 * 3,
        status: 'ACTIVE',
        metadata: {
            maxBudget: 50,
            category: 'groceries',
            timeWindow: 2,
        },
    },
    {
        id: 'evt-3',
        type: 'transaction',
        title: 'Autonomous Purchase Approved',
        actor: 'Shopping Agent',
        guardrailEngine: 'GuardRail Decision Core',
        description: 'Whole Foods Market: Artisan Sourdough & Pasture Eggs ($11.78) cleared with GuardRail Score 96/100.',
        timestamp: Date.now() - 3600000 * 2,
        status: 'APPROVED',
        metadata: {
            merchant: 'Whole Foods',
            amount: 11.78,
            category: 'groceries',
            score: 96,
            decision: 'APPROVED',
            reason: 'Within budget and category rules.',
        },
    },
    {
        id: 'evt-4',
        type: 'transaction',
        title: 'Unauthorized Transaction Intercepted',
        actor: 'Shopping Agent',
        guardrailEngine: 'GuardRail Decision Core',
        description: 'Best Buy: Bose QuietComfort 45 ($149.00) blocked — budget overrun & category mismatch.',
        timestamp: Date.now() - 3600000 * 1,
        status: 'BLOCKED',
        metadata: {
            merchant: 'Best Buy',
            amount: 149.00,
            category: 'electronics',
            score: 32,
            decision: 'DENIED',
            reason: '$149.00 exceeds $50.00 ceiling. Category "electronics" not permitted.',
        },
    },
];

const INITIAL_TRANSACTIONS = [
    {
        id: 'tx-1',
        merchant: 'Whole Foods',
        items: [
            { name: 'Organic Whole Milk (1 gal)', price: 4.99 },
            { name: 'Artisan Sourdough Loaf', price: 5.49 }
        ],
        total: 10.48,
        category: 'groceries',
        decision: 'APPROVED',
        reason: 'Within verified policy limits and authorized merchant trust bounds.',
        score: 96,
        riskLevel: 'LOW',
        timestamp: Date.now() - 3600000 * 2,
        merchantInfo: MERCHANTS['Whole Foods'],
        checks: {
            policyCompliant: true,
            budgetAvailable: true,
            categoryAllowed: true,
            merchantTrusted: true,
            agentAuthorized: true,
            timeWindowValid: true,
        }
    },
    {
        id: 'tx-2',
        merchant: 'Best Buy',
        items: [
            { name: 'Bose QuietComfort 45 Wireless Headphones', price: 149.00 }
        ],
        total: 149.00,
        category: 'electronics',
        decision: 'DENIED',
        reason: '$149.00 exceeds $50.00 spending ceiling. Category "electronics" violates allowlist.',
        score: 32,
        riskLevel: 'HIGH',
        timestamp: Date.now() - 3600000 * 1,
        merchantInfo: MERCHANTS['Best Buy'],
        checks: {
            policyCompliant: false,
            budgetAvailable: false,
            categoryAllowed: false,
            merchantTrusted: true,
            agentAuthorized: true,
            timeWindowValid: true,
        }
    },
    {
        id: 'tx-3',
        merchant: 'Trader Joe\'s',
        items: [
            { name: 'Pasture-Raised Organic Eggs (12ct)', price: 6.29 },
            { name: 'Fresh Hass Avocados (4-pack)', price: 3.99 }
        ],
        total: 10.28,
        category: 'groceries',
        decision: 'APPROVED',
        reason: 'Within verified policy limits and authorized merchant trust bounds.',
        score: 94,
        riskLevel: 'LOW',
        timestamp: Date.now() - 3600000 * 0.5,
        merchantInfo: MERCHANTS['Trader Joe\'s'],
        checks: {
            policyCompliant: true,
            budgetAvailable: true,
            categoryAllowed: true,
            merchantTrusted: true,
            agentAuthorized: true,
            timeWindowValid: true,
        }
    }
];

const INITIAL_POLICY_HISTORY = [
    {
        id: 'pol-hist-1',
        title: 'Policy Enforced',
        description: '$50.00 ceiling · Groceries · 2h window',
        timestamp: Date.now() - 3600000 * 3,
        action: 'CREATED',
        budget: 50,
        category: 'groceries',
        timeWindow: 2,
    }
];

export const GuardRailProvider = ({ children }) => {
    const [policy, setPolicyState] = useState({
        id: 'pol-main',
        maxBudget: 50,
        category: 'groceries',
        timeWindow: 2,
        allowlist: [],
        blocklist: [],
        active: true,
        _startTime: Date.now() - 3600000 * 3,
        createdAt: Date.now() - 3600000 * 3,
    });

    const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
    const [auditEvents, setAuditEvents] = useState(INITIAL_AUDIT_EVENTS);
    const [policyHistory, setPolicyHistory] = useState(INITIAL_POLICY_HISTORY);
    const [agentRevoked, setAgentRevokedState] = useState(false);
    const [pendingEscalation, setPendingEscalation] = useState(null);

    // Active Mission State for Agent Commerce
    const [activeMission, setActiveMission] = useState(null);
    const [agentActivityStream, setAgentActivityStream] = useState([
        { id: 'act-1', text: 'Shopping Agent standby — policy monitoring active', time: Date.now() - 120000, type: 'info' }
    ]);

    const addActivity = useCallback((text, type = 'info') => {
        setAgentActivityStream(prev => [
            { id: `act-${generateId()}`, text, time: Date.now(), type },
            ...prev.slice(0, 20)
        ]);
    }, []);

    const addAuditEvent = useCallback((event) => {
        const newEvent = {
            id: event.id || `evt-${generateId()}`,
            timestamp: event.timestamp || Date.now(),
            status: event.status || 'INFO',
            ...event,
        };
        setAuditEvents(prev => [newEvent, ...prev]);
        return newEvent;
    }, []);

    const setPolicy = useCallback((newPolicy) => {
        setPolicyState(prev => {
            const updated = typeof newPolicy === 'function' ? newPolicy(prev) : newPolicy;
            
            if (updated.active !== prev.active || updated.maxBudget !== prev.maxBudget || updated.category !== prev.category || updated.timeWindow !== prev.timeWindow) {
                const actionTitle = !prev.active && updated.active 
                    ? 'Spending Policy Activated' 
                    : prev.active && !updated.active 
                    ? 'Spending Policy Deactivated' 
                    : 'Spending Rules Updated';
                
                const detailText = updated.active 
                    ? `$${updated.maxBudget}.00 · ${updated.category || 'any category'} · ${updated.timeWindow}h window`
                    : 'Autonomous spend controls temporarily suspended.';

                setPolicyHistory(h => [{
                    id: `hist-${generateId()}`,
                    title: actionTitle,
                    description: detailText,
                    timestamp: Date.now(),
                    action: updated.active ? 'UPDATED' : 'DEACTIVATED',
                    budget: updated.maxBudget,
                    category: updated.category,
                    timeWindow: updated.timeWindow,
                }, ...h]);

                addAuditEvent({
                    type: 'policy',
                    title: actionTitle,
                    actor: 'Governance Console',
                    guardrailEngine: 'Policy Rule Engine',
                    description: detailText,
                    status: updated.active ? 'ACTIVE' : 'DEACTIVATED',
                    metadata: { ...updated },
                });

                addActivity(`Governance: ${actionTitle} (${detailText})`, 'policy');
            }

            return updated;
        });
    }, [addAuditEvent, addActivity]);

    const setAgentRevoked = useCallback((revoked) => {
        setAgentRevokedState(revoked);
        addAuditEvent({
            type: 'access',
            title: revoked ? 'Agent Authority Revoked' : 'Agent Authority Restored',
            actor: 'Security Controller',
            guardrailEngine: 'Access Control Layer',
            description: revoked 
                ? 'Autonomous purchasing authority revoked. All future transactions will be hard-blocked.'
                : 'Autonomous purchasing authority restored to normal policy operations.',
            status: revoked ? 'REVOKED' : 'AUTHORIZED',
            metadata: { agentId: 'shopping-agent-v1', revoked },
        });
        addActivity(revoked ? 'Agent authority revoked by admin' : 'Agent authority restored', revoked ? 'danger' : 'success');
    }, [addAuditEvent, addActivity]);

    const addTransaction = useCallback((tx) => {
        const fullTx = {
            id: tx.id || `tx-${generateId()}`,
            timestamp: tx.timestamp || Date.now(),
            ...tx,
        };

        setTransactions(prev => [fullTx, ...prev]);

        const isApproved = fullTx.decision === 'APPROVED';
        const isDenied = fullTx.decision === 'DENIED';

        addAuditEvent({
            type: 'transaction',
            title: isApproved ? 'Transaction Approved' : isDenied ? 'Transaction Intercepted' : 'Human Review Required',
            actor: 'Shopping Agent',
            guardrailEngine: 'GuardRail Decision Core',
            description: `${fullTx.items?.[0]?.name || fullTx.merchant} ($${Number(fullTx.total).toFixed(2)}) — ${fullTx.reason}`,
            status: fullTx.decision,
            metadata: {
                transactionId: fullTx.id,
                merchant: fullTx.merchant,
                amount: fullTx.total,
                category: fullTx.category,
                score: fullTx.score,
                decision: fullTx.decision,
                reason: fullTx.reason,
            },
        });

        addActivity(
            `Decision: ${fullTx.decision} for $${Number(fullTx.total).toFixed(2)} at ${fullTx.merchant} (Score ${fullTx.score || 90}/100)`,
            isApproved ? 'success' : isDenied ? 'danger' : 'warning'
        );

        return fullTx;
    }, [addAuditEvent, addActivity]);

    // Computed Executive Stats
    const metrics = useMemo(() => {
        const approved = transactions.filter(t => t.decision === 'APPROVED');
        const denied = transactions.filter(t => t.decision === 'DENIED');
        const totalSpend = approved.reduce((acc, t) => acc + t.total, 0);
        const preventedSpend = denied.reduce((acc, t) => acc + t.total, 0);
        const approvalRate = transactions.length > 0 ? Math.round((approved.length / transactions.length) * 100) : 100;
        const avgTxValue = approved.length > 0 ? totalSpend / approved.length : 0;

        return {
            totalSpend,
            preventedSpend,
            approvedCount: approved.length,
            deniedCount: denied.length,
            totalCount: transactions.length,
            approvalRate,
            avgTxValue,
        };
    }, [transactions]);

    const value = {
        policy,
        setPolicy,
        policyHistory,
        transactions,
        addTransaction,
        auditEvents,
        addAuditEvent,
        agentRevoked,
        setAgentRevoked,
        pendingEscalation,
        setPendingEscalation,
        activeMission,
        setActiveMission,
        agentActivityStream,
        addActivity,
        metrics,
    };

    return (
        <GuardRailContext.Provider value={value}>
            {children}
        </GuardRailContext.Provider>
    );
};