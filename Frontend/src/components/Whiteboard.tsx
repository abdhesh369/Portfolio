import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pen, Eraser, Square, Circle as CircleIcon, Minus, Palette, RotateCcw, Download, Save, MousePointer2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Point { x: number; y: number }
interface DrawElement {
    type: 'line' | 'rect' | 'circle';
    points: Point[];
    color: string;
    width: number;
}

const COLORS = ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#ffffff', '#000000'];
const TOOLS = [
    { id: 'pen', icon: <Pen size={16} />, label: 'Pen' },
    { id: 'eraser', icon: <Eraser size={16} />, label: 'Eraser' },
    { id: 'rect', icon: <Square size={16} />, label: 'Rectangle' },
    { id: 'circle', icon: <CircleIcon size={16} />, label: 'Circle' },
    { id: 'line', icon: <Minus size={16} />, label: 'Line' },
];

interface IdeaCanvasProps {
    sessionId?: number;
    onSave?: (canvasData: Record<string, unknown>) => void;
}

export const IdeaCanvas: React.FC<IdeaCanvasProps> = ({ sessionId: _sessionId, onSave }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [elements, setElements] = useState<DrawElement[]>([]);
    const [currentElement, setCurrentElement] = useState<DrawElement | null>(null);
    const [tool, setTool] = useState('pen');
    const [color, setColor] = useState('#6366f1');
    const [lineWidth, setLineWidth] = useState(3);
    const [isDrawing, setIsDrawing] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);

    const getPos = (e: React.MouseEvent | React.TouchEvent): Point => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height)
        };
    };

    const drawAll = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background grid
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }

        const allElements = currentElement ? [...elements, currentElement] : elements;
        for (const el of allElements) {
            ctx.strokeStyle = el.color;
            ctx.lineWidth = el.width;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (el.type === 'line' && el.points.length > 1) {
                ctx.beginPath();
                ctx.moveTo(el.points[0].x, el.points[0].y);
                for (let i = 1; i < el.points.length; i++) {
                    ctx.lineTo(el.points[i].x, el.points[i].y);
                }
                ctx.stroke();
            } else if (el.type === 'rect' && el.points.length === 2) {
                const [p1, p2] = el.points;
                ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
            } else if (el.type === 'circle' && el.points.length === 2) {
                const [center, edge] = el.points;
                const radius = Math.sqrt((edge.x - center.x) ** 2 + (edge.y - center.y) ** 2);
                ctx.beginPath();
                ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }, [elements, currentElement]);

    useEffect(() => { drawAll(); }, [drawAll]);

    useEffect(() => {
        const resizeCanvas = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (canvas && container) {
                const dpr = window.devicePixelRatio || 1;
                const rect = container.getBoundingClientRect();
                canvas.width = rect.width * dpr;
                canvas.height = Math.max(600, rect.height) * dpr;
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.scale(dpr, dpr);
                drawAll();
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [drawAll]);

    // Auto-save every 30 seconds
    useEffect(() => {
        if (!onSave || elements.length === 0) return;
        const interval = setInterval(() => {
            onSave({ elements, lastModified: new Date().toISOString() });
        }, 30000);
        return () => clearInterval(interval);
    }, [elements, onSave]);

    const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
        if ('touches' in e && e.touches.length > 1) return; // Ignore multi-touch

        const pos = getPos(e);
        setIsDrawing(true);
        const drawColor = tool === 'eraser' ? '#0a0a1a' : color;
        const drawWidth = tool === 'eraser' ? 30 : lineWidth;
        const type: DrawElement['type'] = tool === 'rect' ? 'rect' : tool === 'circle' ? 'circle' : 'line';
        setCurrentElement({ type, points: [pos], color: drawColor, width: drawWidth });
    };

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !currentElement) return;
        if ('touches' in e) e.preventDefault(); // Prevent scrolling while drawing

        const pos = getPos(e);
        if (currentElement.type === 'line') {
            setCurrentElement({ ...currentElement, points: [...currentElement.points, pos] });
        } else {
            setCurrentElement({ ...currentElement, points: [currentElement.points[0], pos] });
        }
    };

    const handleEnd = () => {
        if (currentElement) {
            setElements((prev) => [...prev, currentElement]);
            setCurrentElement(null);
        }
        setIsDrawing(false);
    };

    const clear = () => {
        if (confirm("Reset the canvas? This cannot be undone.")) {
            setElements([]);
        }
    };

    const exportCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `idea-canvas-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success("Sketch exported as PNG");
    };

    const saveManual = () => {
        if (onSave) {
            onSave({ elements, savedAt: new Date().toISOString() });
            toast.success("Canvas saved to server");
        }
    };

    return (
        <div
            ref={containerRef}
            className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col shadow-2xl"
        >
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-3 bg-slate-900/50 border-b border-slate-800 flex-wrap backdrop-blur-md">
                <div className="flex items-center gap-1 bg-slate-950/50 p-1 rounded-lg border border-slate-800" role="toolbar" aria-label="Drawing tools">
                    {TOOLS.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTool(t.id)}
                            title={t.label}
                            aria-label={t.label}
                            aria-pressed={tool === t.id}
                            className={`p-2 rounded-md transition-all ${tool === t.id
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                : "text-slate-400 hover:text-white hover:bg-slate-800"
                                }`}
                        >
                            {t.icon}
                        </button>
                    ))}
                </div>

                <div className="w-px h-6 bg-slate-800 mx-1" />

                {/* Color picker */}
                <div className="relative">
                    <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        aria-label="Pick color"
                        aria-expanded={showColorPicker}
                        aria-haspopup="true"
                        className="p-2 rounded-lg bg-slate-950/50 border border-slate-800 flex items-center gap-2 hover:bg-slate-800 transition-colors"
                    >
                        <div className="w-5 h-5 rounded-full ring-2 ring-white/10" style={{ background: color }} aria-hidden="true" />
                        <Palette size={14} className="text-slate-400" />
                    </button>

                    <AnimatePresence>
                        {showColorPicker && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                role="menu"
                                aria-label="Colors"
                                className="absolute top-full left-0 z-50 mt-2 p-2 grid grid-cols-4 gap-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl"
                            >
                                {COLORS.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => { setColor(c); setShowColorPicker(false); }}
                                        aria-label={`Select color ${c}`}
                                        className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${color === c ? "ring-2 ring-white scale-110" : ""
                                            }`}
                                        style={{ background: c }}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Width */}
                <div className="flex items-center gap-3 px-3 bg-slate-950/50 rounded-lg border border-slate-800 h-10">
                    <div className="w-4 h-4 rounded-full bg-slate-500 transition-transform duration-200" style={{ transform: `scale(${0.3 + lineWidth / 10})` }} aria-hidden="true" />
                    <input
                        type="range" min="1" max="15" value={lineWidth}
                        onChange={(e) => setLineWidth(parseInt(e.target.value))}
                        aria-label="Line width"
                        className="w-24 accent-blue-500 hover:accent-blue-400 transition-all cursor-pointer"
                    />
                </div>

                <div className="flex-1" />

                <div className="flex items-center gap-1 bg-slate-950/50 p-1 rounded-lg border border-slate-800">
                    <button
                        onClick={clear}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all"
                        title="Reset Canvas"
                        aria-label="Reset Canvas"
                    >
                        <RotateCcw size={18} />
                    </button>
                    <button
                        onClick={exportCanvas}
                        className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-all"
                        title="Export as PNG"
                        aria-label="Export as PNG"
                    >
                        <Download size={18} />
                    </button>
                </div>

                <button
                    onClick={saveManual}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    <Save size={16} aria-hidden="true" />
                    <span className="hidden sm:inline">Save Session</span>
                </button>
            </div>

            {/* Canvas */}
            <div className="relative flex-1 bg-slate-950 cursor-crosshair overflow-hidden touch-none">
                <canvas
                    ref={canvasRef}
                    onMouseDown={handleStart}
                    onMouseMove={handleMove}
                    onMouseUp={handleEnd}
                    onMouseLeave={handleEnd}
                    onTouchStart={handleStart}
                    onTouchMove={handleMove}
                    onTouchEnd={handleEnd}
                    role="img"
                    aria-label="Idea Canvas - Drawing area for sketching and visualizing ideas"
                    className="block w-full h-full"
                />
                {!elements.length && !currentElement && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 select-none">
                        <div className="text-center">
                            <MousePointer2 className="w-12 h-12 mx-auto mb-2 text-blue-500" />
                            <p className="text-xl font-bold uppercase tracking-widest text-white">Idea Canvas</p>
                            <p className="text-sm">Start drawing to visualize your thoughts</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IdeaCanvas;
