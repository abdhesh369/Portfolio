import React, { useState } from "react";
import { m } from "framer-motion";
import { Code2, Copy, Check, ExternalLink, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface InteractivePlaygroundProps {
  projectId: number;
  projectTitle: string;
  githubUrl?: string;
  liveUrl?: string;
  techStack?: string[];
  description?: string;
}

export function InteractivePlayground({
  projectId,
  projectTitle,
  githubUrl,
  liveUrl,
  techStack = [],
  description = "",
}: InteractivePlaygroundProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopyCode = () => {
    if (!liveUrl) {
      toast({ title: "Error", description: "No live URL available", variant: "destructive" });
      return;
    }
    const embedCode = `<iframe src="${liveUrl}" width="100%" height="600" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast({ title: "Embed code copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const hasLiveDemo = !!liveUrl;

  if (!hasLiveDemo) {
    return (
      <div className="rounded-2xl p-8 bg-white/5 border border-white/10 text-center">
        <Code2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Interactive Playground</h3>
        <p className="text-gray-400 mb-4">
          A live demo is not available for this project. Check the source code on GitHub to explore the implementation.
        </p>
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <Code2 className="w-4 h-4" />
            View Source Code
          </a>
        )}
      </div>
    );
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-400" />
            Interactive Playground
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Try the live demo below or embed it in your own site
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCode}
            className="text-white/70 hover:text-white"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Embed
              </>
            )}
          </Button>
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open Full Screen
          </a>
        </div>
      </div>

      {/* Playground Container */}
      <div
        className={`relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 transition-all duration-300 ${
          isExpanded ? "fixed inset-4 z-50" : ""
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <span className="text-xs text-white/50 font-mono ml-2">{projectTitle}</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
            title={isExpanded ? "Exit fullscreen" : "Enter fullscreen"}
          >
            <Maximize2 className="w-4 h-4 text-white/50 hover:text-white" />
          </button>
        </div>

        {/* Iframe Container */}
        <div className={isExpanded ? "h-[calc(100vh-60px)]" : "h-[600px]"}>
          <iframe
            src={liveUrl}
            title={`${projectTitle} - Interactive Playground`}
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      {/* Tech Stack Info */}
      {techStack.length > 0 && (
        <div className="rounded-lg bg-white/5 border border-white/10 p-4">
          <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
            Built with
          </p>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-md bg-white/10 border border-white/20 text-xs font-medium text-white/80"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Embed Code Info */}
      <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
        <p className="text-sm text-blue-300">
          💡 <strong>Tip:</strong> Click the "Embed" button to copy the embed code and use this playground on your own website.
        </p>
      </div>
    </m.div>
  );
}

export default InteractivePlayground;
