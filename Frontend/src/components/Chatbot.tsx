import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Minimize2 } from "lucide-react";
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
            const data = await apiFetch("/api/v1/chat", null, {
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
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-primary/25 hover:-translate-y-1 transition-all duration-300 group"
                        aria-label="Open AI Assistant"
                    >
                        <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span className="absolute -top-10 right-0 bg-background/80 backdrop-blur-md border border-border px-3 py-1 rounded-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Ask AI Assistant
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] flex flex-col bg-background/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-full text-primary">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">AI Assistant</h3>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        Online
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                >
                                    <Minimize2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                                >
                                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground border border-border"}`}>
                                        {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted/50 border border-border rounded-tl-sm text-foreground"}`}>
                                        <div className="prose prose-sm dark:prose-invert max-w-none break-words">
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
                                    <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted text-foreground border border-border">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-muted/50 border border-border rounded-tl-sm text-foreground flex items-center gap-1">
                                        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 border-t border-border bg-background">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="relative flex items-center"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask anything..."
                                    disabled={isLoading}
                                    className="w-full pl-4 pr-12 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 transition-shadow"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 p-2 text-primary hover:bg-primary/10 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                            <div className="text-center mt-2">
                                <span className="text-[10px] text-muted-foreground">AI can make mistakes. Verify important info.</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
