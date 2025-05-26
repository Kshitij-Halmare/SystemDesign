import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
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

function ProblemSolving() {
  const { problemId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('description');

  // ReactFlow states
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [markdownNotes, setMarkdownNotes] = useState("");
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/api/problem/getSpecificProblem`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ problemId }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch problem data');
        }

        const result = await response.json();
        setData(result.data);
      } catch (error) {
        console.error("Error fetching problem:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (problemId) {
      fetchData();
    }
  }, [problemId]);

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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center bg-red-900/20 border border-red-500/30 rounded-lg p-8 max-w-md">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Problem</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data || !data[0]) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold mb-2">Problem Not Found</h2>
          <p className="text-gray-400">The requested problem could not be found.</p>
        </div>
      </div>
    );
  }

  const problem = data[0];

  const components = [
    { name: 'API Gateway', icon: '🌐', color: 'blue', desc: 'Entry point for API requests' },
    { name: 'Load Balancer', icon: '⚖️', color: 'purple', desc: 'Distributes incoming requests' },
    { name: 'Database', icon: '🗄️', color: 'green', desc: 'Data storage and retrieval' },
    { name: 'Redis Cache', icon: '⚡', color: 'yellow', desc: 'Fast data access layer' },
    { name: 'Message Queue', icon: '📨', color: 'red', desc: 'Asynchronous communication' },
    { name: 'Microservice', icon: '🔧', color: 'sky', desc: 'Independent service component' },
    { name: 'CDN', icon: '🌍', color: 'indigo', desc: 'Content delivery network' },
    { name: 'Search Engine', icon: '🔍', color: 'pink', desc: 'Full-text search capability' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Left Sidebar - Problem Details */}
      <div className="w-80 bg-gray-800/50 border-r border-gray-700/50 flex flex-col">
        {/* Problem Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-lg font-bold text-white leading-tight pr-2">
              {problem.title}
            </h1>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
              <span>{problem.views || 0} views</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
              <span>{problem.likes || 0} likes</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700/50">
          <button
            onClick={() => setActiveTab('description')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'description'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/5'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('components')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'components'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/5'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Components
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'description' ? (
            <div className="p-4 space-y-4">
              {/* Tags */}
              {problem.tags && problem.tags.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-300 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {problem.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs border border-blue-600/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-xs font-semibold text-gray-300 mb-2">Description</h3>
                <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/30">
                  <p className="text-gray-200 text-sm leading-relaxed">
                    {problem.description?.blocks?.[0]?.data?.text || 'No description available'}
                  </p>
                </div>
              </div>

              {/* Hints */}
              {problem.hints && problem.hints.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-300 mb-2">Hints</h3>
                  <div className="space-y-2">
                    {problem.hints.map((hint, index) => (
                      <div
                        key={index}
                        className="bg-yellow-600/10 border border-yellow-600/20 rounded-lg p-2 flex items-start gap-2"
                      >
                        <span className="text-yellow-400 font-bold text-xs mt-0.5 flex-shrink-0">
                          {index + 1}.
                        </span>
                        <p className="text-gray-200 text-xs leading-relaxed">
                          {hint}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Images */}
              {problem.images && problem.images.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-300 mb-2">Diagrams</h3>
                  <div className="space-y-2">
                    {problem.images.map((image, index) => (
                      <div
                        key={index}
                        className="bg-gray-700/30 rounded-lg p-2 border border-gray-600/30"
                      >
                        <div className="relative group">
                          <img 
                            src={image.url} 
                            alt={image.originalName || `Diagram ${index + 1}`}
                            className="w-full h-auto rounded border border-gray-600/50 transition-transform duration-200 group-hover:scale-[1.02]"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="hidden aspect-video bg-gray-600/30 rounded items-center justify-center">
                            <span className="text-gray-400 text-xs">Failed to load image</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4">
              <p className="text-xs text-gray-400 mb-4">Drag components to the canvas</p>
              <div className="space-y-2">
                {components.map((component, index) => (
                  <div 
                    key={index}
                    className={`bg-${component.color}-600 hover:bg-${component.color}-700 px-3 py-2 rounded text-left cursor-move transition-colors border-2 border-transparent hover:border-${component.color}-400`}
                    draggable
                    onDragStart={(event) => onDragStart(event, component.name)}
                  >
                    <div className="flex items-center">
                      <span className="mr-2 text-sm">{component.icon}</span>
                      <span className="text-sm font-medium">{component.name}</span>
                    </div>
                    <p className={`text-xs text-${component.color}-200 mt-1`}>{component.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800/50 px-6 py-4 border-b border-gray-700/50">
          <h2 className="text-lg font-semibold text-white">Solution Workspace</h2>
          <p className="text-sm text-gray-400 mt-1">Design your system architecture</p>
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
              <h3 className="text-sm font-semibold text-white">Design Notes</h3>
              <p className="text-xs text-gray-400 mt-1">Document your architecture decisions</p>
            </div>
            <div className="flex-1 p-4">
              <textarea
                value={markdownNotes}
                onChange={(e) => setMarkdownNotes(e.target.value)}
                className="w-full h-full p-3 rounded text-sm bg-gray-700/50 text-white border border-gray-600/50 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-400"
                placeholder="Explain your design decisions...

• Why did you choose this architecture?
• What are the scalability considerations?
• How does data flow through the system?
• What are potential bottlenecks?
• Trade-offs and alternatives considered?"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProblemSolving;