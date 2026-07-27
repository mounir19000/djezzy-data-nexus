import React, { useCallback } from 'react';
import ReactFlow, { Background, Controls, addEdge, useNodesState, useEdgesState } from 'reactflow';
import type { Edge, Node } from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes: Node[] = [
  { id: 'grid', position: { x: 250, y: 50 }, data: { label: 'National Grid' }, type: 'input', style: { background: '#181B22', color: '#e2e2e8', border: '1px solid #334155', borderRadius: '8px', padding: '16px' } },
  { id: 'transformer', position: { x: 250, y: 150 }, data: { label: 'Transformer (TR1)' }, style: { background: '#181B22', color: '#e2e2e8', border: '1px solid #334155', borderRadius: '8px', padding: '16px' } },
  { id: 'ats', position: { x: 250, y: 250 }, data: { label: 'ATS' }, style: { background: '#181B22', color: '#e2e2e8', border: '1px solid #334155', borderRadius: '8px', padding: '16px' } },
  { id: 'generator', position: { x: 50, y: 250 }, data: { label: 'Generator (GEN1)' }, style: { background: '#181B22', color: '#e2e2e8', border: '1px solid #334155', borderRadius: '8px', padding: '16px' } },
  { id: 'ups1', position: { x: 150, y: 350 }, data: { label: 'UPS 1 (Bypass)' }, style: { background: '#93000a', color: '#ffdad6', border: '1px solid #EF4444', borderRadius: '8px', padding: '16px' } },
  { id: 'ups2', position: { x: 350, y: 350 }, data: { label: 'UPS 2 (Active)' }, style: { background: '#181B22', color: '#e2e2e8', border: '1px solid #22C55E', borderRadius: '8px', padding: '16px' } },
  { id: 'panel', position: { x: 250, y: 450 }, data: { label: 'Main Distribution Panel' }, style: { background: '#181B22', color: '#e2e2e8', border: '1px solid #334155', borderRadius: '8px', padding: '16px' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'grid', target: 'transformer', animated: true, style: { stroke: '#ffd200' } },
  { id: 'e2-3', source: 'transformer', target: 'ats', animated: true, style: { stroke: '#ffd200' } },
  { id: 'e4-3', source: 'generator', target: 'ats', animated: false, style: { stroke: '#64748B' } }, // Gen off
  { id: 'e3-5', source: 'ats', target: 'ups1', animated: true, style: { stroke: '#EF4444', strokeWidth: 2 } }, // Bypass warning
  { id: 'e3-6', source: 'ats', target: 'ups2', animated: true, style: { stroke: '#22C55E' } },
  { id: 'e5-7', source: 'ups1', target: 'panel', animated: true, style: { stroke: '#EF4444', strokeWidth: 2 } },
  { id: 'e6-7', source: 'ups2', target: 'panel', animated: true, style: { stroke: '#22C55E' } },
];

const PowerFlowView = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="h-full w-full bg-background rounded-lg border border-border-subtle overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background color="#334155" gap={16} />
        <Controls className="bg-bg-surface border-border-subtle fill-on-surface" />
      </ReactFlow>
    </div>
  );
};

export default PowerFlowView;
