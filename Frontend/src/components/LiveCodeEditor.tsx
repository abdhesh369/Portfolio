import { useState, useEffect } from "react";
import { m } from "framer-motion";
import { Code2, Hash, Terminal } from "lucide-react";

const SNIPPETS = [
  {
    language: "typescript",
    name: "HeroComponent.tsx",
    code: `export function Hero() {
  const [active, setActive] = useState(false);
  
  return (
    <div className="relative group">
      <MatrixRain opacity={0.1} />
      <h1 className="text-glow">
        Engineering the Future
      </h1>
      <Button onClick={() => setActive(true)}>
        Initialize Transmission
      </Button>
    </div>
  );
}`
  },
  {
    language: "sql",
    name: "GetAnalytics.sql",
    code: `SELECT 
  country,
  count(*) as visits,
  avg(latency) as ping
FROM analytics
WHERE type = 'page_view'
  AND created_at > now() - interval '30 days'
GROUP BY country
ORDER BY visits DESC
LIMIT 10;`
  },
  {
    language: "typescript",
    name: "ai-review.service.ts",
    code: `class AIReviewService {
  async triggerReview(projectId: number) {
    const project = await db.projects.get(projectId);
    const context = await fetchGithub(project.url);
    
    return gemini.generate({
      prompt: buildRoastPrompt(project, context),
      temp: 0.7
    });
  }
}`
  }
];

export function LiveCodeEditor() {
  const [snippetIndex, setSnippetIndex] = useState(0);
  const [displayedCode, setDisplayedCode] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  const currentSnippet = SNIPPETS[snippetIndex];

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (!isDeleting && displayedCode === currentSnippet.code) {
      // Pause at end
      timeout = setTimeout(() => setIsDeleting(true), 3000);
    } else if (isDeleting && displayedCode === "") {
      // Switch snippet
      setIsDeleting(false);
      setSnippetIndex((prev) => (prev + 1) % SNIPPETS.length);
    } else {
      // Type or delete
      const speed = isDeleting ? 20 : 40;
      timeout = setTimeout(() => {
        setDisplayedCode(prev => 
          isDeleting 
            ? currentSnippet.code.slice(0, prev.length - 1)
            : currentSnippet.code.slice(0, prev.length + 1)
        );
      }, speed);
    }
    
    return () => clearTimeout(timeout);
  }, [displayedCode, isDeleting, snippetIndex, currentSnippet.code]);

  return (
    <div className="w-full h-full bg-slate-950/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex flex-col font-mono text-xs sm:text-sm">
      {/* Tab bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-md border border-white/5">
             <Code2 className="w-3.5 h-3.5 text-cyan-400" />
             <span className="text-[10px] text-neutral-400 lowercase">{currentSnippet.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-neutral-500 uppercase tracking-widest">
           <Terminal className="w-3 h-3" />
           UTF-8
        </div>
      </div>

      {/* Editor Surface */}
      <div className="flex-1 p-6 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-white/[0.02] border-r border-white/5 flex flex-col items-center py-6 text-[10px] text-neutral-600 select-none">
          {Array.from({ length: 15 }).map((_, i) => (
             <div key={i} className="h-5 leading-5">{i + 1}</div>
          ))}
        </div>
        
        <pre className="pl-10 text-neutral-300 leading-5">
           <code className="whitespace-pre-wrap break-all">
             {displayedCode}
             <m.span 
               animate={{ opacity: [1, 0] }}
               transition={{ duration: 0.8, repeat: Infinity }}
               className="inline-block w-1.5 h-4 bg-cyan-500 ml-0.5 align-middle"
             />
           </code>
        </pre>

        {/* Dynamic Syntax Glow (Simulated) */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
           <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-500 rounded-full blur-[80px] animate-pulse" />
           <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-purple-500 rounded-full blur-[80px] animate-pulse delay-700" />
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-1.5 bg-[#020617] border-t border-white/5 flex justify-between items-center text-[9px] text-neutral-500 uppercase font-bold tracking-wider">
         <div className="flex gap-4">
           <span>Master</span>
           <span className="text-cyan-400">Typing...</span>
         </div>
         <div className="flex gap-3">
           <span className="flex items-center gap-1"><Hash className="w-2.5 h-2.5" /> Line 1, Col 1</span>
           <span>Sp: 2</span>
         </div>
      </div>
    </div>
  );
}
