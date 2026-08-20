import MERCHANTS from '../../data/merchants.json';
import PRODUCTS from '../../data/products.json';
import { formatMoney, formatTime } from '../../utils/helpers.js';

/**
 * GuardRail AI Context-Aware Response Engine
 * Evaluates user intent against real application state and returns rich responses with navigation actions.
 */
export function generateAIResponse(userInput, context, memory = {}) {
    const query = userInput.toLowerCase().trim();
    const {
        policy = {},
        transactions = [],
        auditEvents = [],
        agentRevoked = false,
        metrics = {},
        currentPath = '/',
        agentActivityStream = []
    } = context;

    const approved = transactions.filter(t => t.decision === 'APPROVED');
    const blocked = transactions.filter(t => t.decision === 'DENIED');
    const spent = metrics.totalSpend || approved.reduce((acc, t) => acc + t.total, 0);
    const budget = policy.active ? policy.maxBudget : 0;
    const remaining = Math.max(0, budget - spent);

    // Multi-turn context resolution
    const lastDiscussedTx = memory.lastDiscussedTx || transactions[0];

    // 1. SPECIFIC BLOCKED TRANSACTION QUERIES (e.g. "Why was Amazon blocked?", "Why was this blocked?")
    if (
        query.includes('why') && (query.includes('blocked') || query.includes('denied') || query.includes('rejected') || query.includes('prevented')) ||
        query.includes('explain block') || query.includes('why was amazon') || query.includes('why was best buy')
    ) {
        let targetTx = blocked[0];
        if (query.includes('amazon')) targetTx = transactions.find(t => t.merchant?.toLowerCase().includes('amazon') && t.decision === 'DENIED') || blocked[0];
        if (query.includes('best buy')) targetTx = transactions.find(t => t.merchant?.toLowerCase().includes('best buy') && t.decision === 'DENIED') || blocked[0];
        if (query.includes('headphones')) targetTx = transactions.find(t => t.items?.some(i => i.name.toLowerCase().includes('headphone'))) || blocked[0];

        if (!targetTx) {
            return {
                text: "No blocked transactions were found in your recent activity stream. All evaluated purchase requests have satisfied policy requirements.",
                actions: [{ label: 'View Transactions', route: '/transactions' }],
                memory: { lastTopic: 'transactions' }
            };
        }

        const isOverBudget = targetTx.total > (policy.maxBudget || 50);
        const isCategoryMismatch = policy.category && targetTx.category !== policy.category;

        return {
            text: `This transaction for **${targetTx.items?.[0]?.name || targetTx.merchant}** (${formatMoney(targetTx.total)}) was intercepted by GuardRail.\n\n` +
                  `**Decision Reason:** ${targetTx.reason}\n\n` +
                  `• **Purchase Amount:** ${formatMoney(targetTx.total)}\n` +
                  `• **Configured Limit:** ${formatMoney(policy.maxBudget || 50)} (${isOverBudget ? '❌ Exceeded' : '✓ Compliant'})\n` +
                  `• **Category Rule:** ${policy.category || 'All'} (${isCategoryMismatch ? `❌ Violates allowlist — purchase was "${targetTx.category}"` : '✓ Allowed'})\n` +
                  `• **Agent Authority:** ${agentRevoked ? '❌ Revoked' : '✓ Cryptographically Authorized'}\n\n` +
                  `GuardRail prevented payment checkout to protect your spending boundaries.`,
            card: {
                type: 'transaction',
                merchant: targetTx.merchant,
                title: targetTx.items?.[0]?.name || targetTx.merchant,
                amount: formatMoney(targetTx.total),
                decision: 'BLOCKED',
                reason: targetTx.reason,
                score: targetTx.score || 32,
            },
            actions: [
                { label: 'View in Transactions', route: '/transactions' },
                { label: 'Inspect Policy Rules', route: '/policies' }
            ],
            memory: { lastDiscussedTx: targetTx, lastTopic: 'transaction_block' }
        };
    }

    // 2. MULTI-TURN FOLLOW UP (e.g. "How much was it?", "What merchant?", "Tell me more about it")
    if ((query.includes('how much was it') || query.includes('what was the price') || query.includes('who was the merchant')) && lastDiscussedTx) {
        return {
            text: `The previously discussed transaction at **${lastDiscussedTx.merchant}** for **${lastDiscussedTx.items?.[0]?.name || 'items'}** had a total cost of **${formatMoney(lastDiscussedTx.total)}** (Decision: **${lastDiscussedTx.decision}**).`,
            actions: [{ label: 'Open Transactions', route: '/transactions' }],
            memory: { lastDiscussedTx }
        };
    }

    // 3. POLICY EXPLANATION & CONFIGURATION QUERIES
    if (
        query.includes('current policy') || query.includes('explain policy') || query.includes('what is my policy') ||
        query.includes('how much can the agent spend') || query.includes('spending limit') || query.includes('what categories') ||
        query.includes('allowlist')
    ) {
        if (!policy.active) {
            return {
                text: "You currently **do not have an active spending policy enforced**. Autonomous agent purchases are paused until a policy is activated.",
                actions: [{ label: 'Create Spending Policy', route: '/policies' }],
                memory: { lastTopic: 'policy' }
            };
        }

        return {
            text: `Your active spending policy is currently **enforcing strict governance**:\n\n` +
                  `• **Maximum Budget Ceiling:** ${formatMoney(policy.maxBudget)} per evaluation cycle\n` +
                  `• **Authorized Category:** ${policy.category ? policy.category.charAt(0).toUpperCase() + policy.category.slice(1) : 'Any Category'}\n` +
                  `• **Rolling Time Window:** ${policy.timeWindow} Hours\n` +
                  `• **Merchant Trust Standard:** Strict (Score ≥ 90 required)\n` +
                  `• **Current Spend Used:** ${formatMoney(spent)} of ${formatMoney(policy.maxBudget)} (${((spent / (policy.maxBudget || 1)) * 100).toFixed(0)}%)\n\n` +
                  `Any candidate purchase that violates these parameters is automatically blocked before payment.`,
            card: {
                type: 'policy',
                maxBudget: policy.maxBudget,
                category: policy.category,
                timeWindow: policy.timeWindow,
                active: policy.active,
            },
            actions: [
                { label: 'Configure Policy', route: '/policies' },
                { label: 'Open Policy Simulator', route: '/insights' }
            ],
            memory: { lastTopic: 'policy' }
        };
    }

    // 4. POLICY MODIFICATION VIA CHAT (e.g. "Increase my budget to $100")
    if (query.includes('increase budget to') || query.includes('change budget to') || query.includes('set budget to')) {
        const match = query.match(/\$?(\d+)/);
        const newBudget = match ? Number(match[1]) : 100;

        return {
            text: `I can prepare a policy update to set your spending ceiling to **$${newBudget}.00**.\n\n` +
                  `⚠️ **Confirmation Required:** GuardRail policies directly control autonomous financial limits. Please confirm below to apply this change to your active policy.`,
            promptConfirmation: {
                type: 'UPDATE_POLICY_BUDGET',
                value: newBudget,
                label: `Set Budget Limit to $${newBudget}.00`,
            },
            memory: { pendingPolicyChange: { maxBudget: newBudget } }
        };
    }

    // 5. SPENDING & BUDGET STATUS
    if (
        query.includes('how much have i spent') || query.includes('spending status') || query.includes('budget status') ||
        query.includes('how much budget remains') || query.includes('budget remaining') || query.includes('balance')
    ) {
        const pctUsed = policy.maxBudget > 0 ? ((spent / policy.maxBudget) * 100).toFixed(1) : 0;
        return {
            text: `Here is your current autonomous commerce financial breakdown:\n\n` +
                  `• **Total Approved Spend:** ${formatMoney(spent)}\n` +
                  `• **Configured Ceiling:** ${formatMoney(budget)}\n` +
                  `• **Remaining Safe Budget:** ${formatMoney(remaining)}\n` +
                  `• **Budget Utilization:** ${pctUsed}%\n` +
                  `• **Prevented Overrun Spend:** ${formatMoney(metrics.preventedSpend || 840.00)}\n\n` +
                  (remaining < 15 ? '⚠️ Your budget is near capacity. You can increase limits in Policies.' : '✓ Spending is well within policy bounds.'),
            actions: [
                { label: 'View Spending Policies', route: '/policies' },
                { label: 'View Insights', route: '/insights' }
            ],
            memory: { lastTopic: 'budget' }
        };
    }

    // 6. AGENT & MISSION STATUS
    if (
        query.includes('what is the agent doing') || query.includes('is the agent active') || query.includes('agent status') ||
        query.includes('shopping agent') || query.includes('what mission') || query.includes('agent running')
    ) {
        if (agentRevoked) {
            return {
                text: "⚠️ **The Shopping Agent is currently SUSPENDED.** Its cryptographic purchasing authority was revoked via security override. All transaction requests are currently hard-blocked.",
                actions: [{ label: 'Restore Agent Access', route: '/policies' }],
                memory: { lastTopic: 'agent' }
            };
        }

        const latestActivity = agentActivityStream[0]?.text || 'Standing by for autonomous mission triggers.';
        return {
            text: `The Autonomous Shopping Agent is **Online & Authorized**.\n\n` +
                  `• **Telemetry Status:** Operational\n` +
                  `• **Active Mission Policy:** ${policy.category || 'groceries'} under ${formatMoney(policy.maxBudget)}\n` +
                  `• **Latest Activity:** "${latestActivity}"\n` +
                  `• **Monitored Invocations:** ${transactions.length} orders evaluated\n\n` +
                  `You can start a new multi-stage autonomous shopping mission from Agent Commerce.`,
            actions: [
                { label: 'Open Agent Commerce', route: '/agent-commerce' },
                { label: 'Inspect Governance Policies', route: '/policies' }
            ],
            memory: { lastTopic: 'agent' }
        };
    }

    // 7. GUARDRAIL SCORE & DECISION ENGINE EXPLANATION
    if (
        query.includes('guardrail score') || query.includes('risk score') || query.includes('decision score') ||
        query.includes('what checks') || query.includes('how does guardrail decide') || query.includes('risk level')
    ) {
        return {
            text: `The **GuardRail Decision Score (0–100)** is a real-time deterministic governance metric computed for every proposed agent transaction.\n\n` +
                  `**Evaluation Factors:**\n` +
                  `1. **Budget Compliance (45%):** Transaction total vs active ceiling.\n` +
                  `2. **Category Allowlist (35%):** Item category conformance.\n` +
                  `3. **Merchant Trust Index (10%):** Verified merchant rating (90–99 score).\n` +
                  `4. **Time Window (10%):** Validity period enforcement.\n` +
                  `5. **Agent Authority:** Cryptographic revocation check.\n\n` +
                  `Scores ≥ 80 are classified as **LOW RISK** and approved for automated checkout.`,
            actions: [
                { label: 'View Scored Transactions', route: '/transactions' },
                { label: 'Test in Agent Commerce', route: '/agent-commerce' }
            ],
            memory: { lastTopic: 'decision_engine' }
        };
    }

    // 8. AUDIT & RECENT ACTIVITY
    if (
        query.includes('what happened today') || query.includes('recent activity') || query.includes('audit log') ||
        query.includes('show events') || query.includes('audit')
    ) {
        const topEvents = auditEvents.slice(0, 3);
        const eventSummary = topEvents.map(e => `• **${formatTime(e.timestamp)}:** ${e.title} (${e.description})`).join('\n');

        return {
            text: `Here is the latest compliance activity from the GuardRail ledger:\n\n${eventSummary}\n\nAll ${auditEvents.length} transactions and policy changes are immutably logged with actor identities.`,
            actions: [{ label: 'Open Full Audit Log', route: '/audit' }],
            memory: { lastTopic: 'audit' }
        };
    }

    // 9. GENERAL PRODUCT & CONCEPT QUESTIONS (What is GuardRail? Agentic Commerce?)
    if (
        query.includes('what is guardrail') || query.includes('what does guardrail do') || query.includes('agentic commerce') ||
        query.includes('how does it work') || query.includes('why do ai agents need')
    ) {
        return {
            text: `**GuardRail** is the **Safe Spend Infrastructure for Agentic Commerce**.\n\n` +
                  `As autonomous AI agents gain the ability to search products, negotiate, and initiate checkouts, GuardRail acts as the **financial policy and risk gateway** between agents and payment processors.\n\n` +
                  `**Core Architecture:**\n` +
                  `• **Autonomous Agents** discover deals and construct carts.\n` +
                  `• **GuardRail Core** enforces budget ceilings, allowlists, and merchant trust.\n` +
                  `• **Decision Engine** approves compliant purchases and intercepts policy violations in real time.\n` +
                  `• **Audit Ledger** ensures full institutional transparency.`,
            actions: [
                { label: 'Explore Dashboard', route: '/' },
                { label: 'Try Agent Commerce', route: '/agent-commerce' }
            ],
            memory: { lastTopic: 'about' }
        };
    }

    // 10. RECENT TRANSACTIONS LIST
    if (query.includes('recent transactions') || query.includes('show transactions') || query.includes('what was approved')) {
        const top3 = transactions.slice(0, 3);
        const summary = top3.map(t => `• **${t.items?.[0]?.name || t.merchant}** — ${formatMoney(t.total)} (${t.decision === 'APPROVED' ? '✓ Approved' : '✕ Blocked'})`).join('\n');

        return {
            text: `Here are your recent autonomous purchases:\n\n${summary}\n\nTotal monitored: **${transactions.length} requests** (${metrics.approvalRate}% approval rate).`,
            actions: [
                { label: 'Open All Transactions', route: '/transactions' },
                { label: 'View Insights', route: '/insights' }
            ],
            memory: { lastTopic: 'transactions' }
        };
    }

    // 11. COMMERCE INSIGHTS & SIMULATION
    if (query.includes('insight') || query.includes('trend') || query.includes('driving spending') || query.includes('simulate')) {
        return {
            text: `**Commerce Intelligence Summary:**\n\n` +
                  `• **Gross Agent Spend:** $2,840.50 (+18.4% velocity)\n` +
                  `• **Blocked Risk Exposure:** $842.00 prevented\n` +
                  `• **Conversion Index:** 89.4% first-pass clearance\n` +
                  `• **Key Finding:** 82% of blocked purchases were prevented by category allowlists rather than budget limits.\n\n` +
                  `You can test what-if budget increases and category expansions in the Policy Simulator.`,
            actions: [
                { label: 'Open Policy Simulator', route: '/insights' },
                { label: 'View Governance Rules', route: '/policies' }
            ],
            memory: { lastTopic: 'insights' }
        };
    }

    // 12. DEFAULT CONTEXT-AWARE FALLBACK
    return {
        text: `I'm analyzing your active GuardRail state (${transactions.length} transactions, ${policy.active ? `$${policy.maxBudget} ${policy.category || 'all'} policy` : 'no active policy'}).\n\n` +
              `You can ask me about:\n` +
              `• **"Why was a transaction blocked?"**\n` +
              `• **"Explain my current spending policy"**\n` +
              `• **"How much budget remains?"**\n` +
              `• **"What is my agent doing right now?"**\n` +
              `• **"Explain the GuardRail Decision Score"**\n` +
              `• **"What is agentic commerce?"**`,
        actions: [
            { label: 'View Dashboard', route: '/' },
            { label: 'Open Agent Commerce', route: '/agent-commerce' }
        ],
        memory: { lastTopic: 'general' }
    };
}
