import { useState, useRef, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Send, Bot, User, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-helpers";
import { useSendMessage } from "@/hooks/portfolio/use-contact";
import { useSiteSettings } from "@/hooks/use-site-settings";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
}

// AI reply pattern to identify collected data
const COLLECTED_PATTERN = /COLLECTED:(\{.*\})/;

interface HireMeChatProps {
  onSuccess?: () => void;
}

export function HireMeChat({ onSuccess }: HireMeChatProps) {
  const { data: settings } = useSiteSettings();
  const { mutate: sendMessage } = useSendMessage();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initial greeting
  useEffect(() => {
    const name = settings?.personalName?.split(" ")[0] || "the developer";
    setMessages([{
      id: "init",
      role: "model",
      text: `Hi! I'm ${name}'s AI assistant. Tell me what you'd like to build — I'll help figure out the details.`,
    }]);
  }, [settings?.personalName]);

  // Scroll to bottom on updates
  useEffect(() => {
    // Only scroll if there's more than just the initial greeting, 
    // or if we've already started a user interaction (isLoading)
    if (messages.length > 1 || isLoading) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || isSubmitted) return;

    const userText = input.trim();
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text: userText };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const payload = updatedMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const res = await apiFetch("/api/v1/chat/hire", {
        method: "POST",
        body: JSON.stringify({ messages: payload }),
      });

      const reply: string = res.message ?? "";
      const match = reply.match(COLLECTED_PATTERN);

      if (match) {
        // Collect data and trigger submission
        try {
          const collected = JSON.parse(match[1]);
          const closingText = reply.replace(/COLLECTED:\{.*\}/, "").trim();

          sendMessage(
            {
              name: collected.name || "Unknown",
              email: collected.email || "",
              subject: collected.subject || "Project Inquiry via AI Chat",
              message: collected.message || "Collected via hire bot",
              projectType: collected.projectType || "",
              budget: collected.budget || "",
              timeline: collected.timeline || "",
            },
            {
              onSuccess: () => {
                setIsSubmitted(true);
                onSuccess?.();
              },
            }
          );

          setMessages([...updatedMessages, {
            id: crypto.randomUUID(),
            role: "model",
            text: closingText || "Got it! I've sent your details. Expect a response soon.",
          }]);
        } catch (parseErr) {
          console.error("Failed to parse collected data", parseErr);
          setMessages([...updatedMessages, {
            id: crypto.randomUUID(),
            role: "model",
            text: reply,
          }]);
        }
      } else {
        setMessages([...updatedMessages, {
          id: crypto.randomUUID(),
          role: "model",
          text: reply,
        }]);
      }
    } catch {
      setMessages([...updatedMessages, {
        id: crypto.randomUUID(),
        role: "model",
        text: "Sorry, I'm having trouble connecting. Please try the Project Request form or Email.",
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isSubmitted) {
    return (
      <m.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Transmission Successful</h3>
        <p className="text-muted-foreground font-mono text-sm max-w-xs">
          Target received packet. Expect a response within 24 hours.
        </p>
      </m.div>
    );
  }

  return (
    <div className="flex flex-col h-[480px]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <m.div
              key={msg.id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs
                ${msg.role === "model"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "bg-foreground/10 text-foreground border border-border"
                }`}
              >
                {msg.role === "model" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed font-mono
                ${msg.role === "model"
                  ? "bg-card border border-border text-foreground rounded-tl-sm shadow-sm"
                  : "bg-cyan-500/10 border border-cyan-500/30 text-foreground rounded-tr-sm"
                }`}
              >
                {msg.text}
              </div>
            </m.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <m.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-border">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map(i => (
                  <m.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                  />
                ))}
              </div>
            </div>
          </m.div>
        )}
        <div ref={bottomRef} className="h-2" />
      </div>

      {/* Input area */}
      <div className="relative mt-auto pt-2 border-t border-border/50">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Transmit your message..."
          disabled={isLoading}
          rows={1}
          className="w-full px-4 py-4 pr-14 bg-card/40 border border-border rounded-xl text-sm outline-none focus:border-cyan-500/50 transition-all font-mono placeholder:text-muted-foreground/50 disabled:opacity-50 resize-none hover:bg-card/60"
        />
        <Button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
          className="absolute right-2 top-[calc(50%+4px)] -translate-y-1/2 h-10 w-10 p-0 bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-lg shadow-cyan-900/20"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
