import React, { useCallback, useState, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';

const generateId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Client' },
    position: { x: 50, y: 25 },
  },
];

const initialEdges = [];

export default function SystemDesignSolvePage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [markdownNotes, setMarkdownNotes] = useState('');
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) => addEdge({ ...params, id: generateId(), type: 'default' }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (!type) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: generateId(),
        type: 'default',
        position,
        data: { label: type },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const getNodeColor = (node) => {
    const label = node?.data?.label?.toLowerCase() || '';
    if (label.includes('api gateway')) return '#3b82f6';
    if (label.includes('load balancer')) return '#8b5cf6';
    if (label.includes('database')) return '#10b981';
    if (label.includes('cache')) return '#f59e0b';
    if (label.includes('message queue')) return '#ef4444';
    if (label.includes('microservice')) return '#0ea5e9';
    if (label.includes('client')) return '#6366f1';
    return '#9ca3af';
  };

  const components = [
    {
      name: 'API Gateway',
      icon: '🌐',
      color: 'blue',
      desc: 'Entry point for API requests',
    },
    {
      name: 'Load Balancer',
      icon: '⚖️',
      color: 'purple',
      desc: 'Distributes incoming requests',
    },
    {
      name: 'Database',
      icon: '🗄️',
      color: 'green',
      desc: 'Data storage and retrieval',
    },
    {
      name: 'Redis Cache',
      icon: '⚡',
      color: 'yellow',
      desc: 'Fast data access layer',
    },
    {
      name: 'Message Queue',
      icon: '📨',
      color: 'red',
      desc: 'Asynchronous communication',
    },
    {
      name: 'Microservice',
      icon: '🔧',
      color: 'sky',
      desc: 'Independent service component',
    },
    {
      name: 'CDN',
      icon: '🌍',
      color: 'indigo',
      desc: 'Content delivery network',
    },
    {
      name: 'Search Engine',
      icon: '🔍',
      color: 'pink',
      desc: 'Full-text search capability',
    },
  ];

  return (
    <div className="h-screen w-full flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-1/4 p-4 bg-gray-900 text-white space-y-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Components</h2>
        <p className="text-sm text-gray-400 mb-4">Drag and drop components to the canvas</p>

        <div className="flex flex-col space-y-2">
          {components.map((comp) => (
            <div
              key={comp.name}
              className={`bg-${comp.color}-600 hover:bg-${comp.color}-700 px-3 py-3 rounded text-left cursor-move transition-colors border-2 border-transparent hover:border-${comp.color}-400`}
              draggable
              onDragStart={(e) => onDragStart(e, comp.name)}
            >
              <div className="flex items-center">
                <span className="mr-2">{comp.icon}</span>
                <span>{comp.name}</span>
              </div>
              <p className={`text-xs text-${comp.color}-200 mt-1`}>{comp.desc}</p>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-700">
          <h2 className="text-xl font-bold mb-3">Design Explanation</h2>
          <textarea
            value={markdownNotes}
            onChange={(e) => setMarkdownNotes(e.target.value)}
            rows={8}
            className="w-full p-3 rounded text-black bg-white resize-none border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            placeholder="Explain your design decisions, trade-offs, and architecture choices..."
          />
        </div>
      </div>

      {/* Canvas */}
      <div className="w-3/4 h-full" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
          className="bg-white"
        >
          <MiniMap
            nodeColor={getNodeColor}
            nodeStrokeColor="#333"
            nodeStrokeWidth={1}
            maskColor="rgba(0,0,0,0.1)"
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
            }}
          />
          <Controls
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
            }}
          />
          <Background color="#e2e8f0" gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
}
