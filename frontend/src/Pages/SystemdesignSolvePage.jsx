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
  const [markdownNotes, setMarkdownNotes] = useState("");
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

      // Check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

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

  // Custom color logic for MiniMap
  const getNodeColor = (node) => {
    const label = node?.data?.label?.toLowerCase() || '';
    if (label.includes('api gateway')) return '#3b82f6';       // blue
    if (label.includes('load balancer')) return '#8b5cf6';     // purple
    if (label.includes('database')) return '#10b981';          // green
    if (label.includes('cache')) return '#f59e0b';             // amber
    if (label.includes('message queue')) return '#ef4444';     // red
    if (label.includes('microservice')) return '#0ea5e9';      // sky blue
    if (label.includes('client')) return '#6366f1';            // indigo
    return '#9ca3af'; // gray default
  };

  return (
    <div className="h-screen w-full flex ">
      
      {/* Sidebar */}
      <div className="w-1/4 p-4 bg-gray-900 text-white space-y-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Components</h2>
        <p className="text-sm text-gray-400 mb-4">Drag and drop components to the canvas</p>
        
        <div className="flex flex-col space-y-2">
          <div 
            className="bg-blue-600 hover:bg-blue-700 px-3 py-3 rounded text-left cursor-move transition-colors border-2 border-transparent hover:border-blue-400"
            draggable
            onDragStart={(event) => onDragStart(event, 'API Gateway')}
          >
            <div className="flex items-center">
              <span className="mr-2">🌐</span>
              <span>API Gateway</span>
            </div>
            <p className="text-xs text-blue-200 mt-1">Entry point for API requests</p>
          </div>
          
          <div 
            className="bg-purple-600 hover:bg-purple-700 px-3 py-3 rounded text-left cursor-move transition-colors border-2 border-transparent hover:border-purple-400"
            draggable
            onDragStart={(event) => onDragStart(event, 'Load Balancer')}
          >
            <div className="flex items-center">
              <span className="mr-2">⚖️</span>
              <span>Load Balancer</span>
            </div>
            <p className="text-xs text-purple-200 mt-1">Distributes incoming requests</p>
          </div>
          
          <div 
            className="bg-green-600 hover:bg-green-700 px-3 py-3 rounded text-left cursor-move transition-colors border-2 border-transparent hover:border-green-400"
            draggable
            onDragStart={(event) => onDragStart(event, 'Database')}
          >
            <div className="flex items-center">
              <span className="mr-2">🗄️</span>
              <span>Database</span>
            </div>
            <p className="text-xs text-green-200 mt-1">Data storage and retrieval</p>
          </div>
          
          <div 
            className="bg-yellow-600 hover:bg-yellow-700 px-3 py-3 rounded text-left cursor-move transition-colors border-2 border-transparent hover:border-yellow-400"
            draggable
            onDragStart={(event) => onDragStart(event, 'Redis Cache')}
          >
            <div className="flex items-center">
              <span className="mr-2">⚡</span>
              <span>Cache</span>
            </div>
            <p className="text-xs text-yellow-200 mt-1">Fast data access layer</p>
          </div>
          
          <div 
            className="bg-red-600 hover:bg-red-700 px-3 py-3 rounded text-left cursor-move transition-colors border-2 border-transparent hover:border-red-400"
            draggable
            onDragStart={(event) => onDragStart(event, 'Message Queue')}
          >
            <div className="flex items-center">
              <span className="mr-2">📨</span>
              <span>Message Queue</span>
            </div>
            <p className="text-xs text-red-200 mt-1">Asynchronous communication</p>
          </div>
          
          <div 
            className="bg-sky-600 hover:bg-sky-700 px-3 py-3 rounded text-left cursor-move transition-colors border-2 border-transparent hover:border-sky-400"
            draggable
            onDragStart={(event) => onDragStart(event, 'Microservice')}
          >
            <div className="flex items-center">
              <span className="mr-2">🔧</span>
              <span>Microservice</span>
            </div>
            <p className="text-xs text-sky-200 mt-1">Independent service component</p>
          </div>
          
          <div 
            className="bg-indigo-600 hover:bg-indigo-700 px-3 py-3 rounded text-left cursor-move transition-colors border-2 border-transparent hover:border-indigo-400"
            draggable
            onDragStart={(event) => onDragStart(event, 'CDN')}
          >
            <div className="flex items-center">
              <span className="mr-2">🌍</span>
              <span>CDN</span>
            </div>
            <p className="text-xs text-indigo-200 mt-1">Content delivery network</p>
          </div>
          
          <div 
            className="bg-pink-600 hover:bg-pink-700 px-3 py-3 rounded text-left cursor-move transition-colors border-2 border-transparent hover:border-pink-400"
            draggable
            onDragStart={(event) => onDragStart(event, 'Search Engine')}
          >
            <div className="flex items-center">
              <span className="mr-2">🔍</span>
              <span>Search Engine</span>
            </div>
            <p className="text-xs text-pink-200 mt-1">Full-text search capability</p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <h2 className="text-xl font-bold mb-3">Design Explanation</h2>
          <textarea
            value={markdownNotes}
            onChange={(e) => setMarkdownNotes(e.target.value)}
            rows={8}
            className="w-full p-3 rounded text-black bg-white resize-none border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            placeholder="Explain your design decisions, trade-offs, and architecture choices...

Example:
- Why did you choose this architecture?
- What are the scalability considerations?
- How does data flow through the system?
- What are potential bottlenecks?"
          />
        </div>
      </div>

      {/* Diagram Canvas */}
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
          className=""
        >
          <MiniMap 
            nodeColor={getNodeColor}
            nodeStrokeColor="#333"
            nodeStrokeWidth={1}
            maskColor="rgba(0,0,0,0.1)"
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '4px'
            }}
          />
          <Controls 
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '4px'
            }}
          />
          <Background color="#e2e8f0" gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
}