import React from "react";
import { m } from "framer-motion";
import { useCodingActivity } from "#src/hooks/use-portfolio";
import { Code, GitCommit, Clock, BarChart } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "#src/components/ui/card";

interface CodingActivityData {
  last7Days: {
    totalHours: number;
    languages: { name: string; percent: number; color: string }[];
    daily: { day: string; hours: number }[];
  };
  allTime: {
    commits: number;
    projectsCount: number;
    yearsCoding: number;
  };
}

export default function CodingActivity() {
  const { data, isLoading } = useCodingActivity();
  const activity = data as CodingActivityData;

  if (isLoading || !activity || !activity.last7Days || !activity.allTime) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted rounded-xl" />
        ))}
      </div>
    );
  }

  const { last7Days, allTime } = activity;

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold tracking-tight">Coding Activity</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Languages Breakdown */}
        <Card className="md:col-span-2 overflow-hidden border-border/40 bg-background/50 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
              <Code className="w-4 h-4" />
              Technology Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {last7Days?.languages?.map((lang: { name: string; percent: number }, index: number) => (
                <div key={lang.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{lang.name}</span>
                    <span className="text-muted-foreground">{lang.percent}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                    <m.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${lang.percent}%` }}
                      transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                      className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                    />
                  </div>
                </div>
              ))}
              {(!last7Days?.languages || last7Days.languages.length === 0) && (
                <p className="text-sm text-muted-foreground italic text-center py-4">No recent language activity detected.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vital Stats */}
        <div className="grid grid-cols-1 gap-4">
          <StatCard
            title="Total Commits"
            value={allTime.commits.toLocaleString()}
            icon={<GitCommit className="w-5 h-5 text-orange-500" />}
          />
          <StatCard
            title="Coding Hours (7d)"
            value={last7Days.totalHours.toLocaleString()}
            icon={<Clock className="w-5 h-5 text-blue-500" />}
          />
          <StatCard
            title="Active Projects"
            value={allTime.projectsCount}
            icon={<BarChart className="w-5 h-5 text-emerald-500" />}
          />
        </div>
      </div>
    </section>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card className="border-border/40 bg-background/50 backdrop-blur-md hover:bg-muted/10 transition-colors">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            {icon}
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold tracking-tight">
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
