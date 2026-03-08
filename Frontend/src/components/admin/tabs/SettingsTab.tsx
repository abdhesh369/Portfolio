import React from "react";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/portfolio";
import { LoadingSkeleton } from "@/components/admin/AdminShared";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Briefcase,
    Sparkles,
    RefreshCcw,
    CheckCircle2,
    AlertCircle,
    Rocket,
    GripVertical,
    Layers,
    Monitor,
    Shield,
    Terminal
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api-helpers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DEFAULT_SECTION_ORDER } from "@portfolio/shared";

const SECTION_LABELS: Record<string, string> = {
    hero: "Home (Hero)",
    about: "About Me",
    skills: "Skill",
    whyhireme: "Why Hire Me as a Student Engineer",
    services: "Services & Collaboration",
    mindset: "Engineering Mindset",
    projects: "Project",
    practice: "Code and Practice",
    experience: "My Journey (Experience)",
    guestbook: "Guestbook",
    contact: "Initialize Connection (Contact)",
    testimonials: "Testimonials"
};

function SortableSection({ id, label }: { id: string; label: string }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center gap-3 p-4 rounded-2xl transition-all duration-300",
                isDragging
                    ? "nm-convex bg-background/50 scale-[1.02] shadow-2xl border-primary/20"
                    : "nm-flat hover:nm-convex border-transparent"
            )}
        >
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-2 nm-inset rounded-xl hover:text-primary transition-colors"
                title="Drag to reorder"
            >
                <GripVertical className="w-4 h-4 opacity-40" />
            </button>
            <span className="text-sm font-semibold tracking-tight">{label}</span>
        </div>
    );
}

export function SettingsTab() {
    const { toast } = useToast();
    const { data: settings, isLoading, isError } = useSiteSettings();
    const updateMutation = useUpdateSiteSettings();

    const [isOptimizing, setIsOptimizing] = React.useState(false);
    const [isDeploying, setIsDeploying] = React.useState(false);
    const [stats, setStats] = React.useState<{
        totalScanned: number;
        migratedToCloudinary: number;
        optimizedUrls: number;
        failed: number;
    } | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    if (isLoading) return <LoadingSkeleton />;
    if (isError) return (
        <div className="nm-flat rounded-[2.5rem] p-12 text-center border-destructive/10">
            <AlertCircle className="w-16 h-16 text-destructive/40 mx-auto mb-6" />
            <h3 className="text-xl font-bold tracking-tight">System Connection Failed</h3>
            <p className="text-muted-foreground text-sm mt-3 max-w-xs mx-auto">Unable to retrieve configuration telemetry from the server core.</p>
        </div>
    );

    const savedOrder = (settings?.sectionOrder as string[]) ?? DEFAULT_SECTION_ORDER;
    const currentOrder = [
        ...savedOrder,
        ...DEFAULT_SECTION_ORDER.filter(id => !savedOrder.includes(id))
    ];

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = currentOrder.indexOf(active.id as string);
            const newIndex = currentOrder.indexOf(over.id as string);

            const newOrder = arrayMove([...currentOrder], oldIndex, newIndex);

            updateMutation.mutate(
                { sectionOrder: newOrder },
                {
                    onSuccess: () => {
                        toast({
                            title: "Sequence Updated",
                            description: "Homepage node sequence has been realigned successfully.",
                        });
                    },
                    onError: (error: Error) => {
                        toast({
                            title: "Update Failed",
                            description: error.message || "Failed to commit sequence change to the core database.",
                            variant: "destructive",
                        });
                    },
                }
            );
        }
    };

    const handleToggleOpenToWork = (checked: boolean) => {
        updateMutation.mutate(
            { isOpenToWork: checked },
            {
                onError: (error: Error) => {
                    toast({ title: "Signal Error", description: error.message || "Failed to update availability status", variant: "destructive" });
                },
            }
        );
    };

    const handleOptimizeImages = async () => {
        setIsOptimizing(true);
        setStats(null);
        try {
            const result = await apiFetch("/api/v1/admin/optimize-images", {
                method: "POST"
            });
            setStats(result.data);
            toast({
                title: "Optimization Complete",
                description: `Neural process optimized ${result.data.optimizedUrls} image artifacts.`,
            });
        } catch (error: unknown) {
            toast({
                title: "Process Failed",
                description: error instanceof Error ? error.message : "Internal optimization sequence interrupted.",
                variant: "destructive",
            });
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleDeploy = async () => {
        setIsDeploying(true);
        try {
            await apiFetch("/api/v1/admin/deploy", {
                method: "POST"
            });
            toast({
                title: "Deployment Initiated",
                description: "Production uplink synchronized. Build sequence started on remote cluster.",
            });
        } catch (error: unknown) {
            toast({
                title: "Uplink Failed",
                description: error instanceof Error ? error.message : "Failed to establish production deployment bridge.",
                variant: "destructive",
            });
        } finally {
            setIsDeploying(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12 pb-24">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="p-3 nm-flat rounded-2xl text-primary">
                        <Monitor className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter" style={{ fontFamily: "var(--font-display)" }}>
                            Control Center
                        </h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">Uplink & Global Parameters</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
                {/* Left Column */}
                <div className="space-y-10">
                    {/* Availability Section */}
                    <div className="nm-flat rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity animation-delay-500">
                            <Shield className="w-24 h-24 rotate-12" />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="p-3 nm-inset rounded-2xl text-blue-500">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold tracking-tight">Public Status</h3>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-50">Market Readiness Signal</p>
                            </div>
                        </div>

                        <div className="nm-inset rounded-3xl p-6 flex items-center justify-between group/status hover:nm-flat transition-all duration-500 hover:shadow-xl">
                            <div className="space-y-1">
                                <Label htmlFor="open-to-work" className="text-base font-bold tracking-tight cursor-pointer">Open to Collaboration</Label>
                                <p className="text-xs text-muted-foreground">Broadcast availability for new engineering ventures.</p>
                            </div>
                            <Switch
                                id="open-to-work"
                                checked={settings?.isOpenToWork ?? false}
                                onCheckedChange={handleToggleOpenToWork}
                                disabled={updateMutation.isPending}
                                className="nm-flat data-[state=checked]:bg-blue-500 h-7 w-12"
                            />
                        </div>
                    </div>

                    {/* Maintenance Section */}
                    <div className="nm-flat rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity animation-delay-700">
                            <Terminal className="w-24 h-24 -rotate-12" />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="p-3 nm-inset rounded-2xl text-purple-500">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold tracking-tight">Maintenance Protocol</h3>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-50">Performance Optimization</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Bulk Image Optimizer */}
                            <div className="nm-inset rounded-3xl p-6 space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                    <div className="space-y-2 max-w-xs">
                                        <h4 className="font-bold tracking-tight">Asset Compaction</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Synchronize external media with Cloudinary and inject neural optimization parameters for lightning speed.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleOptimizeImages}
                                        disabled={isOptimizing}
                                        className={cn(
                                            "nm-flat hover:nm-convex active:nm-inset h-14 px-8 rounded-2xl transition-all duration-300",
                                            "text-[10px] font-black uppercase tracking-[0.2em] group/btn",
                                            isOptimizing && "opacity-50"
                                        )}
                                    >
                                        {isOptimizing ? (
                                            <>
                                                <RefreshCcw className="w-4 h-4 mr-3 animate-spin text-primary" />
                                                Optimizing...
                                            </>
                                        ) : (
                                            "Execute Optimizer"
                                        )}
                                    </Button>
                                </div>

                                {stats && (
                                    <div className="grid grid-cols-2 gap-4 animate-in zoom-in-95 duration-500">
                                        <div className="p-4 nm-flat rounded-2xl border border-primary/5">
                                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-black mb-1">Scanned</p>
                                            <p className="text-2xl font-black">{stats.totalScanned}</p>
                                        </div>
                                        <div className="p-4 nm-flat rounded-2xl border border-emerald-500/10">
                                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-black mb-1">Optimized</p>
                                            <p className="text-2xl font-black text-emerald-500">{stats.optimizedUrls}</p>
                                        </div>
                                        <div className="col-span-full py-3 px-4 nm-flat rounded-xl flex items-center gap-3">
                                            <div className="p-1.5 nm-inset rounded-full text-emerald-500">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">Success Protocol Completed</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Deploy Hook */}
                            <div className="nm-inset rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div className="space-y-2 max-w-xs">
                                    <h4 className="font-bold tracking-tight text-blue-500/90">Production Uplink</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Transmit code manifests to the production cluster for a fresh deployment sequence.
                                    </p>
                                </div>
                                <Button
                                    onClick={handleDeploy}
                                    disabled={isDeploying}
                                    className={cn(
                                        "nm-flat hover:nm-convex active:nm-inset h-14 px-8 rounded-2xl transition-all duration-300",
                                        "text-[10px] font-black uppercase tracking-[0.2em] text-blue-500",
                                        isDeploying && "opacity-50"
                                    )}
                                >
                                    {isDeploying ? (
                                        <>
                                            <RefreshCcw className="w-4 h-4 mr-3 animate-spin" />
                                            Syncing...
                                        </>
                                    ) : (
                                        <>
                                            <Rocket className="w-4 h-4 mr-3" />
                                            Initialize Uplink
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Section Ordering Section */}
                <div className="nm-flat rounded-[2.5rem] p-8 space-y-8 h-fit">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 nm-inset rounded-2xl text-amber-500">
                                <Layers className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold tracking-tight">Mainframe Hierarchy</h3>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-50">Homepage Section Alignment</p>
                            </div>
                        </div>
                        {updateMutation.isPending && (
                            <div className="flex items-center gap-2 p-2 nm-inset rounded-xl text-[10px] font-black text-amber-500 uppercase tracking-widest animate-pulse">
                                <RefreshCcw className="w-3 h-3 animate-spin" />
                                <span>Syncing</span>
                            </div>
                        )}
                    </div>

                    <div className="nm-inset rounded-[2rem] p-4 min-h-[500px]">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={currentOrder}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="grid gap-3 p-1">
                                    {currentOrder.map((sectionId) => (
                                        <SortableSection
                                            key={sectionId}
                                            id={sectionId}
                                            label={SECTION_LABELS[sectionId] || sectionId}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>
            </div>

            {/* Kernel Bays */}
            <div className="nm-inset rounded-[3rem] p-16 flex flex-col items-center justify-center text-center group border-2 border-dashed border-primary/5">
                <div className="w-24 h-24 rounded-full nm-flat flex items-center justify-center mb-8 group-hover:nm-convex transition-all duration-700">
                    <Shield className="w-10 h-10 opacity-10 group-hover:opacity-30 group-hover:text-primary transition-all rotate-12" />
                </div>
                <h4 className="font-black uppercase tracking-[0.4em] text-sm opacity-20 group-hover:opacity-40 transition-opacity">Core Bays Restricted</h4>
                <p className="text-xs text-muted-foreground mt-4 max-w-sm opacity-30 group-hover:opacity-60 transition-opacity">Advanced kernel parameters and neural weights are currently managed by the master orchestration layer.</p>
            </div>
        </div>
    );
}
