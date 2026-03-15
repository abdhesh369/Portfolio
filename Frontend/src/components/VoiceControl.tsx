import { useState, useEffect, useCallback, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Mic, Volume2 } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/** Voice command routing map — add new commands here, not in handleCommand */
const VOICE_ROUTES: Array<{ keywords: string[]; path: string; feedback: string }> = [
  { keywords: ["projects", "project", "work", "portfolio"], path: "/#projects", feedback: "Navigating to Projects" },
  { keywords: ["skills", "skill", "stack", "technology"], path: "/#skills", feedback: "Navigating to Skills" },
  { keywords: ["experience", "career", "job", "history"], path: "/#experience", feedback: "Navigating to Experience" },
  { keywords: ["contact", "message", "hire", "email"], path: "/#contact", feedback: "Navigating to Contact" },
  { keywords: ["home", "top", "main", "start"], path: "/", feedback: "Navigating to Home" },
  { keywords: ["resume", "cv"], path: "/resume", feedback: "Opening Resume" },
  { keywords: ["search", "find"], path: "/search", feedback: "Opening Search" },
];

const DEV_MODE_KEYWORDS = ["hacker mode", "dev mode", "hack", "sudo dev mode"];

export function VoiceControl() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.resultIndex;
      const result = event.results[current][0].transcript.toLowerCase();
      setTranscript(result);

      if (event.results[current].isFinal) {
        handleCommand(result);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (import.meta.env.DEV) {
        console.error("Speech recognition error", event.error);
      }
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast({
          title: "Microphone Access Denied",
          description: "Please enable microphone access to use voice navigation.",
          variant: "destructive"
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const handleCommand = useCallback((text: string) => {
    // Check navigation routes via data-driven lookup (OCP-compliant)
    const match = VOICE_ROUTES.find(route => route.keywords.some(kw => text.includes(kw)));

    if (match) {
      setLocation(match.path);
      setLastCommand(match.feedback);
      toast({ title: "Voice Command Recognized", description: match.feedback, duration: 2000 });
      setTimeout(() => setLastCommand(null), 3000);
      return;
    }

    // Special: Dev Mode activation
    if (DEV_MODE_KEYWORDS.some(kw => text.includes(kw))) {
      window.dispatchEvent(new CustomEvent('activate-dev-mode'));
      setLastCommand("Dev Mode Activated");
      toast({ title: "Voice Command Recognized", description: "Dev Mode Activated", duration: 2000 });
      setTimeout(() => setLastCommand(null), 3000);
      return;
    }

    toast({
      title: "Command Not Recognized",
      description: `I heard: "${text}". Try saying "Projects" or "Contact".`,
      variant: "destructive"
    });
  }, [setLocation, toast]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  if (!isSupported) return null;

  return (
    <div className="fixed bottom-[8.5rem] left-6 z-[var(--z-dock)] flex flex-col items-start gap-3 pointer-events-none">
      <AnimatePresence>
        {(isListening || transcript) && (
          <m.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            className="pointer-events-auto flex items-center gap-4 glass-cyber p-4 rounded-2xl min-w-[200px]"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Volume2 className={cn("w-5 h-5 text-primary", isListening && "animate-pulse")} />
              </div>
              {isListening && (
                <m.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-full bg-primary/20"
                />
              )}
            </div>
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-1">
                {isListening ? "Listening..." : "Processing..."}
              </div>
              <p className="text-sm font-medium text-white italic truncate max-w-[150px]">
                {transcript || "Speak now..."}
              </p>
            </div>
            {lastCommand && (
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckIcon size={14} />
                    Done
                </div>
            )}
          </m.div>
        )}
      </AnimatePresence>

      <m.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleListening}
        className={cn(
          "pointer-events-auto p-4 rounded-2xl bg-background/40 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-500 group relative",
          isListening && "border-primary/50 ring-4 ring-primary/10 bg-primary/5"
        )}
        aria-label={isListening ? "Stop listening" : "Start voice control"}
        title="Voice Commands: Say 'Projects', 'Skills', 'Contact', etc."
      >
        <div className="relative z-10 flex items-center gap-3">
            <div className="relative">
                {isListening ? (
                    <Mic className="w-5 h-5 text-primary animate-pulse" />
                ) : (
                    <Mic className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-[100px] transition-all duration-500">
                Voice Control
            </span>
        </div>
        
        {/* Glow effect when idle */}
        {!isListening && (
            <div className="absolute inset-0 rounded-2xl bg-primary/0 group-hover:bg-primary/5 transition-colors" />
        )}
      </m.button>
    </div>
  );
}

/** Decorative check icon — aria-hidden since adjacent text provides meaning */
function CheckIcon({ size, className }: { size?: number, className?: string }) {
    return (
        <svg 
            width={size || 24} 
            height={size || 24} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
            aria-hidden="true"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}
