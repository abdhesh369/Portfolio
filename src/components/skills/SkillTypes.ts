import { LucideIcon } from 'lucide-react';

export type SkillStatus = 'Core' | 'Comfortable' | 'Learning';
export type SkillCategory = 'Foundations' | 'Frontend' | 'Backend' | 'Tools';

export interface SkillNode {
    id: string;
    name: string;
    icon: LucideIcon;
    category: SkillCategory;
    status: SkillStatus;
    description: string;
    proof: string;
    x: number;
    y: number;
}

export interface Connection {
    from: string;
    to: string;
}

export interface NodeColors {
    glow: string;
    glowRgb: string;
    border: string;
    bg: string;
}
