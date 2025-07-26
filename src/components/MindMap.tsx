'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Note } from '@/types';
import { Brain, Heart, Lightbulb, TrendingUp, Calendar } from 'lucide-react';

interface MindMapProps {
  notes: Note[];
}

interface EmotionNode {
  emotion: string;
  count: number;
  notes: Note[];
  color: string;
  position: { x: number; y: number };
  isDragging?: boolean;
}

interface Connection {
  from: EmotionNode;
  to: EmotionNode;
  strength: number;
}

export default function MindMap({ notes }: MindMapProps) {
  const [emotionNodes, setEmotionNodes] = useState<EmotionNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<EmotionNode | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [draggedNode, setDraggedNode] = useState<EmotionNode | null>(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [canvasScale, setCanvasScale] = useState(1);
  const [isPanningCanvas, setIsPanningCanvas] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isMouseOverCanvas, setIsMouseOverCanvas] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (notes.length === 0) return;

    // Group notes by emotions
    const emotionMap = new Map<string, Note[]>();
    
    notes.forEach(note => {
      if (note.tags) {
        note.tags.forEach(tag => {
          if (tag) {
            if (!emotionMap.has(tag)) {
              emotionMap.set(tag, []);
            }
            emotionMap.get(tag)!.push(note);
          }
        });
      }
    });

    // Convert to nodes with positions using force-directed layout
    const colors = [
      '#3B82F6', // blue
      '#EF4444', // red
      '#10B981', // green
      '#F59E0B', // amber
      '#8B5CF6', // violet
      '#EC4899', // pink
      '#6B7280', // gray
      '#14B8A6', // teal
      '#F97316', // orange
      '#84CC16', // lime
    ];

    // Initial positioning with better distribution
    const nodes: EmotionNode[] = Array.from(emotionMap.entries()).map(([emotion, emotionNotes], index) => {
      const total = emotionMap.size;
      
      // Use multiple rings to spread nodes better
      const ring = Math.floor(index / 6); // 6 nodes per ring
      const angleInRing = (index % 6) * (Math.PI * 2) / 6;
      const baseRadius = 150 + ring * 80; // Rings at 150, 230, 310, etc.
      
      // Add some randomness to avoid perfect symmetry
      const radiusVariation = (Math.random() - 0.5) * 40;
      const angleVariation = (Math.random() - 0.5) * 0.5;
      
      const finalRadius = baseRadius + radiusVariation;
      const finalAngle = angleInRing + angleVariation;
      
      return {
        emotion,
        count: emotionNotes.length,
        notes: emotionNotes,
        color: colors[index % colors.length],
        position: {
          x: Math.cos(finalAngle) * finalRadius,
          y: Math.sin(finalAngle) * finalRadius,
        },
        isDragging: false,
      };
    });

    // Apply force-directed positioning to prevent overlaps
    const adjustedNodes = applyForceDirectedLayout(nodes);
    
    // Final collision resolution pass
    const finalNodes = resolveRemainingCollisions(adjustedNodes);
    
    // Calculate connections based on shared emotional themes
    const nodeConnections = calculateConnections(finalNodes);
    
    setEmotionNodes(finalNodes);
    setConnections(nodeConnections);
  }, [notes]);

  // Prevent page scroll when mouse is over canvas
  useEffect(() => {
    const preventDefault = (e: WheelEvent) => {
      if (isMouseOverCanvas) {
        e.preventDefault();
      }
    };

    // Add passive: false to enable preventDefault
    document.addEventListener('wheel', preventDefault, { passive: false });

    return () => {
      document.removeEventListener('wheel', preventDefault);
    };
  }, [isMouseOverCanvas]);

  // Force-directed layout algorithm to prevent node overlaps
  const applyForceDirectedLayout = (nodes: EmotionNode[]): EmotionNode[] => {
    const adjustedNodes = [...nodes];
    const iterations = 150; // Even more iterations for better separation
    const repulsionForce = 5000; // Much stronger repulsion
    const centerAttraction = 0.01; // Weaker center attraction

    for (let i = 0; i < iterations; i++) {
      adjustedNodes.forEach((node, index) => {
        let forceX = 0;
        let forceY = 0;

        // Repulsion from other nodes with dynamic minimum distance
        adjustedNodes.forEach((otherNode, otherIndex) => {
          if (index !== otherIndex) {
            const dx = node.position.x - otherNode.position.x;
            const dy = node.position.y - otherNode.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Dynamic minimum distance based on node sizes
            const nodeSize1 = getNodeSize(node.count);
            const nodeSize2 = getNodeSize(otherNode.count);
            const minDistance = (nodeSize1 + nodeSize2) / 2 + 40; // Node radii + buffer

            if (distance < minDistance && distance > 0) {
              const force = repulsionForce / Math.max(distance * distance, 1);
              const normalizedX = dx / distance;
              const normalizedY = dy / distance;
              
              forceX += normalizedX * force;
              forceY += normalizedY * force;
            }
          }
        });

        // Very weak attraction to center to prevent infinite drift
        const centerDistance = Math.sqrt(node.position.x ** 2 + node.position.y ** 2);
        if (centerDistance > 200) { // Only apply if too far from center
          forceX -= node.position.x * centerAttraction;
          forceY -= node.position.y * centerAttraction;
        }

        // Apply force with adaptive damping
        const damping = 0.02; // Lower damping for better movement
        node.position.x += forceX * damping;
        node.position.y += forceY * damping;

        // Keep nodes within reasonable bounds but allow more space
        const maxRadius = 350; // Larger radius
        const currentRadius = Math.sqrt(node.position.x ** 2 + node.position.y ** 2);
        if (currentRadius > maxRadius) {
          const factor = maxRadius / currentRadius;
          node.position.x *= factor;
          node.position.y *= factor;
        }
      });
    }

    return adjustedNodes;
  };

  // Final collision resolution for any remaining overlaps
  const resolveRemainingCollisions = (nodes: EmotionNode[]): EmotionNode[] => {
    const resolvedNodes = [...nodes];
    
    // Check each pair of nodes for overlap
    for (let i = 0; i < resolvedNodes.length; i++) {
      for (let j = i + 1; j < resolvedNodes.length; j++) {
        const node1 = resolvedNodes[i];
        const node2 = resolvedNodes[j];
        
        const dx = node1.position.x - node2.position.x;
        const dy = node1.position.y - node2.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const size1 = getNodeSize(node1.count);
        const size2 = getNodeSize(node2.count);
        const minDistance = (size1 + size2) / 2 + 30; // Required separation
        
        if (distance < minDistance && distance > 0) {
          // Calculate separation vector
          const separationDistance = minDistance - distance;
          const separationX = (dx / distance) * separationDistance * 0.5;
          const separationY = (dy / distance) * separationDistance * 0.5;
          
          // Move both nodes apart
          node1.position.x += separationX;
          node1.position.y += separationY;
          node2.position.x -= separationX;
          node2.position.y -= separationY;
        }
      }
    }
    
    return resolvedNodes;
  };

  // Calculate connections between nodes based on emotional similarity
  const calculateConnections = (nodes: EmotionNode[]): Connection[] => {
    const connections: Connection[] = [];
    const emotionalSimilarity: { [key: string]: string[] } = {
      'mutlu': ['sevinçli', 'memnun', 'huzurlu', 'rahat'],
      'üzgün': ['melankolik', 'hüzünlü', 'kederli', 'karamsar'],
      'sinirli': ['öfkeli', 'kızgın', 'gergin', 'stresli'],
      'huzurlu': ['sakin', 'dingin', 'mutlu', 'rahat'],
      'endişeli': ['kaygılı', 'gergin', 'stresli', 'tedirgin'],
      'heyecanlı': ['coşkulu', 'enerjik', 'istekli', 'mutlu'],
    };

    nodes.forEach((node, i) => {
      nodes.slice(i + 1).forEach((otherNode) => {
        let strength = 0;

        // Check if emotions are similar
        const emotion1 = node.emotion.toLowerCase();
        const emotion2 = otherNode.emotion.toLowerCase();
        
        if (emotionalSimilarity[emotion1]?.includes(emotion2) || 
            emotionalSimilarity[emotion2]?.includes(emotion1)) {
          strength = 0.8;
        } else {
          // Check for shared notes or temporal proximity
          const sharedDays = getSharedDays(node.notes, otherNode.notes);
          strength = Math.min(sharedDays / 5, 0.5); // Max 0.5 strength from temporal proximity
        }

        if (strength > 0.1) {
          connections.push({
            from: node,
            to: otherNode,
            strength,
          });
        }
      });
    });

    return connections;
  };

  // Helper function to check temporal proximity of notes
  const getSharedDays = (notes1: Note[], notes2: Note[]): number => {
    const dates1 = notes1.map(n => new Date(n.createdAt).toDateString());
    const dates2 = notes2.map(n => new Date(n.createdAt).toDateString());
    const sharedDates = dates1.filter(date => dates2.includes(date));
    return sharedDates.length;
  };

  // Canvas panning handlers
  const handleCanvasMouseDown = (event: React.MouseEvent) => {
    if (draggedNode) return; // Don't pan if dragging a node
    
    setIsPanningCanvas(true);
    setLastMousePos({ x: event.clientX, y: event.clientY });
  };

  const handleCanvasMouseMove = (event: React.MouseEvent) => {
    if (isPanningCanvas && !draggedNode) {
      const deltaX = event.clientX - lastMousePos.x;
      const deltaY = event.clientY - lastMousePos.y;
      
      setCanvasOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastMousePos({ x: event.clientX, y: event.clientY });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanningCanvas(false);
  };

  // Zoom handlers - only when mouse is over canvas
  const handleWheel = (event: React.WheelEvent) => {
    if (!isMouseOverCanvas) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const delta = event.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.5, canvasScale + delta), 3);
    setCanvasScale(newScale);
  };

  // Mouse enter/leave handlers for canvas area
  const handleMouseEnterCanvas = () => {
    setIsMouseOverCanvas(true);
  };

  const handleMouseLeaveCanvas = () => {
    setIsMouseOverCanvas(false);
    setIsPanningCanvas(false);
    if (draggedNode) {
      setEmotionNodes(prev => prev.map(n => ({ ...n, isDragging: false })));
      setDraggedNode(null);
    }
  };

  // Drag and drop handlers for nodes
  const handleMouseDown = (node: EmotionNode, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDraggedNode(node);
    
    setEmotionNodes(prev => prev.map(n => 
      n.emotion === node.emotion ? { ...n, isDragging: true } : n
    ));
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!draggedNode || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Account for canvas offset and scale
    const adjustedX = (event.clientX - rect.left - centerX - canvasOffset.x) / canvasScale;
    const adjustedY = (event.clientY - rect.top - centerY - canvasOffset.y) / canvasScale;
    
    const newX = (adjustedX / centerX) * 300;
    const newY = (adjustedY / centerY) * 300;

    setEmotionNodes(prev => prev.map(node => {
      if (node.emotion === draggedNode.emotion) {
        return { ...node, position: { x: newX, y: newY } };
      }
      return node;
    }));
  };

  const handleMouseUp = () => {
    if (draggedNode) {
      setEmotionNodes(prev => prev.map(n => ({ ...n, isDragging: false })));
      setDraggedNode(null);
    }
    setIsPanningCanvas(false);
  };

  // Reset view
  const resetView = () => {
    setCanvasOffset({ x: 0, y: 0 });
    setCanvasScale(1);
  };

  const getNodeSize = (count: number) => {
    const minSize = 50; // Slightly smaller minimum
    const maxSize = 100; // Smaller maximum to prevent huge nodes
    const maxCount = Math.max(...emotionNodes.map(n => n.count), 1);
    return minSize + (count / maxCount) * (maxSize - minSize);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Brain className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Mind Map Oluşturulamadı
        </h3>
        <p className="text-gray-500 dark:text-gray-500">
          Duygusal mind map görüntülemek için en az bir not ekleyin.
        </p>
      </div>
    );
  }

  if (emotionNodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Brain className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Duygusal Analiz Bekleniyor
        </h3>
        <p className="text-gray-500 dark:text-gray-500">
          Notlarınız henüz analiz edilmemiş. AI analizi tamamlandıktan sonra mind map görünecek.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Duygusal Mind Map
          </h2>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {emotionNodes.length} duygu kategorisi • {notes.length} not
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Mind Map Visualization */}
        <div className="lg:col-span-2">
          <div 
            ref={containerRef}
            className="relative bg-gray-50 dark:bg-gray-900 rounded-lg h-96 overflow-hidden border border-gray-200 dark:border-gray-700"
            onMouseEnter={handleMouseEnterCanvas}
            onMouseLeave={handleMouseLeaveCanvas}
            onWheel={handleWheel}
          >
            {/* Control buttons */}
            <div className="absolute top-2 left-2 z-10 flex gap-2">
              <button
                onClick={resetView}
                className="px-2 py-1 text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="Görünümü Sıfırla"
              >
                🎯 Reset
              </button>
              <div className="px-2 py-1 text-xs bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded shadow">
                Zoom: {Math.round(canvasScale * 100)}%
              </div>
            </div>

            <svg
              ref={svgRef}
              className={`w-full h-full ${
                isPanningCanvas ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              viewBox="-400 -400 800 800"
              xmlns="http://www.w3.org/2000/svg"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={(e) => {
                handleCanvasMouseMove(e);
                handleMouseMove(e);
              }}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Main group with transform for panning and zooming */}
              <g transform={`translate(${canvasOffset.x / canvasScale}, ${canvasOffset.y / canvasScale}) scale(${canvasScale})`}>
                {/* Gradient definitions for synaptic connections */}
                <defs>
                  <linearGradient id="synapseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#EC4899" stopOpacity="0.4" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <radialGradient id="centralGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="1" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
                  </radialGradient>
                </defs>

                {/* Background grid for reference */}
                <defs>
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#E5E7EB" strokeWidth="0.5" opacity="0.3"/>
                  </pattern>
                </defs>
                <rect x="-400" y="-400" width="800" height="800" fill="url(#grid)" />

                {/* Synaptic connections */}
                {connections.map((connection, index) => {
                  const { from, to, strength } = connection;
                  const midX = (from.position.x + to.position.x) / 2;
                  const midY = (from.position.y + to.position.y) / 2;
                  
                  // Create curved path for neural connection
                  const dx = to.position.x - from.position.x;
                  const dy = to.position.y - from.position.y;
                  const distance = Math.sqrt(dx * dx + dy * dy);
                  const curve = Math.min(distance * 0.3, 50);
                  
                  const pathData = `M ${from.position.x} ${from.position.y} Q ${midX + curve} ${midY - curve} ${to.position.x} ${to.position.y}`;
                  
                  return (
                    <g key={`connection-${index}`}>
                      {/* Synaptic path */}
                      <path
                        d={pathData}
                        stroke="url(#synapseGradient)"
                        strokeWidth={Math.max(strength * 4, 1)}
                        fill="none"
                        className="opacity-70"
                        filter="url(#glow)"
                        strokeDasharray={`${5 + strength * 5},${3 + strength * 3}`}
                      />
                      {/* Synaptic pulses */}
                      <circle r={2 + strength} fill="#3B82F6" className="opacity-90">
                        <animateMotion
                          dur={`${2 + Math.random() * 2}s`}
                          repeatCount="indefinite"
                          path={pathData}
                        />
                      </circle>
                    </g>
                  );
                })}

                {/* Central brain node */}
                <g>
                  <circle
                    cx="0"
                    cy="0"
                    r="40"
                    fill="url(#centralGradient)"
                    className="drop-shadow-xl"
                    filter="url(#glow)"
                    stroke="#4F46E5"
                    strokeWidth="3"
                  />
                  <text
                    x="0"
                    y="-3"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-white text-lg font-bold"
                  >
                    🧠
                  </text>
                  <text
                    x="0"
                    y="12"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-white text-sm font-medium"
                  >
                    Ben
                  </text>
                </g>

                {/* Emotion nodes */}
                {emotionNodes.map((node, index) => {
                  const size = getNodeSize(node.count);
                  const isSelected = selectedNode?.emotion === node.emotion;
                  
                  return (
                    <g key={index}>
                      {/* Node glow effect when selected */}
                      {isSelected && (
                        <circle
                          cx={node.position.x}
                          cy={node.position.y}
                          r={size / 2 + 15}
                          fill={node.color}
                          className="opacity-20 animate-pulse"
                        />
                      )}
                      
                      {/* Connection indicator to center */}
                      <line
                        x1="0"
                        y1="0"
                        x2={node.position.x}
                        y2={node.position.y}
                        stroke={node.color}
                        strokeWidth="2"
                        className="opacity-25"
                        strokeDasharray="8,4"
                      />
                      
                      {/* Main node */}
                      <motion.circle
                        cx={node.position.x}
                        cy={node.position.y}
                        r={size / 2}
                        fill={node.color}
                        className={`cursor-pointer drop-shadow-lg hover:drop-shadow-xl transition-all ${
                          node.isDragging ? 'opacity-80 cursor-grabbing' : 'cursor-grab'
                        }`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: isSelected ? 1.15 : 1, 
                          opacity: 1 
                        }}
                        transition={{ 
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 300,
                          damping: 20
                        }}
                        whileHover={{ scale: isSelected ? 1.2 : 1.1 }}
                        onMouseDown={(e) => handleMouseDown(node, e as any)}
                        onClick={() => setSelectedNode(selectedNode?.emotion === node.emotion ? null : node)}
                        filter="url(#glow)"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="2"
                      />
                      
                      {/* Node label */}
                      <text
                        x={node.position.x}
                        y={node.position.y - 8}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="fill-white text-sm font-semibold pointer-events-none select-none drop-shadow"
                      >
                        {node.emotion.length > 6 ? node.emotion.substring(0, 6) + '...' : node.emotion}
                      </text>
                      
                      {/* Node count */}
                      <text
                        x={node.position.x}
                        y={node.position.y + 6}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="fill-white text-xs font-bold pointer-events-none select-none drop-shadow"
                      >
                        {node.count}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
            
            {/* Instruction overlay */}
            <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow">
              🖱️ Sürükle: Nodelar • 🤏 Scroll: Zoom • ✋ Canvas: Pan
              {isMouseOverCanvas && (
                <div className="text-green-600 dark:text-green-400 font-medium">
                  • Zoom Aktif
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3">
            {emotionNodes.slice(0, 6).map((node, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: node.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {node.emotion} ({node.count})
                </span>
              </div>
            ))}
            {emotionNodes.length > 6 && (
              <span className="text-sm text-gray-500 dark:text-gray-500">
                +{emotionNodes.length - 6} more
              </span>
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className="space-y-4">
          {selectedNode ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedNode.color }}
                />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {selectedNode.emotion}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedNode.count} not
                </span>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {selectedNode.notes.slice(0, 5).map((note, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-900 dark:text-gray-100 mb-2 overflow-hidden" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {note.content}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {formatDate(note.createdAt)}
                    </div>
                  </div>
                ))}
                {selectedNode.notes.length > 5 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    +{selectedNode.notes.length - 5} daha fazla not
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
              <Lightbulb className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Bir duygu kategorisine tıklayarak o kategorideki notlarınızı görüntüleyin
              </p>
            </div>
          )}

          {/* Insights */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                Nöral İçgörüler
              </h4>
            </div>
            <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                • <strong>Dominant duygu:</strong> {emotionNodes[0]?.emotion} ({emotionNodes[0]?.count} not)
              </p>
              <p>
                • <strong>Sinaptik bağlantılar:</strong> {connections.length} duygusal köprü
              </p>
              <p>
                • <strong>Duygusal ağ yoğunluğu:</strong> {
                  connections.length > emotionNodes.length ? 'Yüksek' : 
                  connections.length > emotionNodes.length / 2 ? 'Orta' : 'Düşük'
                }
              </p>
              <p>
                • <strong>En güçlü bağlantı:</strong> {
                  connections.length > 0 
                    ? `${connections[0]?.from.emotion} ↔ ${connections[0]?.to.emotion}`
                    : 'Henüz yok'
                }
              </p>
            </div>
            
            {/* Neural activity indicator */}
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-600 dark:text-blue-400">🧠 Nöral Aktivite</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < Math.min(emotionNodes.length / 2, 5) 
                          ? 'bg-blue-500 dark:bg-blue-400 animate-pulse' 
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
