import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Button } from "@/components/ui/button";
import {
    Bold, Italic, Strikethrough, Code, List, ListOrdered,
    Quote, Heading1, Heading2, Link as LinkIcon, Undo, Redo
} from "lucide-react";

// Create lowlight instance with common languages
const lowlight = createLowlight(common);

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    className?: string;
    placeholder?: string;
}

type ButtonItem = {
    type?: 'button';
    icon: React.ElementType;
    action: () => boolean;
    isActive: boolean;
    title: string;
};

type DividerItem = {
    type: 'divider';
};

type MenuItem = ButtonItem | DividerItem;

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    const buttons: MenuItem[] = [
        { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold'), title: 'Bold' },
        { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic'), title: 'Italic' },
        { icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), isActive: editor.isActive('strike'), title: 'Strike' },
        { icon: Code, action: () => editor.chain().focus().toggleCode().run(), isActive: editor.isActive('code'), title: 'Code' },
        { type: 'divider' },
        { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editor.isActive('heading', { level: 1 }), title: 'H1' },
        { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive('heading', { level: 2 }), title: 'H2' },
        { type: 'divider' },
        { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive('bulletList'), title: 'Bullet List' },
        { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive('orderedList'), title: 'Ordered List' },
        { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), isActive: editor.isActive('blockquote'), title: 'Quote' },
        { type: 'divider' },
        { icon: Undo, action: () => editor.chain().focus().undo().run(), isActive: false, title: 'Undo' },
        { icon: Redo, action: () => editor.chain().focus().redo().run(), isActive: false, title: 'Redo' },
    ];

    return (
        <div className="flex flex-wrap gap-1 p-2 bg-white/5 border-b border-white/10">
            {buttons.map((btn, index) => (
                btn.type === 'divider' ? (
                    <div key={index} className="w-px h-6 bg-white/10 mx-1 self-center" />
                ) : (
                    <button
                        key={index}
                        onClick={(e) => { e.preventDefault(); btn.action(); }}
                        className={`p-1.5 rounded-md transition-colors ${btn.isActive
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'text-white/60 hover:bg-white/10 hover:text-white'
                            }`}
                        title={btn.title}
                        type="button"
                    >
                        {btn.icon && <btn.icon size={16} />}
                    </button>
                )
            ))}
        </div>
    );
};

export function RichTextEditor({ value, onChange, label, className }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-purple-400 underline hover:text-purple-300',
                },
            }),
            CodeBlockLowlight.configure({
                lowlight,
                HTMLAttributes: {
                    class: 'bg-black/50 rounded-md p-4 font-mono text-sm my-4',
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[150px] px-3 py-2 text-sm text-white/90',
            },
        },
    });

    return (
        <div className={className}>
            {label && (
                <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">
                    {label}
                </label>
            )}
            <div className="border border-white/10 rounded-lg overflow-hidden bg-[hsl(224_71%_4%_/_0.5)] focus-within:ring-1 focus-within:border-purple-500 transition-all">
                <MenuBar editor={editor} />
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
