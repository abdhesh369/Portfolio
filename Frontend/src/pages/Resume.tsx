import { useRef } from "react";
import { m } from "framer-motion";
import { Download, Mail, Globe, Github, Linkedin, MapPin, ExternalLink, Printer } from "lucide-react";
import { useProjects, useSkills, useExperiences } from "@/hooks/use-portfolio";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function Resume() {
    const { data: settings } = useSiteSettings();
    const { data: experiences = [] } = useExperiences();
    const { data: skills = [] } = useSkills();
    const { data: projects = [] } = useProjects();
    const resumeRef = useRef<HTMLDivElement>(null);

    const githubDisplay = settings?.socialGithub
        ? settings.socialGithub.replace(/^https?:\/\//, "").replace(/\/$/, "")
        : "github.com";

    const linkedinDisplay = settings?.socialLinkedin
        ? settings.socialLinkedin.replace(/^https?:\/\//, "").replace(/\/$/, "")
        : "linkedin.com";

    const handlePrint = () => {
        window.print();
    };

    if (!settings) return null;

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
            {/* Toolbar - Hidden when printing */}
            <div className="max-w-4xl mx-auto mb-8 flex flex-wrap items-center justify-between gap-4 print:hidden">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 italic font-display">Resume Preview</h1>
                    <p className="text-sm text-neutral-500">Recruiter-ready printable version</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => window.location.href = "/"}
                    >
                        Go Home
                    </Button>
                    <Button
                        onClick={handlePrint}
                        className="bg-primary text-primary-foreground font-bold shadow-lg"
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Print / Save as PDF
                    </Button>
                </div>
            </div>

            {/* Resume Content */}
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                ref={resumeRef}
                className="max-w-[210mm] mx-auto bg-white text-black p-[20mm] shadow-2xl relative overflow-hidden print:shadow-none print:p-0 print:m-0"
            >
                {/* Header */}
                <header className="border-b-2 border-neutral-100 pb-8 mb-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black tracking-tight uppercase">{settings.personalName}</h1>
                            <h2 className="text-xl font-bold text-primary opacity-80 uppercase tracking-widest">{settings.personalTitle}</h2>
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-1.5 text-sm font-medium text-neutral-600">
                            <div className="flex items-center gap-2">
                                <span>{settings.socialEmail}</span>
                                <Mail className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex items-center gap-2">
                                <span>{settings.locationText}</span>
                                <MapPin className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex items-center gap-2">
                                <span>portfolio.dev</span>
                                <Globe className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Left Column - Main Content */}
                    <div className="md:col-span-2 space-y-10">
                        {/* Summary */}
                        <section>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-4">Professional Profile</h3>
                            <p className="text-neutral-700 leading-relaxed text-sm">
                                {settings.personalBio} {settings.aboutDescription}
                            </p>
                        </section>

                        {/* Experience */}
                        <section>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-6 border-b border-neutral-100 pb-2">Experience</h3>
                            <div className="space-y-8">
                                {experiences.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map((exp) => (
                                    <div key={exp.id} className="relative pl-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-base">{exp.role}</h4>
                                            <span className="text-[10px] font-bold text-neutral-400 tabular-nums uppercase">
                                                {format(new Date(exp.startDate), "MMM yyyy")} — {exp.endDate ? format(new Date(exp.endDate), "MMM yyyy") : "Present"}
                                            </span>
                                        </div>
                                        <div className="text-primary text-xs font-bold mb-3 tracking-wide">{exp.organization}</div>
                                        <p className="text-neutral-600 text-[13px] leading-relaxed whitespace-pre-line">
                                            {exp.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Key Projects */}
                        <section>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-6 border-b border-neutral-100 pb-2">Featured Work</h3>
                            <div className="grid grid-cols-1 gap-6">
                                {projects.filter(p => !p.isHidden && p.isFlagship).slice(0, 3).map((p) => (
                                    <div key={p.id}>
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-bold text-sm underline underline-offset-4 decoration-primary/30">{p.title}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-neutral-400">{p.category}</span>
                                            </div>
                                        </div>
                                        <p className="text-neutral-600 text-[13px] line-clamp-2 italic">
                                            {p.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Skills & Links */}
                    <div className="space-y-10">
                        {/* Skills */}
                        <section>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-6 border-b border-neutral-100 pb-2">Technical Arsenal</h3>
                            <div className="space-y-6">
                                {Array.from(new Set(skills.map(s => s.category))).map(cat => (
                                    <div key={cat}>
                                        <h4 className="text-[10px] font-black uppercase text-primary mb-2 tracking-wider">{cat}</h4>
                                        <div className="flex flex-wrap gap-x-2 gap-y-1">
                                            {skills.filter(s => s.category === cat).map(s => (
                                                <span key={s.id} className="text-[13px] text-neutral-700 font-medium">
                                                    {s.name}{cat === "Languages" && " "}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Education/Other */}
                        <section>
                           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-4">Focus Areas</h3>
                           <div className="space-y-3">
                                {settings.aboutTechStack?.slice(0, 5).map(tech => (
                                    <div key={tech} className="flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-primary" />
                                        <span className="text-xs font-medium text-neutral-600">{tech}</span>
                                    </div>
                                ))}
                           </div>
                        </section>

                        {/* Links/QR */}
                        <section className="pt-8">
                             <div className="space-y-4 border-t border-neutral-100 pt-6">
                                <a href={settings.socialGithub || "#"} className="flex items-center gap-3 text-neutral-500 hover:text-black transition-colors">
                                    <Github className="w-4 h-4" />
                                    <span className="text-xs font-bold">{githubDisplay}</span>
                                </a>
                                <a href={settings.socialLinkedin || "#"} className="flex items-center gap-3 text-neutral-500 hover:text-black transition-colors">
                                    <Linkedin className="w-4 h-4" />
                                    <span className="text-xs font-bold">{linkedinDisplay}</span>
                                </a>
                             </div>
                        </section>
                    </div>
                </div>

                {/* Footer / Permanent Mark */}
                <footer className="mt-16 pt-8 border-t border-neutral-50 text-center">
                    <p className="text-[10px] text-neutral-300 font-mono tracking-widest uppercase">
                        Rendered dynamically via Portfolio v2.0 // {new Date().getFullYear()}
                    </p>
                </footer>
            </m.div>

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page {
                        margin: 0;
                        size: A4;
                    }
                    body {
                        background: white !important;
                        -webkit-print-color-adjust: exact;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            `}} />
        </div>
    );
}
