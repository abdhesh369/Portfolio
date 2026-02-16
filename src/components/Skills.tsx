import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSkills, useSkillConnections } from '@/hooks/use-portfolio';
import { Zap, Layers, Code2, Cpu } from 'lucide-react';

import { SkillStatus, SkillCategory, SkillNode } from './skills/SkillTypes';
import { DEFAULT_SKILL_NODES, DEFAULT_CONNECTIONS, ICON_MAP } from './skills/SkillData';
import { HexagonNode } from './skills/HexagonNode';
import { SkillTooltip } from './skills/SkillTooltip';
import { SkillsTreeSVG } from './skills/SkillsTreeSVG';
import { StatPanel, ProficiencyChart, CategorySummary } from './skills/StatPanels';

export default function SkillsTree() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [lowPowerMode, setLowPowerMode] = useState(false);

  const { data: apiSkills } = useSkills();
  const { data: apiConnections } = useSkillConnections();

  const skillNodes = useMemo(() => {
    if (!apiSkills || apiSkills.length === 0) return DEFAULT_SKILL_NODES;
    return apiSkills.map(s => ({
      ...s,
      id: String(s.id),
      icon: ICON_MAP[s.icon] || Code2,
      status: s.status as SkillStatus,
      category: s.category as SkillCategory
    }));
  }, [apiSkills]);

  const connections = useMemo(() => {
    if (!apiConnections || apiConnections.length === 0) return DEFAULT_CONNECTIONS;
    return apiConnections.map(c => ({
      from: String(c.fromSkillId),
      to: String(c.toSkillId)
    }));
  }, [apiConnections]);

  const highlightedConnections = useMemo(() => {
    if (!activeNode) return new Set<string>();
    const connectionsSet = new Set<string>();
    const visited = new Set<string>([activeNode]);
    const queue = [activeNode];

    while (queue.length > 0) {
      const current = queue.shift()!;
      connections.forEach((conn) => {
        if (conn.to === current && !visited.has(conn.from)) {
          visited.add(conn.from);
          connectionsSet.add(`${conn.from}-${conn.to}`);
          queue.push(conn.from);
        }
      });
    }
    return connectionsSet;
  }, [activeNode, connections]);

  const handleNodeClick = (id: string) => {
    setActiveNode(id);
    setShowTooltip(true);
  };

  const handleCloseTooltip = () => {
    setShowTooltip(false);
    setActiveNode(null);
  };

  const activeNodeData = skillNodes.find((n) => n.id === activeNode);

  return (
    <section
      id="skills"
      className="relative min-h-screen py-16 md:py-24 overflow-hidden"
    >
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #a855f7 40%, #ec4899 80%, #00d4ff 100%)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: lowPowerMode ? 'none' : 'gradient-x 8s ease infinite'
            }}
          >
            Skill Tree
          </motion.h2>
          <div className="flex flex-col items-center gap-2">
            <p className="text-gray-400 max-w-md mx-auto text-sm md:text-base">
              A verified map of my technical abilities
            </p>
            <button
              onClick={() => setLowPowerMode(!lowPowerMode)}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${lowPowerMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-primary/10 text-primary-foreground/60 border border-primary/20 hover:bg-primary/20'
                }`}
            >
              <Cpu className={`w-3 h-3 ${lowPowerMode ? 'animate-pulse' : ''}`} />
              {lowPowerMode ? 'High Performance Mode Off' : 'Low Power Mode'}
            </button>
          </div>
        </motion.div>

        {/* Tree Container */}
        <motion.div
          className="relative w-full max-w-5xl mx-auto"
          style={{
            aspectRatio: '16 / 12'
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Tree SVG */}
          <SkillsTreeSVG
            highlightedConnections={highlightedConnections}
            skillNodes={skillNodes}
            connections={connections}
          />

          {/* Skill Nodes */}
          {skillNodes.map((node) => (
            <HexagonNode
              key={node.id}
              node={node}
              isActive={activeNode === node.id}
              onClick={() => handleNodeClick(node.id)}
              onHover={() => setActiveNode(node.id)}
              onLeave={() => !showTooltip && setActiveNode(null)}
            />
          ))}

          ```tsx
          {/* Stat Panels */}
          <div className="hidden lg:block">
            <StatPanel
              title="Proficiency"
              position="left"
              icon={<Zap className="w-3 h-3 text-cyan-400" />}
            >
              <ProficiencyChart skillNodes={skillNodes} />
            </StatPanel>

            <StatPanel
              title="Categories"
              position="right"
              icon={<Layers className="w-3 h-3 text-purple-400" />}
            >
              <CategorySummary skillNodes={skillNodes} />
            </StatPanel>
          </div>
        </motion.div>
        ```

        {/* Legend */}
        <motion.div
          className="flex justify-center gap-4 md:gap-8 mt-6 md:mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 2.8 }}
        >
          {[
            { label: 'Core', color: '#00d4ff' },
            { label: 'Comfortable', color: '#a855f7' },
            { label: 'Learning', color: '#ec4899' }
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: item.color,
                  boxShadow: `0 0 8px ${item.color}80`
                }}
              />
              <span className="text-xs text-gray-500 font-medium">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Tooltip Modal */}
      <AnimatePresence>
        {showTooltip && activeNodeData && (
          <SkillTooltip node={activeNodeData} onClose={handleCloseTooltip} />
        )}
      </AnimatePresence>
    </section>
  );
}
