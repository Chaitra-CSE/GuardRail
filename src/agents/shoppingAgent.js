import PRODUCTS from '../data/products.json';

export const runShoppingAgent = (task, policy) => {
    // Simulate AI: pick random items within category & budget
    const category = policy.category || 'groceries';
    const maxBudget = policy.maxBudget || 50;

    const candidates = PRODUCTS.filter(p => p.category === category);
    if (candidates.length === 0) {
        return { items: [], total: 0, message: 'No products in category' };
    }

    // Pick 1-3 items
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    let selected = [];
    let total = 0;

    for (let p of shuffled) {
        if (total + p.price <= maxBudget) {
            selected.push(p);
            total += p.price;
        }
        if (selected.length >= 3) break;
    }

    if (selected.length === 0) {
        // Fallback: pick cheapest
        const cheapest = candidates.reduce((a, b) => a.price < b.price ? a : b);
        selected = [cheapest];
        total = cheapest.price;
    }

    return {
        items: selected,
        total,
        message: `Selected ${selected.length} items`
    };
};