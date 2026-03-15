'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Star, Eye, Lock } from 'lucide-react';

// ---------- Types ----------

interface PathNode {
  id: string;
  stageId: string;
  title: string;
  points: number;
  x: number;
  y: number;
  children: string[];
}

interface PathEdge {
  from: string;
  to: string;
}

interface QuestPathProps {
  nodes: PathNode[];
  edges: PathEdge[];
  chosenPath: string[];
  currentNodeId?: string;
  className?: string;
}

// ---------- Helpers ----------

function getNodeStatus(
  nodeId: string,
  chosenPath: string[],
  currentNodeId?: string,
): 'completed' | 'current' | 'available' | 'locked' {
  if (currentNodeId === nodeId) return 'current';
  const idx = chosenPath.indexOf(nodeId);
  if (idx >= 0) {
    const currentIdx = currentNodeId ? chosenPath.indexOf(currentNodeId) : -1;
    if (currentIdx < 0 || idx < currentIdx) return 'completed';
  }
  return chosenPath.includes(nodeId) ? 'available' : 'locked';
}

const statusStyles: Record<
  string,
  { fill: string; border: string; text: string; glow: string }
> = {
  completed: {
    fill: 'fill-emerald-500/20',
    border: 'stroke-emerald-500',
    text: 'text-emerald-400',
    glow: 'drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]',
  },
  current: {
    fill: 'fill-violet-500/20',
    border: 'stroke-violet-500',
    text: 'text-violet-400',
    glow: 'drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]',
  },
  available: {
    fill: 'fill-white/5',
    border: 'stroke-slate-400',
    text: 'text-slate-300',
    glow: '',
  },
  locked: {
    fill: 'fill-white/[0.02]',
    border: 'stroke-slate-700',
    text: 'text-slate-600',
    glow: '',
  },
};

// ---------- Path Comparison Panel ----------

function PathComparison({
  nodes,
  chosenPath,
  alternativePaths,
}: {
  nodes: PathNode[];
  chosenPath: string[];
  alternativePaths: string[][];
}) {
  const nodeMap = useMemo(
    () => Object.fromEntries(nodes.map((n) => [n.id, n])),
    [nodes],
  );

  const chosenPoints = chosenPath.reduce(
    (sum, id) => sum + (nodeMap[id]?.points ?? 0),
    0,
  );

  if (alternativePaths.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      <h4 className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
        What if...
      </h4>
      {alternativePaths.slice(0, 3).map((path, i) => {
        const altPoints = path.reduce(
          (sum, id) => sum + (nodeMap[id]?.points ?? 0),
          0,
        );
        const diff = altPoints - chosenPoints;

        return (
          <div
            key={i}
            className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5"
          >
            <div className="flex items-center gap-1.5">
              <Eye size={10} className="text-slate-500" />
              <span className="text-[10px] text-slate-400">
                Alternative path {i + 1}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star size={10} className="text-amber-400" />
              <span
                className={`text-[10px] font-medium ${
                  diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-rose-400' : 'text-slate-400'
                }`}
              >
                {diff > 0 ? '+' : ''}
                {diff} pts
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Main Component ----------

const QuestPath: React.FC<QuestPathProps> = ({
  nodes,
  edges,
  chosenPath,
  currentNodeId,
  className = '',
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Calculate SVG bounds
  const svgWidth = useMemo(
    () => Math.max(...nodes.map((n) => n.x)) + 80,
    [nodes],
  );
  const svgHeight = useMemo(
    () => Math.max(...nodes.map((n) => n.y)) + 80,
    [nodes],
  );

  const nodeMap = useMemo(
    () => Object.fromEntries(nodes.map((n) => [n.id, n])),
    [nodes],
  );

  // Derive alternative paths (simple: paths through non-chosen nodes)
  const alternativePaths = useMemo(() => {
    // Find all leaf nodes (no children)
    const leafIds = nodes
      .filter((n) => n.children.length === 0)
      .map((n) => n.id);

    // For each leaf not in chosen path, trace back
    const altPaths: string[][] = [];
    for (const leafId of leafIds) {
      if (chosenPath.includes(leafId)) continue;
      // Simple: collect non-chosen ancestors
      const path: string[] = [leafId];
      // Walk edges backward
      let current = leafId;
      for (let safety = 0; safety < 20; safety++) {
        const parent = edges.find((e) => e.to === current);
        if (!parent) break;
        path.unshift(parent.from);
        current = parent.from;
      }
      if (path.length > 1) altPaths.push(path);
    }
    return altPaths;
  }, [nodes, edges, chosenPath]);

  const totalChosenPoints = chosenPath.reduce(
    (sum, id) => sum + (nodeMap[id]?.points ?? 0),
    0,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitBranch size={16} className="text-violet-400" />
          <span className="text-sm font-medium text-white">Quest Path</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Star size={12} className="text-amber-400" />
          <span className="text-xs text-slate-400">{totalChosenPoints} pts</span>
        </div>
      </div>

      {/* SVG Graph */}
      <div className="overflow-x-auto">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="overflow-visible"
        >
          {/* Edges */}
          {edges.map((edge) => {
            const fromNode = nodeMap[edge.from];
            const toNode = nodeMap[edge.to];
            if (!fromNode || !toNode) return null;

            const isChosen =
              chosenPath.includes(edge.from) && chosenPath.includes(edge.to);

            return (
              <motion.line
                key={`${edge.from}-${edge.to}`}
                x1={fromNode.x + 20}
                y1={fromNode.y + 20}
                x2={toNode.x + 20}
                y2={toNode.y + 20}
                className={
                  isChosen ? 'stroke-violet-500' : 'stroke-white/10'
                }
                strokeWidth={isChosen ? 2 : 1}
                strokeDasharray={isChosen ? 'none' : '4 4'}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8 }}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const status = getNodeStatus(node.id, chosenPath, currentNodeId);
            const styles = statusStyles[status];
            const isSelected = selectedNode === node.id;

            return (
              <g
                key={node.id}
                className="cursor-pointer"
                onClick={() => setSelectedNode(isSelected ? null : node.id)}
              >
                {/* Node circle */}
                <motion.circle
                  cx={node.x + 20}
                  cy={node.y + 20}
                  r={16}
                  className={`${styles.fill} ${styles.border} ${styles.glow}`}
                  strokeWidth={status === 'current' ? 2.5 : 1.5}
                  whileHover={{ scale: 1.15 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                />

                {/* Icon inside */}
                {status === 'locked' ? (
                  <Lock
                    x={node.x + 14}
                    y={node.y + 14}
                    size={12}
                    className="text-slate-600 pointer-events-none"
                  />
                ) : (
                  <text
                    x={node.x + 20}
                    y={node.y + 24}
                    textAnchor="middle"
                    className={`text-[10px] font-bold ${styles.text} pointer-events-none`}
                    fill="currentColor"
                  >
                    {node.points}
                  </text>
                )}

                {/* Label below */}
                <text
                  x={node.x + 20}
                  y={node.y + 48}
                  textAnchor="middle"
                  className={`text-[9px] ${styles.text} pointer-events-none`}
                  fill="currentColor"
                >
                  {node.title.length > 12
                    ? node.title.slice(0, 11) + '...'
                    : node.title}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected node detail */}
      <AnimatePresence>
        {selectedNode && nodeMap[selectedNode] && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <p className="text-xs font-medium text-white">
                {nodeMap[selectedNode].title}
              </p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Star size={10} className="text-amber-400" />
                  {nodeMap[selectedNode].points} points
                </span>
                <span
                  className={`text-[10px] font-medium ${
                    statusStyles[getNodeStatus(selectedNode, chosenPath, currentNodeId)].text
                  }`}
                >
                  {getNodeStatus(selectedNode, chosenPath, currentNodeId)}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Path comparison */}
      <PathComparison
        nodes={nodes}
        chosenPath={chosenPath}
        alternativePaths={alternativePaths}
      />
    </motion.div>
  );
};

export default QuestPath;
