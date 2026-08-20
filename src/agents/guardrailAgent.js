import MERCHANTS from '../data/merchants.json';

export const calculateGuardRailScore = (transaction, policy, revoked) => {
    let score = 100;
    const { total, category, merchant } = transaction;

    if (revoked) score -= 50;

    // Budget penalty
    const maxBudget = policy.maxBudget || 50;
    if (total > maxBudget) {
        const excessPct = ((total - maxBudget) / maxBudget) * 100;
        score -= Math.min(45, Math.round(excessPct * 0.5 + 20));
    }

    // Category penalty
    if (policy.category && category !== policy.category) {
        score -= 35;
    }

    // Merchant trust contribution
    const merchantData = MERCHANTS[merchant];
    if (merchantData) {
        const trustBonus = (merchantData.trustScore - 90) * 0.5;
        score += Math.round(trustBonus);
    } else {
        score -= 10;
    }

    // Time window check
    const now = Date.now();
    const policyStart = policy._startTime || now;
    const elapsedHours = (now - policyStart) / (1000 * 60 * 60);
    if (elapsedHours > (policy.timeWindow || 2)) {
        score -= 30;
    }

    return Math.max(12, Math.min(99, score));
};

export const runGuardrailAgent = (transaction, policy, revoked) => {
    const { total, category, merchant } = transaction;
    const merchantData = MERCHANTS[merchant] || { trustScore: 90, returnRisk: 'MODERATE' };

    const score = calculateGuardRailScore(transaction, policy, revoked);
    const riskLevel = score >= 85 ? 'LOW' : score >= 70 ? 'MODERATE' : score >= 50 ? 'HIGH' : 'CRITICAL';

    // 1. Revocation check
    if (revoked) {
        return {
            decision: 'DENIED',
            reason: 'Agent authority revoked by security override.',
            score,
            riskLevel: 'CRITICAL',
            checks: {
                policyCompliant: false,
                budgetAvailable: total <= (policy.maxBudget || 50),
                categoryAllowed: !policy.category || category === policy.category,
                merchantTrusted: merchantData.trustScore >= 85,
                agentAuthorized: false,
                timeWindowValid: true,
            },
            merchantInfo: merchantData,
        };
    }

    // 2. Time window check
    const now = Date.now();
    const policyStart = policy._startTime || now;
    const elapsedHours = (now - policyStart) / (1000 * 60 * 60);
    const timeOk = elapsedHours <= (policy.timeWindow || 2);

    if (!timeOk) {
        return {
            decision: 'DENIED',
            reason: `Time window expired (${policy.timeWindow}h validity elapsed).`,
            score,
            riskLevel: 'HIGH',
            checks: {
                policyCompliant: false,
                budgetAvailable: total <= (policy.maxBudget || 50),
                categoryAllowed: !policy.category || category === policy.category,
                merchantTrusted: merchantData.trustScore >= 85,
                agentAuthorized: true,
                timeWindowValid: false,
            },
            merchantInfo: merchantData,
        };
    }

    // 3. Category check
    const categoryOk = !policy.category || category === policy.category;
    if (!categoryOk) {
        return {
            decision: 'DENIED',
            reason: `Category "${category}" violates active allowlist (only ${policy.category}).`,
            score,
            riskLevel: 'HIGH',
            checks: {
                policyCompliant: false,
                budgetAvailable: total <= (policy.maxBudget || 50),
                categoryAllowed: false,
                merchantTrusted: merchantData.trustScore >= 85,
                agentAuthorized: true,
                timeWindowValid: true,
            },
            merchantInfo: merchantData,
        };
    }

    // 4. Budget check
    const budgetOk = total <= (policy.maxBudget || 50);
    if (!budgetOk) {
        return {
            decision: 'DENIED',
            reason: `$${Number(total).toFixed(2)} exceeds $${Number(policy.maxBudget || 50).toFixed(2)} spending ceiling.`,
            score,
            riskLevel: 'HIGH',
            checks: {
                policyCompliant: false,
                budgetAvailable: false,
                categoryAllowed: true,
                merchantTrusted: merchantData.trustScore >= 85,
                agentAuthorized: true,
                timeWindowValid: true,
            },
            merchantInfo: merchantData,
        };
    }

    // 5. Merchant blocklist (mock)
    if (policy.blocklist && policy.blocklist.includes(merchant)) {
        return {
            decision: 'DENIED',
            reason: `Merchant "${merchant}" is explicitly blocked.`,
            score: Math.min(score, 40),
            riskLevel: 'CRITICAL',
            checks: {
                policyCompliant: false,
                budgetAvailable: true,
                categoryAllowed: true,
                merchantTrusted: false,
                agentAuthorized: true,
                timeWindowValid: true,
            },
            merchantInfo: merchantData,
        };
    }

    // 6. Escalation trigger (edge cases)
    if (total > (policy.maxBudget || 50) * 0.85 && Math.random() < 0.15) {
        return {
            decision: 'ESCALATE',
            reason: 'High budget utilization threshold reached — human review required.',
            score: Math.max(score, 75),
            riskLevel: 'MODERATE',
            checks: {
                policyCompliant: true,
                budgetAvailable: true,
                categoryAllowed: true,
                merchantTrusted: merchantData.trustScore >= 85,
                agentAuthorized: true,
                timeWindowValid: true,
            },
            merchantInfo: merchantData,
        };
    }

    return {
        decision: 'APPROVED',
        reason: 'Within verified policy limits and authorized merchant trust bounds.',
        score: Math.max(score, 88),
        riskLevel: 'LOW',
        checks: {
            policyCompliant: true,
            budgetAvailable: true,
            categoryAllowed: true,
            merchantTrusted: merchantData.trustScore >= 85,
            agentAuthorized: true,
            timeWindowValid: true,
        },
        merchantInfo: merchantData,
    };
};