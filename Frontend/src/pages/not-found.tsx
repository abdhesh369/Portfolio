import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050510] p-4">
      <Card className="w-full max-w-md bg-[#0a0520] border-white/10 shadow-2xl">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse" />
              <AlertCircle className="h-20 w-20 text-red-500 relative z-10" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white font-display">System Error: 404</h1>
            <p className="text-cyan-400 font-mono text-sm">Target Coordinates Not Found</p>
          </div>

          <p className="text-gray-400 text-sm">
            The requested tactical data stream does not exist or has been relocated to a secure sector.
          </p>

          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono uppercase tracking-widest transition-all w-full group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">{'<'}</span> Return to Base
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
