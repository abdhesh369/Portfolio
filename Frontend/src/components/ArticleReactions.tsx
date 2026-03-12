import { m, AnimatePresence } from "framer-motion";
import { useReactToArticle } from "@/hooks/use-portfolio";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ArticleReactionsProps {
  articleId: number;
  reactions: Record<string, number>;
}

const EMOJIS = ["🚀", "🔥", "💡", "❤️", "👏"];

export function ArticleReactions({ articleId, reactions }: ArticleReactionsProps) {
  const { mutate: react, isPending } = useReactToArticle();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <TooltipProvider>
        {EMOJIS.map((emoji) => {
          const count = reactions[emoji] || 0;
          return (
            <Tooltip key={emoji}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => react({ id: articleId, emoji })}
                  disabled={isPending}
                  className={cn(
                    "group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all border shrink-0",
                    "bg-white/5 border-white/10 hover:border-primary/50 hover:bg-primary/5",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <span className="text-lg group-hover:scale-125 transition-transform duration-200">
                    {emoji}
                  </span>
                  <AnimatePresence mode="popLayout">
                    {count > 0 && (
                      <m.span
                        key={count}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-xs font-medium text-white/50"
                      >
                        {count}
                      </m.span>
                    )}
                  </AnimatePresence>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">React with {emoji}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
}
