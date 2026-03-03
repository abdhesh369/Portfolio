import React, { useState, useRef, useEffect, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Constants & Configuration                                         */
/* ------------------------------------------------------------------ */

const CONTACT_EMAIL = "abdheshshah111@gmail.com";
const GITHUB_URL = "github.com/abdhesh369";
const LINKEDIN_URL = "linkedin.com/in/abdhesh369";

interface TerminalLine {
  type: "input" | "output" | "error" | "info" | "ascii";
  text: string;
}

const COMMANDS: Record<string, (args: string[], error?: Error) => string[]> = {
  help: () => [
    "",
    "  Available commands:",
    "  ─────────────────────────────────────",
    "  help       Show this help message",
    "  status     Display current system status",
    "  error      Show error details",
    "  contact    Show contact information",
    "  home       Navigate to homepage",
    "  reload     Reload the application",
    "  clear      Clear the terminal",
    "",
  ],

  status: () => {
    const ua = navigator.userAgent;
    const mem = (performance as any).memory;
    return [
      "",
      `  System Status`,
      `  ─────────────────────────────────────`,
      `  Runtime     : React ${React.version}`,
      `  Viewport    : ${window.innerWidth}×${window.innerHeight}`,
      `  Platform    : ${ua.includes("Win") ? "Windows" : ua.includes("Mac") ? "macOS" : ua.includes("Linux") ? "Linux" : "Unknown"}`,
      `  Online      : ${navigator.onLine ? "Yes" : "No"}`,
      ...(mem ? [`  Heap Used   : ${(mem.usedJSHeapSize / 1048576).toFixed(1)} MB`] : []),
      `  Timestamp   : ${new Date().toISOString()}`,
      "",
    ];
  },

  error: (_args, error) => {
    if (!error) return ["  No error information available."];
    return [
      "",
      "  Error Details",
      "  ─────────────────────────────────────",
      `  Name    : ${error.name}`,
      `  Message : ${error.message}`,
      ...(error.stack
        ? [
          "  Stack   :",
          ...error.stack
            .split("\n")
            .slice(1, 6)
            .map((l) => `    ${l.trim()}`),
        ]
        : []),
      "",
    ];
  },

  contact: () => [
    "",
    "  Contact Information",
    "  ─────────────────────────────────────",
    `  Email    : ${CONTACT_EMAIL}`,
    `  GitHub   : ${GITHUB_URL}`,
    `  LinkedIn : ${LINKEDIN_URL}`,
    "",
  ],

  home: () => {
    window.location.href = "/";
    return ["  Navigating to homepage…"];
  },

  reload: () => {
    window.location.reload();
    return ["  Reloading…"];
  },
};

/* ------------------------------------------------------------------ */
/*  ASCII art header                                                   */
/* ------------------------------------------------------------------ */

const BOOT_LINES: TerminalLine[] = [
  { type: "ascii", text: "  ╔══════════════════════════════════════╗" },
  { type: "ascii", text: "  ║     PORTFOLIO  RECOVERY  TERMINAL    ║" },
  { type: "ascii", text: "  ╚══════════════════════════════════════╝" },
  { type: "info", text: "" },
  { type: "error", text: "  [CRASH] The application encountered a fatal error." },
  { type: "info", text: '  Type "help" to see available commands.' },
  { type: "info", text: "" },
];

/* ------------------------------------------------------------------ */
/*  Terminal UI (functional component rendered by the class boundary)  */
/* ------------------------------------------------------------------ */

function TerminalFallback({ error }: { error?: Error }) {
  const [lines, setLines] = useState<TerminalLine[]>(BOOT_LINES);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const execute = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      const [cmd, ...args] = trimmed.toLowerCase().split(/\s+/);

      setHistory((h) => [...h, trimmed]);
      setHistoryIdx(-1);

      const inputLine: TerminalLine = { type: "input", text: `$ ${trimmed}` };

      if (cmd === "clear") {
        setLines([]);
        return;
      }

      const handler = COMMANDS[cmd];
      if (handler) {
        const output = handler(args, error);
        setLines((prev) => [
          ...prev,
          inputLine,
          ...output.map((text): TerminalLine => ({ type: "output", text })),
        ]);
      } else {
        setLines((prev) => [
          ...prev,
          inputLine,
          { type: "error", text: `  Command not found: ${cmd}. Type "help" for available commands.` },
        ]);
      }
    },
    [error],
  );

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      execute(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const next = historyIdx < 0 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(next);
      setInput(history[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx < 0) return;
      const next = historyIdx + 1;
      if (next >= history.length) {
        setHistoryIdx(-1);
        setInput("");
      } else {
        setHistoryIdx(next);
        setInput(history[next]);
      }
    }
  };

  const lineColor = (type: TerminalLine["type"]) => {
    switch (type) {
      case "input": return "text-emerald-400";
      case "error": return "text-red-400";
      case "info": return "text-zinc-500";
      case "ascii": return "text-cyan-400";
      default: return "text-zinc-300";
    }
  };

  return (
    <div
      className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 sm:p-6"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="w-full max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900/80 shadow-2xl overflow-hidden backdrop-blur">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-3 text-xs font-mono text-zinc-500 select-none">
            recovery-terminal — abdhesh.dev
          </span>
        </div>

        {/* Terminal body */}
        <div
          ref={scrollRef}
          className="h-[60vh] max-h-[500px] overflow-y-auto p-4 font-mono text-sm leading-relaxed scrollbar-thin"
        >
          {lines.map((line, i) => (
            <div key={i} className={`${lineColor(line.type)} whitespace-pre`}>
              {line.text}
            </div>
          ))}

          {/* Input line */}
          <div className="flex items-center mt-1">
            <span className="text-emerald-400 mr-2 select-none">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              className="flex-1 bg-transparent text-zinc-100 outline-none caret-emerald-400 font-mono text-sm"
              spellCheck={false}
              autoComplete="off"
              aria-label="Terminal input"
            />
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-t border-zinc-800 text-[11px] font-mono text-zinc-600">
          <span>React {React.version}</span>
          <span>{new Date().toLocaleDateString()}</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            ERROR
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Class-based ErrorBoundary wrapper                                  */
/* ------------------------------------------------------------------ */

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <TerminalFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
