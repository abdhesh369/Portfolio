import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Send, Sparkles, CheckCircle2, AlertCircle, Clock, DollarSign, ListTodo, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useScopeStream } from "@/hooks/use-scope-stream";
import { apiFetch } from "@/lib/api-helpers";
import { cn } from "@/lib/utils";

const PROJECT_TYPES = [
    "Web Application",
    "Mobile App (iOS/Android)",
    "AI / Machine Learning",
    "E-commerce Platform",
    "SaaS Product",
    "API / Backend Service",
    "Portfolio / Landing Page",
    "Other"
];

const COMMON_FEATURES = [
    "User Authentication",
    "Payment Integration (Stripe/PayPal)",
    "Real-time Chat / Notifications",
    "Admin Dashboard",
    "AI Integration (LLMs/Gemini)",
    "File Uploads / Cloud Storage",
    "SEO Optimization",
    "Multi-language Support",
    "Social Media Integration",
    "Analytics & Reporting"
];

interface FormData {
    projectName: string;
    projectType: string;
    description: string;
    features: string[];
    userName: string;
    userEmail: string;
}

const STEP_COUNT = 5;

export function ScopeWizard() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        projectName: "",
        projectType: "",
        description: "",
        features: [],
        userName: "",
        userEmail: "",
    });
    const [requestId, setRequestId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    const { status, progress, message, estimation, error: streamError } = useScopeStream(requestId);

    const nextStep = () => setStep((s) => Math.min(s + 1, STEP_COUNT));
    const prevStep = () => setStep((s) => Math.max(s - 1, 1));

    const toggleFeature = (feature: string) => {
        setFormData((prev) => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter((f) => f !== feature)
                : [...prev.features, feature],
        }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmissionError(null);
        try {
            const res = await apiFetch("/api/v1/scope/request", {
                method: "POST",
                body: JSON.stringify({
                    name: formData.userName,
                    email: formData.userEmail,
                    description: `${formData.projectName}: ${formData.description}`,
                    projectType: formData.projectType,
                    features: formData.features,
                }),
            });
            setRequestId(res.id.toString());
            nextStep();
        } catch (err) {
            setSubmissionError(err instanceof Error ? err.message : "Failed to submit request");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <m.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <span className="text-cyan-400 font-mono">01.</span> Project Identity
                            </h3>
                            <p className="text-gray-400 text-sm">What should we call this mission?</p>
                        </div>
                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Project Name"
                                    value={formData.projectName}
                                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {PROJECT_TYPES.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setFormData({ ...formData, projectType: type })}
                                        className={cn(
                                            "px-3 py-2 text-xs font-mono rounded border transition-all text-left",
                                            formData.projectType === type
                                                ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                                                : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30"
                                        )}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </m.div>
                );
            case 2:
                return (
                    <m.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <span className="text-cyan-400 font-mono">02.</span> Mission Objectives
                            </h3>
                            <p className="text-gray-400 text-sm">Describe the core problem you're solving.</p>
                        </div>
                        <textarea
                            placeholder="Detailed requirements, user stories, or technical constraints..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono min-h-[200px] resize-none"
                        />
                    </m.div>
                );
            case 3:
                return (
                    <m.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <span className="text-cyan-400 font-mono">03.</span> Subsystems & Features
                            </h3>
                            <p className="text-gray-400 text-sm">Select the core modules required for the build.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {COMMON_FEATURES.map((feature) => (
                                <button
                                    key={feature}
                                    onClick={() => toggleFeature(feature)}
                                    className={cn(
                                        "flex items-center justify-between px-4 py-3 text-sm font-mono rounded border transition-all",
                                        formData.features.includes(feature)
                                            ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                                            : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30"
                                    )}
                                >
                                    {feature}
                                    {formData.features.includes(feature) && <CheckCircle2 className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </m.div>
                );
            case 4:
                return (
                    <m.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <span className="text-cyan-400 font-mono">04.</span> Comm Uplink
                            </h3>
                            <p className="text-gray-400 text-sm">Where should I send the final detailed analysis?</p>
                        </div>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={formData.userName}
                                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
                            />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={formData.userEmail}
                                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
                            />
                            {submissionError && (
                                <div className="p-3 rounded bg-red-500/10 border border-red-500/50 text-red-400 text-xs font-mono flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {submissionError}
                                </div>
                            )}
                        </div>
                        <div className="p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                            <p className="text-[10px] text-cyan-400 uppercase tracking-widest mb-2 font-mono flex items-center gap-2">
                                <BrainCircuit className="w-3 h-3" /> System Warning
                            </p>
                            <p className="text-xs text-gray-400 leading-relaxed font-mono">
                                Submitting will initialize a Gemini-powered neural analysis of your requirements.
                                This takes approximately 10-15 seconds.
                            </p>
                        </div>
                    </m.div>
                );
            case 5:
                return (
                    <m.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                        <div className="text-center space-y-4">
                            {status !== "completed" && status !== "failed" ? (
                                <>
                                    <div className="relative w-24 h-24 mx-auto">
                                        <m.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-0 border-t-2 border-cyan-500 rounded-full"
                                        />
                                        <div className="absolute inset-2 border-r-2 border-purple-500 rounded-full animate-spin [animation-duration:3s]" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-white font-mono animate-pulse">
                                        ANALYZING_PROJECT_DNA
                                    </h3>
                                    <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                                        <m.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                                        />
                                    </div>
                                    <p className="text-cyan-400 font-mono text-[10px] uppercase tracking-tighter h-4">
                                        {message || "Establishing neural context..."}
                                    </p>
                                </>
                            ) : null}

                            {status === "failed" || streamError ? (
                                <div className="space-y-4 py-8">
                                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                                    <h3 className="text-xl font-bold text-white">Analysis Terminated</h3>
                                    <p className="text-gray-400 text-sm max-w-xs mx-auto">
                                        {streamError || "A critical error occurred during the scoping process. Please check your data and retry."}
                                    </p>
                                    <Button onClick={() => setStep(4)} variant="outline" className="border-red-500/30 text-red-400">
                                        Re-authenticate Data
                                    </Button>
                                </div>
                            ) : null}

                            {status === "completed" && estimation ? (
                                <m.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-left space-y-6"
                                >
                                    <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                                        <div>
                                            <h4 className="text-white font-bold">Scope Analysis Complete</h4>
                                            <p className="text-xs text-gray-400">Project parameters successfully modeled.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1">
                                            <p className="text-[10px] text-gray-500 uppercase font-mono flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> Time Estimate
                                            </p>
                                            <p className="text-lg font-bold text-cyan-400">
                                                {estimation.hours.min}-{estimation.hours.max} hrs
                                            </p>
                                        </div>
                                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1">
                                            <p className="text-[10px] text-gray-500 uppercase font-mono flex items-center gap-1">
                                                <DollarSign className="w-3 h-3" /> Budget Range
                                            </p>
                                            <p className="text-lg font-bold text-purple-400">
                                                ${estimation.cost.min.toLocaleString()}-${estimation.cost.max.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="text-[10px] text-gray-500 uppercase font-mono flex items-center gap-1">
                                            <ListTodo className="w-3 h-3" /> Deployment Milestones
                                        </p>
                                        <div className="space-y-2">
                                            {estimation.milestones.map((m, i) => (
                                                <div key={i} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg group hover:border-cyan-500/30 transition-all">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h5 className="text-xs font-bold text-gray-200">{m.title}</h5>
                                                        <Badge variant="outline" className="text-[9px] border-cyan-500/30 text-cyan-400">
                                                            {m.duration}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-[10px] text-gray-500 line-clamp-2">{m.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                        <p className="text-xs text-gray-300 italic">
                                            "Our AI has analyzed your requirements and determined this as the most efficient path forward. You'll receive a detailed PDF via email shortly."
                                        </p>
                                    </div>

                                    <Button
                                        onClick={() => window.location.reload()}
                                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-mono uppercase text-xs"
                                    >
                                        Close Terminal
                                    </Button>
                                </m.div>
                            ) : null}
                        </div>
                    </m.div>
                );
        }
    };

    const isNextDisabled = () => {
        if (step === 1) return !formData.projectName || !formData.projectType;
        if (step === 2) return formData.description.length < 10;
        if (step === 4) return !formData.userName || !formData.userEmail;
        return false;
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Terminal Header */}
                <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex items-center justify-between">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                    </div>
                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                        System://Scope_Analyzer_v1.0
                    </div>
                    <div className="w-10 text-[10px] font-mono text-cyan-500/50 text-right">
                        {Math.floor((step / STEP_COUNT) * 100)}%
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-0.5 bg-white/5">
                    <m.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / STEP_COUNT) * 100}%` }}
                        className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    />
                </div>

                <div className="p-6 md:p-10 relative min-h-[450px] flex flex-col">
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            {renderStep()}
                        </AnimatePresence>
                    </div>

                    {step < 5 && (
                        <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                            <button
                                onClick={prevStep}
                                disabled={step === 1}
                                className={cn(
                                    "flex items-center gap-2 text-xs font-mono transition-all",
                                    step === 1 ? "opacity-0 pointer-events-none" : "text-gray-500 hover:text-white"
                                )}
                            >
                                <ChevronLeft className="w-4 h-4" /> PREV_STEP
                            </button>

                            {step === 4 ? (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isNextDisabled() || isSubmitting}
                                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono px-8 h-10 group"
                                >
                                    {isSubmitting ? "DATA_UPLOADING..." : <>EXECUTE_ANALYSIS <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>}
                                </Button>
                            ) : (
                                <Button
                                    onClick={nextStep}
                                    disabled={isNextDisabled()}
                                    className="bg-white/10 hover:bg-white/20 text-white border border-white/5 font-mono px-8 h-10 group"
                                >
                                    NEXT_STEP <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
