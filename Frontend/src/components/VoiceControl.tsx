import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Mic, VolumeX } from "lucide-react";
import { useToast } from "#src/hooks/use-toast";
import { cn } from "#src/lib/utils";

/**
 * VoiceControl - Neutralized
 * Functional but limited to "Disabled" status per code review.
 */
export function VoiceControl() {
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  const toggleListening = () => {
    setIsListening(true);
    
    // Simulate attempt but fail gracefully
    setTimeout(() => {
      setIsListening(false);
      toast({
        title: "Voice Control Unavailable",
        description: "Voice navigation is disabled in this environment to maintain performance stability.",
        variant: "destructive"
      });
    }, 1500);
  };

  return (
    <div className="fixed bottom-48 left-6 z-[var(--z-dock)] flex flex-col items-start gap-3 pointer-events-none">
      <AnimatePresence>
        {isListening && (
          <m.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            className="pointer-events-auto flex items-center gap-4 glass-cyber p-4 rounded-2xl min-w-[200px]"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <VolumeX className="w-5 h-5 text-destructive animate-pulse" />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-1">
                Connecting...
              </div>
              <p className="text-sm font-medium text-white italic truncate max-w-[150px]">
                Initializing Link...
              </p>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <m.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleListening}
        className={cn(
          "pointer-events-auto p-4 rounded-2xl bg-background/40 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-500 group relative",
          isListening && "border-destructive/50 ring-4 ring-destructive/10 bg-destructive/5"
        )}
        aria-label="Voice control (Disabled)"
        title="Voice Control is disabled"
      >
        <div className="relative z-10 flex items-center gap-3">
            <div className="relative">
                <Mic className={cn("w-5 h-5 text-muted-foreground group-hover:text-destructive transition-colors", isListening && "text-destructive")} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-[100px] transition-all duration-500">
                Voice Control
            </span>
        </div>
        
        {/* Glow effect */}
        {!isListening && (
            <div className="absolute inset-0 rounded-2xl bg-destructive/0 group-hover:bg-destructive/5 transition-colors" />
        )}
      </m.button>
    </div>
  );
}
