import React, { useState, useCallback, useRef } from 'react';
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

const SolutionWorkspace = ({ 
  expertMode = false, 
  onSolutionChange = null,
  initialSolution = null 
}) => {
  // Always use initialNodes if initialSolution is missing or empty
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialSolution?.nodes?.length ? initialSolution.nodes : initialNodes
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialSolution?.edges || initialEdges
  );
  const [markdownNotes, setMarkdownNotes] = useState(
    initialSolution?.notes || ""
  );
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onConnect = useCallback(
    (params) => {
      const newEdges = addEdge({ ...params, id: generateId(), type: 'default' }, edges);
      setEdges(newEdges);
      
      // Notify parent component if in expert mode
      if (expertMode && onSolutionChange) {
        onSolutionChange({
          nodes,
          edges: newEdges,
          notes: markdownNotes
        });
      }
    },
    [setEdges, edges, nodes, markdownNotes, expertMode, onSolutionChange]
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

      const newNodes = nodes.concat(newNode);
      setNodes(newNodes);

      // Notify parent component if in expert mode
      if (expertMode && onSolutionChange) {
        onSolutionChange({
          nodes: newNodes,
          edges,
          notes: markdownNotes
        });
      }
    },
    [reactFlowInstance, setNodes, nodes, edges, markdownNotes, expertMode, onSolutionChange]
  );

  const handleNotesChange = (value) => {
    setMarkdownNotes(value);
    
    // Notify parent component if in expert mode
    if (expertMode && onSolutionChange) {
      onSolutionChange({
        nodes,
        edges,
        notes: value
      });
    }
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

  const clearCanvas = () => {
    setNodes(initialNodes); // Always reset to initialNodes with Client block
    setEdges(initialEdges);
    setMarkdownNotes('');
    if (expertMode && onSolutionChange) {
      onSolutionChange({
        nodes: initialNodes,
        edges: initialEdges,
        notes: ''
      });
    }
  };

  const saveSnapshot = () => {
    const snapshot = {
      nodes,
      edges,
      notes: markdownNotes,
      timestamp: new Date().toISOString()
    };
    
    console.log('Solution snapshot:', snapshot);
    // Here you could save to localStorage or send to API
    alert('Solution saved locally!');
  };

  return (
    <div className="flex-1 flex flex-col ">
      {/* Header */}
      <div className="bg-gray-800/50 px-6 py-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {expertMode ? 'Expert Solution Designer' : 'Solution Workspace'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {expertMode ? 'Create the recommended solution' : 'Design your system architecture'}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={clearCanvas}
              className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-300 px-3 py-2 rounded text-sm transition-colors"
            >
              Clear Canvas
            </button>
            {!expertMode && (
              <button
                onClick={saveSnapshot}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm text-white transition-colors"
              >
                Save Progress
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
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
            className="bg-gray-50"
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

        {/* Notes Panel */}
        <div className="w-80 bg-gray-800/50 border-l border-gray-700/50 flex flex-col">
          <div className="p-4 border-b border-gray-700/50">
            <h3 className="text-sm font-semibold text-white">
              {expertMode ? 'Solution Notes' : 'Design Notes'}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {expertMode 
                ? 'Document the expert solution approach' 
                : 'Document your architecture decisions'
              }
            </p>
          </div>
          <div className="flex-1 p-4">
            <textarea
              value={markdownNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              className="w-full h-full p-3 rounded text-sm bg-gray-700/50 text-white border border-gray-600/50 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-400"
              placeholder={expertMode 
                ? "Expert solution explanation:\n\n• Key architectural decisions\n• Why this approach is optimal\n• Common pitfalls to avoid\n• Performance considerations\n• Scalability factors"
                : "Explain your design decisions...\n\n• Why did you choose this architecture?\n• What are the scalability considerations?\n• How does data flow through the system?\n• What are potential bottlenecks?\n• Trade-offs and alternatives considered?"
              }
            />
          </div>
          
          {expertMode && (
            <div className="p-4 border-t border-gray-700/50">
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                <p className="text-green-300 text-xs">
                  🎯 This solution will be shown to users as the recommended approach with explanations.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolutionWorkspace;