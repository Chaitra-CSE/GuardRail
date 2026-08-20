import React, { useState, useEffect, useRef, useContext } from 'react';
import { GuardRailContext } from '../../context/GuardRailContext.jsx';
import { useLocation, useNavigate } from '../../router/index.jsx';
import { generateAIResponse } from './ChatEngine.js';
import {
    Sparkles,
    Shield,
    X,
    Minus,
    Send,
    Bot,
    User,
    ArrowRight,
    Check,
    AlertTriangle,
    Sliders,
    ShoppingBag,
    HelpCircle,
    Maximize2,
    RotateCcw
} from 'lucide-react';
import { formatMoney, formatTime } from '../../utils/helpers.js';

const ROUTE_SUGGESTIONS = {
    '/': [
        'How much has the agent spent?',
        'Why was a transaction blocked?',
        'Explain my current policy',
        'What is agentic commerce?'
    ],
    '/policies': [
        'Explain my current policy',
        'Increase my budget to $100',
        'What happens if I change categories?',
        'Why do AI agents need spending limits?'
    ],
    '/agent-commerce': [
        'What is the agent doing right now?',
        'Explain the GuardRail Decision Score',
        'Why was a product blocked?',
        'How does merchant trust work?'
    ],
    '/transactions': [
        'Why was a transaction blocked?',
        'Show approved transactions',
        'How much budget remains?',
        'What was the highest spend?'
    ],
    '/insights': [
        'Summarize commerce intelligence',
        'What is driving spending?',
        'How does the policy simulator work?',
        'Show risk score breakdown'
    ],
    '/audit': [
        'What happened today?',
        'Show recent policy changes',
        'Why was Amazon blocked?',
        'Who authorized the agent?'
    ]
};

const ChatAssistant = () => {
    const context = useContext(GuardRailContext) || {};
    const location = useLocation();
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            sender: 'ai',
            text: "Hi! I'm **GuardRail AI**, your autonomous commerce control assistant.\n\nI monitor your active spending policies, agent shopping missions, transaction decisions, and compliance logs in real time. What would you like to know?",
            actions: [
                { label: 'Why was a transaction blocked?', query: 'Why was a transaction blocked?' },
                { label: 'Explain my current policy', query: 'Explain my current policy' },
                { label: 'How much have I spent?', query: 'How much have I spent?' }
            ],
            timestamp: Date.now()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [memory, setMemory] = useState({});

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen && !isMinimized) {
            scrollToBottom();
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [isOpen, isMinimized, messages, isTyping]);

    const handleSendMessage = async (textToSend) => {
        const text = (textToSend || inputValue).trim();
        if (!text) return;

        const userMsg = {
            id: `msg-${Date.now()}`,
            sender: 'user',
            text: text,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Simulate lightweight local AI latency for smooth natural feel
        await new Promise(res => setTimeout(res, 450));

        const response = generateAIResponse(
            text,
            { ...context, currentPath: location.pathname },
            memory
        );

        setIsTyping(false);

        const aiMsg = {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: response.text,
            card: response.card,
            actions: response.actions,
            promptConfirmation: response.promptConfirmation,
            timestamp: Date.now()
        };

        if (response.memory) {
            setMemory(prev => ({ ...prev, ...response.memory }));
        }

        setMessages(prev => [...prev, aiMsg]);
    };

    const handleConfirmPolicyChange = (newBudget) => {
        context.setPolicy(prev => ({
            ...prev,
            maxBudget: Number(newBudget),
            active: true
        }));

        setMessages(prev => [
            ...prev,
            {
                id: `ai-confirm-${Date.now()}`,
                sender: 'ai',
                text: `✓ **Policy updated successfully!** Maximum budget ceiling is now **$${newBudget}.00**. Autonomous transactions will be evaluated against this new limit.`,
                actions: [{ label: 'View Spending Policy', route: '/policies' }],
                timestamp: Date.now()
            }
        ]);
    };

    const currentSuggestions = ROUTE_SUGGESTIONS[location.pathname] || ROUTE_SUGGESTIONS['/'];

    return (
        <>
            {/* ── Floating Action Trigger Button ── */}
            <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
                {!isOpen && (
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B1220]/90 border border-white/10 text-[12px] text-[#94A3B8] shadow-lg backdrop-blur-md animate-slide-up">
                        <Sparkles size={13} className="text-[#5B8CFF]" />
                        <span>Ask GuardRail AI</span>
                    </div>
                )}

                <button
                    onClick={() => {
                        setIsOpen(!isOpen);
                        setIsMinimized(false);
                    }}
                    className="relative flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group focus:outline-none"
                    style={{
                        background: 'linear-gradient(135deg, #5B8CFF 0%, #8B5CF6 100%)',
                        boxShadow: '0 8px 32px rgba(91,140,255,0.45)',
                        border: '1px solid rgba(255,255,255,0.25)',
                    }}
                    aria-label="Ask GuardRail AI"
                >
                    <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-[#5B8CFF]" />
                    {isOpen ? (
                        <X size={22} color="white" strokeWidth={2.5} />
                    ) : (
                        <div className="relative flex items-center justify-center">
                            <Shield size={24} color="white" strokeWidth={2.2} />
                            <Sparkles size={12} color="#F8FAFC" className="absolute -top-1 -right-1 text-amber-300" />
                        </div>
                    )}
                </button>
            </div>

            {/* ── Floating Chat Panel ── */}
            {isOpen && (
                <div
                    className={`fixed z-50 transition-all duration-300 ${
                        isMinimized
                            ? 'bottom-24 right-6 w-80 h-14 rounded-2xl overflow-hidden shadow-xl border border-white/10 bg-[#0B1220]/95 backdrop-blur-xl flex items-center justify-between px-4'
                            : 'bottom-0 sm:bottom-24 right-0 sm:right-6 w-full sm:w-[420px] h-[92vh] sm:h-[620px] sm:max-h-[85vh] rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#0B1220]/95 backdrop-blur-2xl flex flex-col'
                    }`}
                    style={{ animation: 'slide-up-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div
                                className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0"
                                style={{
                                    background: 'linear-gradient(135deg, #5B8CFF 0%, #8B5CF6 100%)',
                                    boxShadow: '0 0 12px rgba(91,140,255,0.3)',
                                }}
                            >
                                <Bot size={18} color="white" />
                            </div>
                            <div>
                                <div className="text-[14px] font-bold text-[#F8FAFC] flex items-center gap-2 leading-tight">
                                    <span>GuardRail AI</span>
                                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/20 text-[#86EFAC] border border-emerald-500/30">
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                                        Local Mode
                                    </span>
                                </div>
                                <div className="text-[11px] text-[#64748B] leading-tight">AI Commerce Control Assistant</div>
                            </div>
                        </div>

                        {/* Window Actions */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors"
                                title={isMinimized ? 'Expand' : 'Minimize'}
                            >
                                {isMinimized ? <Maximize2 size={12} /> : <Minus size={13} />}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors"
                                title="Close"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            {/* ── Message History Stream ── */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                                {messages.map((msg) => {
                                    const isUser = msg.sender === 'user';
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
                                        >
                                            <div className="flex items-start gap-2.5 max-w-[90%]">
                                                {!isUser && (
                                                    <div className="h-6 w-6 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 text-[#5B8CFF] mt-0.5">
                                                        <Shield size={12} />
                                                    </div>
                                                )}

                                                <div
                                                    className={`p-3.5 rounded-2xl text-[13px] leading-relaxed ${
                                                        isUser
                                                            ? 'bg-gradient-to-br from-[#5B8CFF] to-[#7C5FF5] text-white rounded-tr-sm shadow-md'
                                                            : 'bg-white/[0.04] border border-white/[0.08] text-[#F8FAFC] rounded-tl-sm'
                                                    }`}
                                                >
                                                    {/* Markdown-like formatting (bold & linebreaks) */}
                                                    <div className="whitespace-pre-line space-y-1.5">
                                                        {msg.text.split('\n').map((line, i) => {
                                                            // Bold regex
                                                            const parts = line.split(/(\*\*.*?\*\*)/g);
                                                            return (
                                                                <p key={i}>
                                                                    {parts.map((p, j) => {
                                                                        if (p.startsWith('**') && p.endsWith('**')) {
                                                                            return <strong key={j} className="font-bold text-white">{p.slice(2, -2)}</strong>;
                                                                        }
                                                                        return p;
                                                                    })}
                                                                </p>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Compact Transaction Card in Message */}
                                                    {msg.card?.type === 'transaction' && (
                                                        <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/10 space-y-1 text-[12px]">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-bold text-[#F8FAFC]">{msg.card.title}</span>
                                                                <span className="text-red-400 font-extrabold">{msg.card.amount}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                                                                <span>Merchant: {msg.card.merchant}</span>
                                                                <span className="badge-base badge-deny text-[9px] py-0.2">BLOCKED</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Compact Policy Card in Message */}
                                                    {msg.card?.type === 'policy' && (
                                                        <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/10 space-y-1 text-[12px]">
                                                            <div className="flex items-center justify-between font-bold text-[#5B8CFF]">
                                                                <span>Active Governance Policy</span>
                                                                <span className="badge-base badge-approve text-[9px]">ENFORCED</span>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-1 text-[11px] text-[#94A3B8] pt-1">
                                                                <div>Ceiling: <strong className="text-white">${msg.card.maxBudget}</strong></div>
                                                                <div>Window: <strong className="text-white">{msg.card.timeWindow}h</strong></div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Confirmation Action for Sensitive State Changes */}
                                                    {msg.promptConfirmation && (
                                                        <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                                                            <div className="text-[12px] font-semibold text-amber-300 flex items-center gap-1.5">
                                                                <AlertTriangle size={13} />
                                                                <span>{msg.promptConfirmation.label}</span>
                                                            </div>
                                                            <div className="flex gap-2 pt-1">
                                                                <button
                                                                    onClick={() => handleConfirmPolicyChange(msg.promptConfirmation.value)}
                                                                    className="btn-primary text-[11px] py-1.5 px-3 flex-1"
                                                                >
                                                                    <Check size={12} /> Confirm Change
                                                                </button>
                                                                <button
                                                                    onClick={() => setMessages(prev => [...prev, { id: `ai-cancel-${Date.now()}`, sender: 'ai', text: 'Policy change cancelled. Current limits preserved.', timestamp: Date.now() }])}
                                                                    className="btn-secondary text-[11px] py-1.5 px-3"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Action Buttons */}
                                                    {msg.actions && msg.actions.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-white/10">
                                                            {msg.actions.map((act, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    onClick={() => {
                                                                        if (act.route) {
                                                                            navigate(act.route);
                                                                            if (window.innerWidth < 640) setIsOpen(false);
                                                                        } else if (act.query) {
                                                                            handleSendMessage(act.query);
                                                                        }
                                                                    }}
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/[0.08] hover:bg-white/[0.15] text-[#93C5FD] border border-white/[0.08] transition-all cursor-pointer"
                                                                >
                                                                    <span>{act.label}</span>
                                                                    {act.route && <ArrowRight size={10} />}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-[#64748B] mono px-1">
                                                {formatTime(msg.timestamp)}
                                            </span>
                                        </div>
                                    );
                                })}

                                {/* Typing Indicator */}
                                {isTyping && (
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-6 w-6 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-[#5B8CFF]">
                                            <Bot size={12} />
                                        </div>
                                        <div className="p-3 rounded-2xl rounded-tl-sm bg-white/[0.04] border border-white/[0.08] flex items-center gap-1.5">
                                            <div className="h-2 w-2 rounded-full bg-[#5B8CFF] animate-bounce" />
                                            <div className="h-2 w-2 rounded-full bg-[#7C5FF5] animate-bounce" style={{ animationDelay: '0.15s' }} />
                                            <div className="h-2 w-2 rounded-full bg-[#22D3EE] animate-bounce" style={{ animationDelay: '0.3s' }} />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* ── Route-Aware Quick Suggestions ── */}
                            <div className="px-4 py-2 bg-white/[0.01] border-t border-white/[0.06] overflow-x-auto flex items-center gap-1.5 no-scrollbar">
                                <span className="text-[10px] text-[#64748B] uppercase font-bold mono mr-1 flex-shrink-0">Suggestions:</span>
                                {currentSuggestions.map((sug, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSendMessage(sug)}
                                        className="whitespace-nowrap text-[11px] px-2.5 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] text-[#94A3B8] hover:text-[#F8FAFC] border border-white/[0.06] transition-colors flex-shrink-0"
                                    >
                                        {sug}
                                    </button>
                                ))}
                            </div>

                            {/* ── Input Box ── */}
                            <div className="p-3 sm:p-4 border-t border-white/10 bg-[#070B14]">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }}
                                    className="relative flex items-center gap-2"
                                >
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder="Ask about transactions, policies, agents..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        className="glass-input pr-10 text-[13px] py-2.5 rounded-xl"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!inputValue.trim() || isTyping}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-[#5B8CFF] hover:bg-[#7C5FF5] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-white transition-all shadow-md"
                                        aria-label="Send message"
                                    >
                                        <Send size={14} />
                                    </button>
                                </form>
                                <div className="text-center text-[10px] text-[#64748B] mt-1.5">
                                    GuardRail AI provides real-time state analysis & policy telemetry.
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default ChatAssistant;
