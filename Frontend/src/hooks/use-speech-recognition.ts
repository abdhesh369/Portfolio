import { useState, useRef, useCallback, useEffect } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

// No global Window augmentation to avoid conflicts with lib.dom.d.ts or other definitions.
// We use (window as any) internal to the hook where needed.

export type SpeechError =
  | "not-supported"
  | "not-allowed"
  | "network"
  | "no-speech"
  | "aborted"
  | "unknown";

interface UseSpeechRecognitionReturn {
  /** Whether the browser supports the Web Speech API */
  isSupported: boolean;
  /** Whether the recognizer is actively listening */
  isListening: boolean;
  /** Live interim transcript (updates as user speaks) */
  transcript: string;
  /** The finalized recognized text from the last utterance */
  finalTranscript: string;
  /** The last error that occurred, if any */
  error: SpeechError | null;
  /** Start listening for speech */
  startListening: () => void;
  /** Stop listening */
  stopListening: () => void;
}

// ─── Check browser support ─────────────────────────────────────────────────

const getSpeechRecognitionConstructor = (): (new () => SpeechRecognitionInstance) | null => {
  if (typeof window === "undefined") return null;
  const win = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
};

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useSpeechRecognition(
  options: {
    /** Language code (default: "en-US") */
    lang?: string;
    /** Auto-stop after this many ms of silence (default: 4000) */
    silenceTimeout?: number;
    /** Called when a final transcript is produced */
    onResult?: (transcript: string) => void;
    /** Called when an error occurs */
    onError?: (error: SpeechError) => void;
  } = {}
): UseSpeechRecognitionReturn {
  const {
    lang = "en-US",
    silenceTimeout = 4000,
    onResult,
    onError,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [error, setError] = useState<SpeechError | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isStoppingRef = useRef(false);

  const isSupported = getSpeechRecognitionConstructor() !== null;

  // Stable callback refs
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  useEffect(() => { onResultRef.current = onResult; }, [onResult]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const resetSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      // No speech detected in time — stop gracefully
      if (recognitionRef.current && !isStoppingRef.current) {
        isStoppingRef.current = true;
        recognitionRef.current.stop();
      }
    }, silenceTimeout);
  }, [silenceTimeout, clearSilenceTimer]);

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    if (recognitionRef.current && !isStoppingRef.current) {
      isStoppingRef.current = true;
      recognitionRef.current.stop();
    }
  }, [clearSilenceTimer]);

  const startListening = useCallback(() => {
    const Constructor = getSpeechRecognitionConstructor();
    if (!Constructor) {
      setError("not-supported");
      onErrorRef.current?.("not-supported");
      return;
    }

    // If already listening, stop first
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      // We don't null it here yet; let the existing onend handler (with instance check) deal with it,
      // or we override it below.
    }

    setError(null);
    setTranscript("");
    setFinalTranscript("");
    isStoppingRef.current = false;

    const recognition = new Constructor();
    recognition.continuous = false; // Single utterance mode
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      resetSilenceTimer();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      resetSilenceTimer(); // Reset silence timer on any result

      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (interim) setTranscript(interim);

      if (final) {
        const cleaned = final.trim().toLowerCase();
        setFinalTranscript(cleaned);
        setTranscript(cleaned);
        onResultRef.current?.(cleaned);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      clearSilenceTimer();
      let mappedError: SpeechError;
      switch (event.error) {
        case "not-allowed":
          mappedError = "not-allowed";
          break;
        case "network":
          mappedError = "network";
          break;
        case "no-speech":
          mappedError = "no-speech";
          break;
        case "aborted":
          mappedError = "aborted";
          break;
        default:
          mappedError = "unknown";
      }
      setError(mappedError);
      onErrorRef.current?.(mappedError);
    };

    recognition.onend = () => {
      clearSilenceTimer();
      // Only clear collective state if THIS instance is the active one
      if (recognitionRef.current === recognition) {
        setIsListening(false);
        isStoppingRef.current = false;
        recognitionRef.current = null;
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setError("unknown");
      setIsListening(false);
      onErrorRef.current?.("unknown");
    }
  }, [lang, resetSilenceTimer, clearSilenceTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSilenceTimer();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, [clearSilenceTimer]);

  return {
    isSupported,
    isListening,
    transcript,
    finalTranscript,
    error,
    startListening,
    stopListening,
  };
}
