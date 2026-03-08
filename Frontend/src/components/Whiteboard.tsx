import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Pen, Eraser, Square, Circle as CircleIcon, Minus, Palette, RotateCcw, Download, Save } from 'lucide-react';

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

interface WhiteboardProps {
    sessionId?: number;
    onSave?: (canvasData: Record<string, unknown>) => void;
}

export const Whiteboard: React.FC<WhiteboardProps> = ({ sessionId, onSave }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [elements, setElements] = useState<DrawElement[]>([]);
    const [currentElement, setCurrentElement] = useState<DrawElement | null>(null);
    const [tool, setTool] = useState('pen');
    const [color, setColor] = useState('#6366f1');
    const [lineWidth, setLineWidth] = useState(3);
    const [isDrawing, setIsDrawing] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);

    const getPos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const drawAll = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
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
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = canvas.parentElement!.clientWidth;
            canvas.height = 600;
            drawAll();
        }
    }, []);

    // Auto-save every 10 seconds
    useEffect(() => {
        if (!onSave || elements.length === 0) return;
        const interval = setInterval(() => {
            onSave({ elements, savedAt: new Date().toISOString() });
        }, 10000);
        return () => clearInterval(interval);
    }, [elements, onSave]);

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const pos = getPos(e);
        setIsDrawing(true);
        const drawColor = tool === 'eraser' ? '#0a0a1a' : color;
        const drawWidth = tool === 'eraser' ? 20 : lineWidth;
        const type: DrawElement['type'] = tool === 'rect' ? 'rect' : tool === 'circle' ? 'circle' : 'line';
        setCurrentElement({ type, points: [pos], color: drawColor, width: drawWidth });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !currentElement) return;
        const pos = getPos(e);
        if (currentElement.type === 'line') {
            setCurrentElement({ ...currentElement, points: [...currentElement.points, pos] });
        } else {
            setCurrentElement({ ...currentElement, points: [currentElement.points[0], pos] });
        }
    };

    const handleMouseUp = () => {
        if (currentElement) {
            setElements((prev) => [...prev, currentElement]);
            setCurrentElement(null);
        }
        setIsDrawing(false);
    };

    const clear = () => { setElements([]); };

    const exportCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `whiteboard-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    };

    return (
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-primary, rgba(255,255,255,0.1))' }}>
            {/* Toolbar */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem',
                background: 'var(--surface-secondary, #1e1e3a)', borderBottom: '1px solid var(--border-primary)',
                flexWrap: 'wrap',
            }}>
                {TOOLS.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTool(t.id)}
                        title={t.label}
                        style={{
                            padding: '0.4rem', borderRadius: '6px', border: 'none',
                            background: tool === t.id ? 'var(--accent-primary, #6366f1)' : 'transparent',
                            color: tool === t.id ? '#fff' : 'var(--text-secondary)', cursor: 'pointer',
                        }}
                    >
                        {t.icon}
                    </button>
                ))}

                <div style={{ width: '1px', height: '24px', background: 'var(--border-primary)', margin: '0 0.25rem' }} />

                {/* Color picker */}
                <div style={{ position: 'relative' }}>
                    <button onClick={() => setShowColorPicker(!showColorPicker)} style={{
                        padding: '0.4rem', borderRadius: '6px', border: 'none', background: 'transparent',
                        color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: color, border: '2px solid rgba(255,255,255,0.3)' }} />
                    </button>
                    {showColorPicker && (
                        <div style={{
                            position: 'absolute', top: '100%', left: 0, zIndex: 10,
                            display: 'flex', gap: '4px', padding: '8px', borderRadius: '8px',
                            background: 'var(--surface-primary)', border: '1px solid var(--border-primary)', marginTop: '4px',
                        }}>
                            {COLORS.map((c) => (
                                <button key={c} onClick={() => { setColor(c); setShowColorPicker(false); }} style={{
                                    width: '20px', height: '20px', borderRadius: '50%', background: c, border: color === c ? '2px solid #fff' : '2px solid transparent',
                                    cursor: 'pointer',
                                }} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Width */}
                <input
                    type="range" min="1" max="10" value={lineWidth}
                    onChange={(e) => setLineWidth(parseInt(e.target.value))}
                    style={{ width: '80px', accentColor: 'var(--accent-primary)' }}
                />

                <div style={{ flex: 1 }} />

                <button onClick={clear} title="Clear" style={{ padding: '0.4rem', borderRadius: '6px', border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <RotateCcw size={16} />
                </button>
                <button onClick={exportCanvas} title="Export PNG" style={{ padding: '0.4rem', borderRadius: '6px', border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <Download size={16} />
                </button>
                {onSave && (
                    <button onClick={() => onSave({ elements, savedAt: new Date().toISOString() })} title="Save" style={{
                        padding: '0.4rem 0.75rem', borderRadius: '6px', border: 'none',
                        background: 'var(--accent-primary)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem',
                    }}>
                        <Save size={14} /> Save
                    </button>
                )}
            </div>

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ background: 'var(--bg-primary, #0a0a1a)', cursor: tool === 'eraser' ? 'crosshair' : 'default', display: 'block', width: '100%' }}
            />
        </div>
    );
};
