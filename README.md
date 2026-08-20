# GuardRail 

A fintech prototype that lets an AI agent make purchases on behalf of a user, but only within programmable spend limits, with a second AI "guardrail" agent authorizing every transaction in real time.

## Features

- **Rule Setup**: Set spend policies (budget, category, time window)
- **Shopping Agent**: AI agent that selects items from a product catalog
- **Guardrail Agent**: Real-time authorization with approve/deny/escalate decisions
- **Transaction Dashboard**: Live feed with decision reasoning
- **Human Override**: Revoke agent access or approve escalated transactions
- **Reconciliation View**: Pie chart of spending by category

## Tech Stack

- React 18 (functional components, hooks)
- Vite (build tool)
- Tailwind CSS (styling)
- Recharts (data visualization)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
