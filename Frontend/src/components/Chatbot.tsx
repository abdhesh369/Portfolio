import { useState, useRef, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { X, Send, User, Minimize2 } from "lucide-react";
import { ChatbotIcon } from "./ChatbotIcon";
import ReactMarkdown from "react-markdown";
import { apiFetch } from "@/lib/api-helpers";

type Role = "user" | "model";

interface ChatMessage {
    role: Role;
    parts: { text: string }[];
}

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: "model", parts: [{ text: "Hi there! I'm Abdhesh's AI assistant. How can I help you today?" }] }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: ChatMessage = { role: "user", parts: [{ text: input.trim() }] };
        const newMessages = [...messages, userMsg];

        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const data = await apiFetch("/api/chat", null, {
                method: "POST",
                body: JSON.stringify({ messages: newMessages })
            });

            setMessages([...newMessages, { role: "model", parts: [{ text: data.message }] }]);
        } catch (error: any) {
            setMessages([
                ...newMessages,
                { role: "model", parts: [{ text: error.message || "Sorry, I am currently offline or experiencing issues. Please try again later or use the contact form." }] }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {!isOpen && (
                    <m.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 p-4 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:bg-cyan-500/20 hover:-translate-y-1 transition-all duration-300 group"
                        aria-label="Open AI Assistant"
                    >
                        <div className="absolute inset-0 rounded-full border border-cyan-400/50 animate-ping opacity-20" style={{ animationDuration: '3s' }} />
                        <ChatbotIcon className="w-6 h-6 group-hover:scale-110 transition-transform relative z-10" innerColor="currentColor" />
                        <span className="absolute -top-12 right-0 bg-[#0a0520] border border-cyan-500/30 text-cyan-400 font-mono px-3 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                            INITIALIZE_AI
                        </span>
                    </m.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <m.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] flex flex-col bg-[#0a0520]/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        {/* Glowing Top Border */}
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent box-shadow-glow" />

                        {/* Ambient Grid Background */}
                        <div
                            className="absolute inset-0 opacity-[0.02] pointer-events-none"
                            style={{
                                backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
                                backgroundSize: '20px 20px',
                            }}
                        />

                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02] relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="relative p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-cyan-400 group flex items-center justify-center">
                                    <div className="absolute inset-0 bg-cyan-500/20 blur-md rounded-lg opacity-50" />
                                    <ChatbotIcon className="w-5 h-5 relative z-10" innerColor="currentColor" />
                                </div>
                                <div>
                                    <h3 className="font-mono font-bold text-xs tracking-wider text-cyan-400">SYS.TERMINAL // AI</h3>
                                    <p className="text-[10px] font-mono text-gray-400 flex items-center gap-1.5 mt-0.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_5px_#34d399]"></span>
                                        UPLINK_ESTABLISHED
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-md transition-colors"
                                >
                                    <Minimize2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth relative z-10 custom-scrollbar">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                                >
                                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${msg.role === "user" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]" : "bg-[#0a0520] text-purple-400 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.1)]"}`}>
                                        {msg.role === "user" ? <User className="w-4 h-4" /> : <ChatbotIcon className="w-4 h-4" innerColor="currentColor" />}
                                    </div>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 border ${msg.role === "user" ? "bg-gradient-to-r from-cyan-600 to-blue-600 border-transparent text-white rounded-tr-sm shadow-lg" : "bg-white/5 border-white/10 rounded-tl-sm text-gray-200 backdrop-blur-md"}`}>
                                        <div className="prose prose-sm dark:prose-invert max-w-none break-words prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                                            {msg.role === 'model' ? (
                                                <ReactMarkdown>
                                                    {msg.parts[0].text}
                                                </ReactMarkdown>
                                            ) : (
                                                msg.parts[0].text
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-3 flex-row">
                                    <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[#0a0520] text-purple-400 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.1)] border">
                                        <ChatbotIcon className="w-4 h-4" innerColor="currentColor" />
                                    </div>
                                    <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white/5 border border-white/10 rounded-tl-sm text-gray-200 backdrop-blur-md flex items-center gap-1.5 h-11">
                                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10 bg-[#0a0520] relative z-10 flex flex-col gap-2">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="relative flex items-center group"
                            >
                                <div className="absolute left-3 font-mono text-cyan-400 text-sm font-bold flex items-center pointer-events-none">
                                    {">"}
                                </div>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Execute command..."
                                    disabled={isLoading}
                                    className="w-full pl-8 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 disabled:opacity-50 transition-all font-mono text-sm text-gray-200 placeholder:text-gray-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 p-2 text-cyan-500 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                            <div className="text-center">
                                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">AI_SYS // PROBABILITY_OF_ERRORS_EXISTS</span>
                            </div>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </>
    );
}
