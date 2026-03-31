import { useState, useEffect } from "react";
import { useTheme } from "./theme-provider";
import { useKeyboardShortcuts } from "../hooks/use-keyboard-shortcuts";
import { motion, AnimatePresence } from "framer-motion";

export function DebugOverlay() {
  const { debugMode, safeMode, setSafeMode, treePerformanceMode, setTreePerformanceMode } = useTheme();
  useKeyboardShortcuts();
  
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    if (!debugMode) return;
    
    // Simple ping to check latency
    let active = true;
    const ping = async () => {
      const start = Date.now();
      try {
        await fetch("/api/v1/health", { method: "HEAD", cache: "no-store" });
        if (active) setLatency(Date.now() - start);
      } catch (e) {
        if (active) setLatency(-1);
      }
    };
    
    ping();
    const interval = setInterval(ping, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [debugMode]);

  return (
    <AnimatePresence>
      {debugMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-4 z-[9999] bg-black/80 backdrop-blur-md border border-primary/50 text-white font-mono text-xs p-4 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] pointer-events-auto"
          style={{ width: "300px" }}
        >
          <div className="flex justify-between items-center border-b border-white/20 pb-2 mb-2">
            <span className="font-bold text-primary">DEBUG MODE ACTIVE</span>
            <span className="text-[10px] bg-white/10 px-1 rounded border border-white/20">v2.0.0</span>
          </div>
          
          <div className="space-y-2">
             <div className="flex justify-between">
              <span className="text-white/60">API Latency:</span>
              <span className={latency === null ? "text-yellow-400" : latency > 1000 ? "text-red-400" : "text-green-400"}>
                {latency === null ? "Pinging..." : latency === -1 ? "Offline" : `${latency}ms`}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
               <span className="text-white/60">Safe Mode (No Motion):</span>
               <button
                  onClick={() => setSafeMode(!safeMode)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${safeMode ? "bg-red-500 text-white" : "bg-white/10 text-white/60"}`}
               >
                 {safeMode ? "ON" : "OFF"}
               </button>
            </div>

            <div className="flex items-center justify-between py-1">
               <span className="text-white/60">Tree Perf Mode:</span>
               <button
                  onClick={() => setTreePerformanceMode(treePerformanceMode === "power" ? "normal" : "power")}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${treePerformanceMode === "power" ? "bg-primary text-black" : "bg-white/10 text-white/60"}`}
               >
                 {treePerformanceMode.toUpperCase()}
               </button>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-white/20 text-[10px] text-white/40 italic">
            Press 'sudo' to close
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
