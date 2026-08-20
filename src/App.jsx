import React from 'react';
import { Routes, Route } from './router/index.jsx';
import Header from './components/Header.jsx';
import MobileNav from './components/MobileNav.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PoliciesPage from './pages/PoliciesPage.jsx';
import AgentCommercePage from './pages/AgentCommercePage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import InsightsPage from './pages/InsightsPage.jsx';
import AuditPage from './pages/AuditPage.jsx';
import ChatAssistant from './components/chat/ChatAssistant.jsx';

const App = () => {
    return (
        <div className="relative min-h-screen pb-16 lg:pb-0" style={{ background: '#070B14' }}>
            {/* Ambient atmospheric glows */}
            <div className="bg-atmosphere" />

            <div className="relative z-10 flex flex-col min-h-screen">
                <Header />

                <main className="flex-1 mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/policies" element={<PoliciesPage />} />
                        <Route path="/agent-commerce" element={<AgentCommercePage />} />
                        <Route path="/transactions" element={<TransactionsPage />} />
                        <Route path="/insights" element={<InsightsPage />} />
                        <Route path="/audit" element={<AuditPage />} />
                        <Route path="*" element={<Dashboard />} />
                    </Routes>
                </main>

                {/* Mobile Bottom Navigation Bar */}
                <MobileNav />

                {/* Floating AI Commerce Assistant */}
                <ChatAssistant />
            </div>
        </div>
    );
};

export default App;