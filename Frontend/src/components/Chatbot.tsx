import { useState, useRef, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Send, Minimize2, Trash2 } from "lucide-react";
import { ChatbotIcon } from "./ChatbotIcon";
import ReactMarkdown from "react-markdown";
import { apiFetch } from "@/lib/api-helpers";
import { formatTime } from "@/lib/utils/date";
import { useSiteSettings } from "@/hooks/use-site-settings";

type Role = "user" | "model";

const MAX_CLIENT_MESSAGES = 20; // Cap messages sent to API
const MAX_RENDERED_MESSAGES = 50; // Cap messages kept in state to prevent unbounded DOM growth

interface ChatMessage {
    id: string;
    role: Role;
    parts: { text: string }[];
    timestamp: number; // Unix ms when message was created
}

export function Chatbot() {
    const { data: settings } = useSiteSettings();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    useEffect(() => {
        if (settings && messages.length === 0) {
            setMessages([
                {
                    id: crypto.randomUUID(),
                    role: "model",
                    parts: [{ text: settings.chatbotGreeting || `Hi there! I'm ${settings.personalName?.split(" ")[0] || "Abdhesh"}'s AI assistant. How can I help you today?` }],
                    timestamp: Date.now()
                }
            ]);
        }
    }, [settings, messages.length]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastFocusedRef = useRef<HTMLElement | null>(null);
    const fabRef = useRef<HTMLButtonElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Effect 1: Focus management — only runs when chatbot opens/closes
    useEffect(() => {
        if (isOpen) {
            // Store last focused element to return focus later
            lastFocusedRef.current = document.activeElement as HTMLElement;
            // Focus input shortly after opening for animation
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            // Return focus when closing
            if (lastFocusedRef.current) {
                lastFocusedRef.current.focus();
            } else if (fabRef.current) {
                fabRef.current.focus();
            }
        }
    }, [isOpen]);

    // Effect 2: Scroll to bottom — only runs when new messages arrive
    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages]);

    // Focus Trap and Escape Key
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                return;
            }

            if (e.key === 'Tab') {
                if (!containerRef.current) return;

                const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );

                if (focusableElements.length === 0) return;

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", parts: [{ text: input.trim() }], timestamp: Date.now() };
        const newMessages = [...messages, userMsg].slice(-MAX_RENDERED_MESSAGES);

        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            // Only send the last N messages to avoid unbounded payload
            // Strip `timestamp` — backend Zod schema only expects { role, parts }
            const recentMessages = newMessages.slice(-MAX_CLIENT_MESSAGES).map(({ role, parts }) => ({ role, parts }));
            const data = await apiFetch("/api/v1/chat", {
                method: "POST",
                body: JSON.stringify({ messages: recentMessages })
            });

            setMessages([...newMessages, { id: crypto.randomUUID(), role: "model", parts: [{ text: data.message }], timestamp: Date.now() }]);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Sorry, I am currently offline or experiencing issues. Please try again later or use the contact form.";
            setMessages([
                ...newMessages,
                { id: crypto.randomUUID(), role: "model", parts: [{ text: errorMessage }], timestamp: Date.now() }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearMessages = () => {
        setMessages([
            { id: crypto.randomUUID(), role: "model", parts: [{ text: settings?.chatbotGreeting || `Hi there! I'm ${settings?.personalName?.split(" ")[0] || "Abdhesh"}'s AI assistant. How can I help you today?` }], timestamp: Date.now() }
        ]);
    };

    return (
        <>
            <AnimatePresence>
                {!isOpen && (
                    <m.button
                        ref={fabRef}
                        initial={{ scale: 0, opacity: 0, rotate: -180 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0, rotate: 180 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed right-4 sm:right-6 group pointer-events-auto"
                        style={{ 
                            bottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
                            zIndex: 'var(--z-floating)'
                        }}
                        aria-label="Initialize AI Assistant"
                    >
                        {/* Outer Pulsing Ring */}
                        <m.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -inset-4 rounded-full border border-cyan-500/50 blur-sm"
                        />

                        {/* Middle Rotating Ring */}
                        <m.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-2 rounded-full border border-dashed border-cyan-400/30"
                        />

                        {/* Main FAB Body */}
                        <div className="relative w-14 h-14 bg-card/80 backdrop-blur-xl border border-cyan-500/30 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] group-hover:border-cyan-400 transition-all duration-500 overflow-hidden">
                            {/* Inner Glow */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 opacity-50" />

                            {/* Scanning Effect */}
                            <m.div
                                animate={{ top: ['-100%', '200%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-1 bg-cyan-400/20 blur-[2px] z-20"
                            />

                            <ChatbotIcon className="w-7 h-7 text-cyan-400 relative z-10 group-hover:scale-110 transition-transform duration-500" innerColor="currentColor" />
                        </div>

                        {/* Tooltip */}
                        <span className="absolute -top-12 right-0 bg-card border border-cyan-500/30 text-cyan-400 font-mono px-3 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 whitespace-nowrap pointer-events-none shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                            SYS.INITIALIZE_CORE
                        </span>
                    </m.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <m.div
                        ref={containerRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="chatbot-title"
                        initial={{ opacity: 0, y: 40, scale: 0.95, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: 40, scale: 0.95, filter: 'blur(10px)' }}
                        className="fixed right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] h-[550px] max-h-[85vh] flex flex-col bg-card/95 backdrop-blur-[40px] border border-white/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
                        style={{ 
                            bottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
                            zIndex: 'var(--z-chatbot)'
                        }}
                    >
                        {/* Sci-Fi Accent Lines */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 z-20" />
                        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent opacity-50 z-20" />

                        {/* Cyber Grid Background */}
                        <div className="absolute inset-0 cyber-grid-bg opacity-[0.03] pointer-events-none z-0" />

                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.01] relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-cyan-500/30 blur-md rounded-lg animate-pulse" />
                                    <div className="relative p-2.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-cyan-400">
                                        <ChatbotIcon className="w-5 h-5" innerColor="currentColor" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card shadow-[0_0_8px_#10b981]" />
                                </div>
                                <div>
                                    <h3 id="chatbot-title" className="font-mono font-black text-[11px] tracking-[0.2em] text-cyan-400 uppercase">SYS.DIGITAL_TWIN // {settings?.personalName?.toUpperCase() || "ABDHESH"}</h3>
                                    <p className="text-[9px] font-mono text-gray-500 tracking-wider flex items-center gap-2 mt-1 uppercase">
                                        <span className="inline-block w-1.5 h-[1px] bg-cyan-500/50"></span>
                                        SECURE_UPLINK.ACTIVE
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={clearMessages}
                                    title="Clear conversation"
                                    className="group p-2 text-gray-500 hover:text-red-400 transition-all hover:bg-red-500/5 rounded-lg border border-transparent hover:border-red-500/20"
                                >
                                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    aria-label="Close chat"
                                    className="group p-2 text-gray-500 hover:text-cyan-400 transition-all hover:bg-cyan-500/5 rounded-lg border border-transparent hover:border-cyan-500/20"
                                >
                                    <Minimize2 className="w-4 h-4 group-hover:scale-90 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div
                            className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth relative z-10 custom-scrollbar"
                            aria-live="polite"
                            aria-relevant="additions"
                        >
                            {messages.map((msg) => (
                                <m.div
                                    key={msg.id}
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse text-right" : "flex-row text-left"}`}
                                >
                                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border font-mono text-[10px] font-bold ${msg.role === "user"
                                        ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                                        : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                                        }`}>
                                        {msg.role === "user" ? "USR" : "SYS"}
                                    </div>

                                    <div className={`max-w-[85%] relative group/msg`}>
                                        <div className={`px-5 py-3.5 border transition-all duration-300 ${msg.role === "user"
                                            ? "bg-cyan-600/10 border-cyan-500/20 text-cyan-50 rounded-2xl rounded-tr-none hover:border-cyan-500/40"
                                            : "bg-white/5 border-white/5 text-gray-300 rounded-2xl rounded-tl-none hover:bg-white/[0.07] hover:border-white/10"
                                            }`}>
                                            <div className={`prose prose-sm dark:prose-invert max-w-none break-words prose-p:leading-relaxed ${msg.role === 'model' ? 'font-mono text-[13px] tracking-tight' : 'font-sans'
                                                }`}>
                                                {msg.role === 'model' ? (
                                                    <ReactMarkdown
                                                        components={{
                                                            a: ({ ...props }) => (
                                                                <a {...props} target="_blank" rel="noopener noreferrer" />
                                                            )
                                                        }}
                                                    >
                                                        {msg.parts[0].text}
                                                    </ReactMarkdown>
                                                ) : (
                                                    msg.parts[0].text
                                                )}
                                            </div>
                                        </div>
                                        {/* Timestamp/Status subtle text on hover */}
                                        <div className={`absolute -bottom-5 ${msg.role === 'user' ? 'right-0' : 'left-0'} opacity-0 group-hover/msg:opacity-100 transition-opacity font-mono text-[8px] text-gray-500 uppercase tracking-widest`}>
                                            {msg.role === 'user' ? 'PACKET_SENT' : 'DATA_RECEIVED'} // {formatTime(msg.timestamp)}
                                        </div>
                                    </div>
                                </m.div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-4 flex-row">
                                    <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/10 text-purple-400 border-purple-500/30 font-mono text-[10px] font-bold border">
                                        SYS
                                    </div>
                                    <div className="px-5 py-4 bg-white/5 border border-white/5 rounded-2xl rounded-tl-none flex items-center gap-2 h-12">
                                        <m.div
                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                            className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
                                        />
                                        <m.div
                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                            className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
                                        />
                                        <m.div
                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                                            className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
                                        />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 border-t border-white/5 bg-black/20 backdrop-blur-md relative z-10">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="relative flex items-center group"
                            >
                                <div className="absolute left-4 font-mono text-cyan-500 text-sm font-black flex items-center pointer-events-none group-focus-within:text-cyan-400 transition-colors">
                                    {">"}
                                </div>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Execute command..."
                                    disabled={isLoading}
                                    className="w-full pl-10 pr-14 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:border-cyan-500/30 focus:bg-white/[0.08] disabled:opacity-50 transition-all font-mono text-[13px] text-gray-200 placeholder:text-gray-600 shadow-inner"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    aria-label="Send message"
                                    className="absolute right-3 p-2.5 text-cyan-500 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-all border border-transparent hover:border-cyan-500/20"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                            <div className="flex justify-between items-center mt-4">
                                <span className="text-[8px] font-mono text-gray-600 uppercase tracking-[0.2em]">TERMINAL_LOG // 0xAF42</span>
                                <span className="text-[8px] font-mono text-gray-600 uppercase tracking-[0.2em]">CPU: {isLoading ? 'BUSY' : 'IDLE'}</span>
                            </div>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </>
    );
}
