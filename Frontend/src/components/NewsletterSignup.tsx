import { useState } from "react";
import { m } from "framer-motion";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import { useSubscribe } from "@/hooks/use-portfolio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewsletterSignupProps {
  source?: string;
  title?: string;
  description?: string;
}

export function NewsletterSignup({ 
  source = "general", 
  title = "Stay in the loop", 
  description = "Get the latest articles and project updates delivered straight to your inbox."
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const { mutate: subscribe, isPending, isSuccess } = useSubscribe();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribe({ email, source });
  };

  if (isSuccess) {
    return (
      <m.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl p-8 text-center bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">You're on the list!</h3>
            <p className="text-white/60">Thanks for subscribing. I'll be in touch soon.</p>
          </div>
        </div>
      </m.div>
    );
  }

  return (
    <m.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl"
    >
      {/* Decorative blobs */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
            <Mail className="w-3 h-3" />
            <span>Newsletter</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {title}
          </h3>
          <p className="text-white/60 max-w-md">
            {description}
          </p>
        </div>

        <div className="w-full md:w-auto min-w-[300px]">
          <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary/50 rounded-xl w-full"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isPending}
              className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <span>Join now</span>
                  <Send className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>
          <p className="mt-4 text-[10px] text-white/30 text-center md:text-left">
            No spam, ever. Unsubscribe with a single click.
          </p>
        </div>
      </div>
    </m.div>
  );
}
