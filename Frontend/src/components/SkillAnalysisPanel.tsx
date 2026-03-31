import React from "react";
import { m } from "framer-motion";
import { Sparkles, TrendingUp, Target, BookOpen, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useSkills } from "#src/hooks/use-portfolio";

export function SkillAnalysisPanel() {
  const { data: skills = [] } = useSkills();
  
  // Calculate relative strength based on number of skills
  const arsenalDensity = Math.min(100, (skills.length / 25) * 100);

  // Mock analysis data
  const analysis = {
    marketMatch: 88,
    arsenalStrength: arsenalDensity,
    topGap: "Cloud Native Architecture",
    recommendations: [
      { name: "Kubernetes/Docker", reason: "High demand for DevOps in your target roles", type: "Tech" },
      { name: "System Design", reason: "Critical for Senior level progression", type: "Architecture" },
      { name: "Public Speaking", reason: "Boosts leadership and visibility", type: "Soft Skill" }
    ],
    growthTrend: [65, 72, 78, 85, 88] // Matching % over last 5 months
  };

  return (
    <Card className="border-primary/20 bg-background/50 backdrop-blur-xl overflow-hidden group">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
          <Sparkles className="w-4 h-4 animate-pulse" />
          AI_CAREER_INSIGHTS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Match Score */}
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Market_Alignment</p>
            <div className="text-3xl font-black flex items-baseline gap-2">
              {analysis.marketMatch}%
              <span className="text-xs text-emerald-500 flex items-center font-bold">
                <TrendingUp className="w-3 h-3 mr-1" /> +3%
              </span>
            </div>
          </div>
          <div className="h-12 w-24 flex items-end gap-1 pb-1">
            {analysis.growthTrend.map((v, i) => (
              <m.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${(v / 100) * 100}%` }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex-1 bg-primary/20 rounded-t-sm group-hover:bg-primary/40 transition-colors"
              />
            ))}
          </div>
        </div>

        {/* Growth Target */}
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase">
            <Target className="w-3 h-3" />
            Priority_Growth_Area
          </div>
          <p className="text-xs font-semibold">{analysis.topGap}</p>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-wider flex items-center gap-2">
            <BookOpen className="w-3 h-3" /> Recommended_Path
          </h4>
          <div className="space-y-2">
            {analysis.recommendations.map((rec, i) => (
              <m.div 
                key={rec.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group/item"
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-bold">{rec.name}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{rec.reason}</p>
                </div>
                <ChevronRight className="w-3 h-3 text-muted-foreground group-hover/item:text-primary transition-colors" />
              </m.div>
            ))}
          </div>
        </div>

        <button className="w-full py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all">
          Explore_Full_Roadmap
        </button>
      </CardContent>
    </Card>
  );
}
