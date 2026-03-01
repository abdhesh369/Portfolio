import { m } from "framer-motion";
import { Terminal, ArrowLeft, Home, Zap, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050510] p-4 relative overflow-hidden">
      {/* Ambient animated grid */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Floating orbs */}
      <m.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"
      />
      <m.div
        animate={{ y: [0, 15, 0], x: [0, -15, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
      />

      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* Glitch 404 number */}
        <m.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 12 }}
          className="relative mb-8"
        >
          <span className="text-[12rem] sm:text-[16rem] font-bold font-display leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-transparent select-none">
            404
          </span>
          {/* Glowing overlay */}
          <m.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center text-[12rem] sm:text-[16rem] font-bold font-display leading-none text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"
            style={{ backgroundSize: "200% 200%" }}
          >
            404
          </m.span>
        </m.div>

        {/* Terminal-style error message */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0a0520]/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden mb-8 shadow-2xl shadow-cyan-500/5 text-left"
        >
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-2 text-[10px] font-mono text-gray-500 flex items-center gap-1">
              <Terminal className="w-3 h-3" /> system_error.log
            </span>
          </div>

          <div className="p-6 font-mono text-sm space-y-3">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>ERROR 404: Target coordinates not found</span>
            </div>
            <div className="text-gray-500">
              <span className="text-cyan-500">$</span> locate --deep "/
              {typeof window !== "undefined" ? window.location.pathname.slice(1) : "unknown"}"
            </div>
            <div className="text-gray-400">
              <span className="text-yellow-500">⚠</span> The requested route has been relocated or never existed in this sector.
            </div>
            <m.div
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-cyan-400"
            >
              █
            </m.div>
          </div>
        </m.div>

        {/* Action buttons */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="/"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5 group"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Return to Base
          </a>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 text-gray-300 hover:text-white font-medium transition-all hover:-translate-y-0.5 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
        </m.div>

        {/* Fun easter egg */}
        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-gray-600 text-xs font-mono flex items-center justify-center gap-1"
        >
          <Zap className="w-3 h-3" /> Signal lost. Recalibrating...
        </m.p>
      </div>
    </div>
  );
}
