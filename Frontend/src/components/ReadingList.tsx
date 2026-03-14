import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api-helpers";
import { m } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Video, FileText, ExternalLink, Loader2 } from "lucide-react";

interface ReadingItem {
    id: number;
    title: string;
    url: string;
    note: string | null;
    type: 'article' | 'video' | 'book';
    createdAt: string;
}

const TYPE_ICONS = {
    article: <FileText className="w-4 h-4" />,
    video: <Video className="w-4 h-4" />,
    book: <BookOpen className="w-4 h-4" />,
};

export function ReadingList() {
    const { data: items, isLoading } = useQuery<ReadingItem[]>({
        queryKey: ["reading-list"],
        queryFn: async () => {
            const res = await fetch(`${API_BASE_URL}/api/v1/reading-list`);
            if (!res.ok) throw new Error("Failed to fetch reading list");
            return res.json();
        },
    });

    if (isLoading) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!items || items.length === 0) return null;

    return (
        <section className="py-12">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">What I'm Reading</h2>
                    <p className="text-sm text-muted-foreground">My latest learning resources and bookmarks.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                    <m.a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="group block"
                    >
                        <Card className="h-full bg-white/5 border-white/10 hover:border-primary/50 transition-all duration-300">
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 h-5 px-1.5 flex gap-1 items-center uppercase text-[10px] font-black tracking-widest">
                                                {TYPE_ICONS[item.type]}
                                                {item.type}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                                {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                                            {item.title}
                                        </h3>
                                        {item.note && (
                                            <p className="text-sm text-muted-foreground line-clamp-2 italic">
                                                "{item.note}"
                                            </p>
                                        )}
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </div>
                            </CardContent>
                        </Card>
                    </m.a>
                ))}
            </div>
        </section>
    );
}
