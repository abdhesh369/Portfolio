import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, GitCommit, GitBranch, ExternalLink, RefreshCw } from "lucide-react";
import { apiFetch } from "../lib/api-helpers";
import { formatDistanceToNow } from "date-fns";

interface GithubEvent {
    id: string;
    type: string;
    repo: string;
    createdAt: string;
    payload: {
        action?: string;
        commits?: number;
    };
}

export const GithubFeed = () => {
    const [events, setEvents] = useState<GithubEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchActivity = async () => {
        setLoading(true);
        setError(false);
        try {
            const data = await apiFetch("/api/v1/github/activity");
            setEvents(data);
        } catch (err) {
            console.error("Failed to fetch GitHub activity:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivity();
    }, []);

    const getEventIcon = (type: string) => {
        switch (type) {
            case "PushEvent": return <GitCommit className="w-4 h-4 text-primary" />;
            case "CreateEvent": return <GitBranch className="w-4 h-4 text-green-400" />;
            default: return <Github className="w-4 h-4 text-muted-foreground" />;
        }
    };

    const getEventText = (event: GithubEvent) => {
        const repoName = event.repo.split("/").pop();
        switch (event.type) {
            case "PushEvent":
                return (
                    <span>
                        Pushed <span className="text-primary font-medium">{event.payload.commits}</span> commits to{" "}
                        <span className="text-foreground font-semibold">{repoName}</span>
                    </span>
                );
            case "CreateEvent":
                return (
                    <span>
                        Created repository <span className="text-green-400 font-semibold">{repoName}</span>
                    </span>
                );
            case "PullRequestEvent":
                return (
                    <span>
                        Opened a PR in <span className="text-blue-400 font-semibold">{repoName}</span>
                    </span>
                );
            default:
                return <span>Activity in {repoName}</span>;
        }
    };

    return (
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Github className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                        Live Activity
                    </h3>
                </div>
                <button
                    onClick={fetchActivity}
                    className="p-2 hover:bg-secondary rounded-full transition-colors group"
                    disabled={loading}
                >
                    <RefreshCw className={`w-4 h-4 text-muted-foreground group-hover:text-primary ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="space-y-4">
                {loading && !events.length ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary/50" />
                            <div className="flex-1 space-y-2 py-1">
                                <div className="h-4 bg-secondary/50 rounded w-3/4" />
                                <div className="h-3 bg-secondary/50 rounded w-1/2" />
                            </div>
                        </div>
                    ))
                ) : error ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                        Failed to sync with GitHub.
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {events.map((event, index) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/30 transition-all border border-transparent hover:border-border/20 group"
                            >
                                <div className="mt-1 p-1.5 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                    {getEventIcon(event.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-foreground/80 leading-relaxed uppercase tracking-tight">
                                        {getEventText(event)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1.5 font-mono">
                                        {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                        <a
                                            href={`https://github.com/${event.repo}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-primary flex items-center gap-0.5"
                                        >
                                            View <ExternalLink className="w-2 h-2" />
                                        </a>
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};
