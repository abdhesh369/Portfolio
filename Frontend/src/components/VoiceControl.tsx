import { useState, useEffect, useCallback, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Command, Wand2, Volume2, Search, ArrowRight, X } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const COMMANDS = {
  PROJECTS: ["projects", "project", "work", "portfolio"],
  SKILLS: ["skills", "skill", "stack", "technology"],
  EXPERIENCE: ["experience", "career", "job", "history"],
  CONTACT: ["contact", "message", "hire", "email"],
  DEV_MODE: ["hacker mode", "dev mode", "hack", "sudo dev mode"],
  HOME: ["home", "top", "main", "start"],
  RESUME: ["resume", "cv"],
  SEARCH: ["search", "find"],
};

export function VoiceControl() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // We want to process one command at a time
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const result = event.results[current][0].transcript.toLowerCase();
      setTranscript(result);

      if (event.results[current].isFinal) {
        handleCommand(result);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
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
    const findMatch = (cmdList: string[]) => cmdList.some(cmd => text.includes(cmd));

    let executed = false;
    let feedback = "";

    if (findMatch(COMMANDS.PROJECTS)) {
      setLocation("/#projects");
      feedback = "Navigating to Projects";
      executed = true;
    } else if (findMatch(COMMANDS.SKILLS)) {
      setLocation("/#skills");
      feedback = "Navigating to Skills";
      executed = true;
    } else if (findMatch(COMMANDS.EXPERIENCE)) {
      setLocation("/#experience");
      feedback = "Navigating to Experience";
      executed = true;
    } else if (findMatch(COMMANDS.CONTACT)) {
      setLocation("/#contact");
      feedback = "Navigating to Contact";
      executed = true;
    } else if (findMatch(COMMANDS.HOME)) {
      setLocation("/");
      feedback = "Navigating to Home";
      executed = true;
    } else if (findMatch(COMMANDS.RESUME)) {
      setLocation("/resume");
      feedback = "Opening Resume";
      executed = true;
    } else if (findMatch(COMMANDS.SEARCH)) {
      setLocation("/search");
      feedback = "Opening Search";
      executed = true;
    } else if (findMatch(COMMANDS.DEV_MODE)) {
        // Dev mode is usually a secret, but voice can trigger it if they know the command
        // We trigger it via a custom event that CommandPalette or App can listen to
        window.dispatchEvent(new CustomEvent('activate-dev-mode'));
        feedback = "Dev Mode Activated";
        executed = true;
    }

    if (executed) {
      setLastCommand(feedback);
      toast({
        title: "Voice Command Recognized",
        description: feedback,
        duration: 2000,
      });
      setTimeout(() => setLastCommand(null), 3000);
    } else {
        toast({
            title: "Command Not Recognized",
            description: `I heard: "${text}". Try saying "Projects" or "Contact".`,
            variant: "destructive"
        });
    }
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
    <div className="fixed bottom-32 left-8 z-[var(--z-dock)] flex flex-col items-start gap-3 pointer-events-none">
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
                    <Check size={14} />
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

function Check({ size, className }: { size?: number, className?: string }) {
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
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}
