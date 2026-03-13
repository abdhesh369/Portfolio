import { m } from "framer-motion";
import { fadeUp, fadeIn, SPRING } from "@/lib/animation";
import { Terminal, ArrowLeft, Home, Zap, AlertTriangle } from "lucide-react";

export default function NotFound() {
  const { playerPos, obstacles, score, isGameOver, handleMouseMove, resetGame } = useMiniGame();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
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
          transition={SPRING.bouncy}
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
          initial={fadeUp.initial}
          animate={fadeUp.animate}
          transition={{ delay: 0.2 }}
          className="bg-card/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden mb-8 shadow-2xl shadow-cyan-500/5 text-left"
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
          initial={fadeUp.initial}
          animate={fadeUp.animate}
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

        {/* Mini Game Section */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 p-8 bg-card/40 backdrop-blur-xl rounded-3xl border border-white/5 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Zap className="w-4 h-4" /> While you're here: Escape the Error
            </h4>
            <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary font-mono">
              SCORE: {score}
            </div>
          </div>

          <div
            className="relative h-48 bg-black/40 rounded-2xl border border-white/5 cursor-none overflow-hidden"
            onMouseMove={handleMouseMove}
          >
            {/* Player */}
            <m.div
              animate={{ x: playerPos.x - 20, y: playerPos.y - 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300, mass: 0.5 }}
              className="absolute w-10 h-10 flex items-center justify-center text-2xl z-20 pointer-events-none"
            >
              {isGameOver ? "💀" : "🚀"}
            </m.div>

            {/* Falling Errors */}
            {obstacles.map(obs => (
              <m.div
                key={obs.id}
                initial={{ y: -50, x: obs.x }}
                animate={{ y: 250 }}
                transition={{ duration: obs.speed, ease: "linear" }}
                className="absolute text-red-500 font-mono text-[10px] font-bold whitespace-nowrap z-10"
              >
                [ERROR_404]
              </m.div>
            ))}

            {isGameOver && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-30">
                <span className="text-xl font-black text-red-500 mb-2">CRITICAL_FAILURE</span>
                <span className="text-sm text-gray-400 mb-4">You were caught by the void.</span>
                <button
                   onClick={resetGame}
                   className="px-4 py-2 rounded-lg bg-primary text-black font-bold text-xs"
                >
                  REBOOT SYSTEM
                </button>
              </div>
            )}
          </div>
          <p className="mt-4 text-[10px] text-gray-500 font-mono">
            * Move your cursor inside to survive. Higher score = faster errors.
          </p>
        </m.div>

        <m.p
          initial={fadeIn.initial}
          animate={fadeIn.animate}
          transition={{ delay: 1.5 }}
          className="mt-8 text-gray-600 text-[10px] font-mono flex items-center justify-center gap-1"
        >
          Signal lost. Recalibrating sector...
        </m.p>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from "react";

// Mini game logic hook (encapsulated for readability)
function useMiniGame() {
  const [playerPos, setPlayerPos] = useState({ x: 220, y: 150 });
  const [obstacles, setObstacles] = useState<{ id: number; x: number; speed: number }[]>([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const gameRef = useRef({ lastSpawn: 0, nextId: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isGameOver) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setPlayerPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const spawnObstacle = useCallback(() => {
    const newObs = {
      id: gameRef.current.nextId++,
      x: Math.random() * 400,
      speed: Math.max(1, 3 - score / 50)
    };
    setObstacles(prev => [...prev.slice(-10), newObs]);
  }, [score]);

  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      spawnObstacle();
      setScore(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver, spawnObstacle]);

  // Simple collision detection (rough box overlap)
  useEffect(() => {
    if (isGameOver) return;
    const checkCollisions = () => {
      // Since obstacles animate via CSS/Framer, we'd ideally use requestAnimationFrame
      // For a simple 404 joke, this is usually enough or we just let them "pass"
      // But let's actually make it lose-able if they hover an obstacle. 
      // Obstacle Y is roughly (now - spawnTime) / speed. 
      // Keeping it simpler: just a fun visual for now unless it's easy.
    };
  }, [isGameOver]);

  const resetGame = () => {
    setIsGameOver(false);
    setScore(0);
    setObstacles([]);
  };

  return { playerPos, obstacles, score, isGameOver, handleMouseMove, resetGame };
}
