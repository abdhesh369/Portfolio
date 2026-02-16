import { Terminal, Code2, Globe, Zap, Server, GitBranch, Layers, BookOpen } from 'lucide-react';
import { SkillNode, Connection } from './SkillTypes';

export const DEFAULT_SKILL_NODES: SkillNode[] = [
    {
        id: 'c',
        name: 'C',
        icon: Terminal,
        category: 'Foundations',
        status: 'Core',
        description: 'Manual memory management and low-level logic.',
        proof: 'Academic coursework & system programming.',
        x: 20,
        y: 20
    },
    {
        id: 'cpp',
        name: 'C++',
        icon: Code2,
        category: 'Foundations',
        status: 'Core',
        description: 'Object-Oriented Programming and STL.',
        proof: 'University projects with complex data structures.',
        x: 50,
        y: 18
    },
    {
        id: 'python',
        name: 'Python',
        icon: Terminal,
        category: 'Foundations',
        status: 'Core',
        description: 'Scripting, automation, and data analysis.',
        proof: 'Data processing scripts and backend tools.',
        x: 80,
        y: 20
    },
    {
        id: 'html',
        name: 'HTML',
        icon: Globe,
        category: 'Frontend',
        status: 'Core',
        description: 'Semantic structure and accessibility.',
        proof: 'Foundation of all web projects.',
        x: 30,
        y: 45
    },
    {
        id: 'css',
        name: 'CSS',
        icon: Layers,
        category: 'Frontend',
        status: 'Core',
        description: 'Responsive design and animations.',
        proof: 'Styled multiple responsive websites.',
        x: 50,
        y: 45
    },
    {
        id: 'js',
        name: 'JavaScript',
        icon: Zap,
        category: 'Frontend',
        status: 'Core',
        description: 'Dynamic logic and DOM manipulation.',
        proof: 'Interactive features and game logic.',
        x: 70,
        y: 45
    },
    {
        id: 'ml',
        name: 'ML',
        icon: Server,
        category: 'Backend',
        status: 'Learning',
        description: 'Model training and data predictions.',
        proof: 'Academic projects in predictive analysis.',
        x: 50,
        y: 70
    },
    {
        id: 'react',
        name: 'React',
        icon: Code2,
        category: 'Frontend',
        status: 'Core',
        description: 'Component-based UI development.',
        proof: 'Built this portfolio and other SPA.',
        x: 70,
        y: 60
    },
    {
        id: 'git',
        name: 'Git',
        icon: GitBranch,
        category: 'Tools',
        status: 'Core',
        description: 'Version control system.',
        proof: 'Daily usage for code management.',
        x: 15,
        y: 60
    },
    {
        id: 'github',
        name: 'GitHub',
        icon: GitBranch,
        category: 'Tools',
        status: 'Core',
        description: 'Code hosting and collaboration.',
        proof: 'Project repositories and CI/CD.',
        x: 30,
        y: 70
    }
];

export const DEFAULT_CONNECTIONS: Connection[] = [
    { from: 'c', to: 'cpp' },
    { from: 'cpp', to: 'python' },
    { from: 'python', to: 'ml' },
    { from: 'html', to: 'css' },
    { from: 'css', to: 'js' },
    { from: 'js', to: 'html' },
    { from: 'python', to: 'js' },
    { from: 'js', to: 'react' },
    { from: 'git', to: 'github' },
    { from: 'c', to: 'git' }
];

export const ICON_MAP: Record<string, any> = {
    Code: Code2,
    Code2,
    Database: Server,
    Layout: Layers,
    Server,
    Terminal,
    GitBranch,
    Globe,
    Braces: Code2,
    Zap,
    Layers,
    BookOpen
};
