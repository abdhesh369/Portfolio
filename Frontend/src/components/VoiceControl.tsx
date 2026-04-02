import { useState, useCallback, useEffect, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Zap, AlertCircle, Volume2 } from "lucide-react";
import { useToast } from "#src/hooks/use-toast";
import { cn } from "#src/lib/utils";
import { useSpeechRecognition } from "#src/hooks/use-speech-recognition";
import { matchVoiceCommand, type VoiceAction, type VoiceActionHelpers } from "#src/lib/voice-commands";
import { useLocation } from "wouter";
import { useTheme } from "#src/components/theme-provider";

type FeedbackState =
  | { type: "idle" }
  | { type: "listening" }
  | { type: "matched"; label: string }
  | { type: "no-match"; transcript: string }
  | { type: "error"; message: string };

/**
 * VoiceControl — Fully Functional
 * Uses the Web Speech API to recognize voice commands for portfolio navigation.
 */
export function VoiceControl() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const [feedback, setFeedback] = useState<FeedbackState>({ type: "idle" });
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasShownUnsupportedRef = useRef(false);

  // Build action helpers
  const helpers: VoiceActionHelpers = {
    navigate: (path: string) => setLocation(path),
    scrollToSection: (id: string) => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        // If not on home page, navigate there first with hash
        setLocation(`/#${id}`);
      }
    },
    toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
    scrollToTop: () => window.scrollTo({ top: 0, behavior: "smooth" }),
  };

  const clearFeedbackTimer = useCallback(() => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, []);

  const showTemporaryFeedback = useCallback(
    (state: FeedbackState, durationMs = 2500) => {
      clearFeedbackTimer();
      setFeedback(state);
      feedbackTimerRef.current = setTimeout(() => {
        setFeedback({ type: "idle" });
        feedbackTimerRef.current = null;
      }, durationMs);
    },
    [clearFeedbackTimer]
  );

  const handleResult = useCallback(
    (transcript: string) => {
      const matched: VoiceAction | null = matchVoiceCommand(transcript);
      if (matched) {
        showTemporaryFeedback({ type: "matched", label: matched.label }, 2000);
        // Small delay so user sees the match feedback before navigation
        setTimeout(() => matched.execute(helpers), 300);
      } else {
        showTemporaryFeedback(
          { type: "no-match", transcript },
          3000
        );
      }
    },
    [helpers, showTemporaryFeedback]
  );

  const handleError = useCallback(
    (error: string) => {
      const messages: Record<string, string> = {
        "not-supported": "Voice not supported in this browser.",
        "not-allowed": "Microphone access denied. Please allow mic permissions.",
        network: "Network error. Check your connection.",
        "no-speech": "No speech detected. Try again.",
        aborted: "Listening cancelled.",
        unknown: "Something went wrong. Try again.",
      };
      showTemporaryFeedback(
        { type: "error", message: messages[error] || messages.unknown },
        3000
      );
    },
    [showTemporaryFeedback]
  );

  const {
    isSupported,
    isListening,
    transcript: liveTranscript,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    lang: "en-US",
    silenceTimeout: 4000,
    onResult: handleResult,
    onError: handleError,
  });

  // Sync listening state to feedback
  useEffect(() => {
    if (isListening) {
      setFeedback({ type: "listening" });
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (!isSupported) {
      if (!hasShownUnsupportedRef.current) {
        toast({
          title: "Voice Control Unavailable",
          description:
            "Your browser doesn't support the Web Speech API. Try Chrome, Edge, or Safari.",
          variant: "destructive",
        });
        hasShownUnsupportedRef.current = true;
      }
      return;
    }

    if (isListening) {
      stopListening();
      setFeedback({ type: "idle" });
    } else {
      startListening();
    }
  }, [isSupported, isListening, startListening, stopListening, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearFeedbackTimer();
    };
  }, [clearFeedbackTimer]);

  // Determine visual state
  const isActive = isListening || feedback.type === "matched";
  const isError = feedback.type === "error" || feedback.type === "no-match";
  const showPanel = feedback.type !== "idle";

  return (
    <div className="fixed bottom-48 left-6 z-[var(--z-dock)] flex flex-col items-start gap-3 pointer-events-none">
      <AnimatePresence>
        {showPanel && (
          <m.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="pointer-events-auto flex items-center gap-4 glass-cyber p-4 rounded-2xl min-w-[220px] max-w-[320px]"
          >
            {/* Status icon */}
            <div className="relative shrink-0">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                  feedback.type === "listening" &&
                    "bg-primary/10",
                  feedback.type === "matched" &&
                    "bg-emerald-500/10",
                  (feedback.type === "error" || feedback.type === "no-match") &&
                    "bg-destructive/10"
                )}
              >
                {feedback.type === "listening" && (
                  <Volume2 className="w-5 h-5 text-primary animate-pulse" />
                )}
                {feedback.type === "matched" && (
                  <Zap className="w-5 h-5 text-emerald-400" />
                )}
                {(feedback.type === "error" || feedback.type === "no-match") && (
                  <AlertCircle className="w-5 h-5 text-destructive" />
                )}
              </div>

              {/* Pulsing ring when listening */}
              {feedback.type === "listening" && (
                <m.div
                  className="absolute inset-0 rounded-full border-2 border-primary/30"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <div
                className={cn(
                  "text-[10px] uppercase tracking-widest font-black mb-1",
                  feedback.type === "listening" && "text-primary/70",
                  feedback.type === "matched" && "text-emerald-400/70",
                  (feedback.type === "error" || feedback.type === "no-match") &&
                    "text-destructive/70"
                )}
              >
                {feedback.type === "listening" && "Listening..."}
                {feedback.type === "matched" && "Command Matched"}
                {feedback.type === "no-match" && "Not Recognized"}
                {feedback.type === "error" && "Error"}
              </div>
              <p className="text-sm font-medium text-white truncate max-w-[200px]">
                {feedback.type === "listening" &&
                  (liveTranscript || "Say a command...")}
                {feedback.type === "matched" && feedback.label}
                {feedback.type === "no-match" &&
                  `"${feedback.transcript}"`}
                {feedback.type === "error" && feedback.message}
              </p>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Mic Button */}
      <m.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleListening}
        className={cn(
          "pointer-events-auto p-4 rounded-2xl bg-background/40 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-500 group relative focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isActive &&
            "border-primary/50 ring-4 ring-primary/10 bg-primary/5",
          isError &&
            "border-destructive/50 ring-4 ring-destructive/10 bg-destructive/5"
        )}
        aria-label={
          isListening
            ? "Stop voice control"
            : isSupported
              ? "Start voice control"
              : "Voice control (not supported)"
        }
        title={
          isListening
            ? "Click to stop listening"
            : isSupported
              ? "Click to start voice navigation"
              : "Voice control is not supported in this browser"
        }
      >
        <div className="relative z-10 flex items-center gap-3">
          <div className="relative">
            {isListening ? (
              <MicOff
                className="w-5 h-5 text-primary transition-colors"
              />
            ) : (
              <Mic
                className={cn(
                  "w-5 h-5 transition-colors",
                  isSupported
                    ? "text-muted-foreground group-hover:text-primary"
                    : "text-muted-foreground/50"
                )}
              />
            )}

            {/* Active indicator dot */}
            {isListening && (
              <m.div
                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-[100px] transition-all duration-500">
            {isListening ? "Stop" : "Voice"}
          </span>
        </div>

        {/* Glow effect */}
        {!isActive && !isError && (
          <div className="absolute inset-0 rounded-2xl bg-primary/0 group-hover:bg-primary/5 transition-colors" />
        )}
      </m.button>
    </div>
  );
}
