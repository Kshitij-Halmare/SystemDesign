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
  const [showSolution, setShowSolution] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
        console.log('Fetched problem data:', result);
        
        // The backend returns { data: problemObject }, not { data: [problemObject] }
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

  const handleSubmitSolution = () => {
    setIsSubmitted(true);
    setShowSolution(true);
  };

  const resetWorkspace = () => {
    setIsSubmitted(false);
    setShowSolution(false);
    setNodes(initialNodes);
    setEdges(initialEdges);
    setMarkdownNotes("");
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

  // Fixed: Check for data directly, not data[0]
  if (!data) {
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

  // Fixed: Use data directly, not data[0]
  const problem = data;

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
        <div className="bg-gray-800/50 px-6 py-4 border-b border-gray-700/50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {showSolution ? 'Solution Comparison' : 'Solution Workspace'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {showSolution ? 'Your solution vs Expert solution' : 'Design your system architecture'}
            </p>
          </div>
          <div className="flex gap-3">
            {showSolution && (
              <button
                onClick={resetWorkspace}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
              >
                Try Again
              </button>
            )}
            {!isSubmitted && (
              <button
                onClick={handleSubmitSolution}
                disabled={nodes.length <= 1}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                  nodes.length <= 1 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Submit Solution
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex">
          {!showSolution ? (
            <>
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
            </>
          ) : (
            /* Solution Comparison View */
            <div className="flex-1 flex">
              {/* Your Solution */}
              <div className="flex-1 flex flex-col">
                <div className="bg-blue-600/20 border-b border-blue-500/30 p-3">
                  <h3 className="text-sm font-semibold text-blue-300">Your Solution</h3>
                </div>
                <div className="flex-1 bg-gray-50">
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    elementsSelectable={false}
                    fitView
                    className="bg-gray-50"
                  >
                    <Background color="#e2e8f0" gap={16} />
                  </ReactFlow>
                </div>
                <div className="p-3 bg-gray-800/30 border-t border-gray-700/50">
                  <h4 className="text-xs font-semibold text-gray-300 mb-2">Your Notes:</h4>
                  <div className="bg-gray-700/30 rounded p-2 max-h-32 overflow-y-auto">
                    <p className="text-xs text-gray-300 whitespace-pre-wrap">
                      {markdownNotes || "No notes provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="w-px bg-gray-700"></div>

              {/* Expert Solution */}
              <div className="flex-1 flex flex-col">
                <div className="bg-green-600/20 border-b border-green-500/30 p-3">
                  <h3 className="text-sm font-semibold text-green-300">Expert Solution</h3>
                  <p className="text-xs text-green-200 mt-1">
                    Status: {problem.hasSolution ? 'Available' : 'Not Available'}
                  </p>
                </div>
                <div className="flex-1">
                  {/* Check if expert has visual solution */}
                  {problem.solutionWorkspace?.nodes && problem.solutionWorkspace.nodes.length > 0 ? (
                    <div className="h-full bg-gray-50">
                      <ReactFlow
                        nodes={problem.solutionWorkspace.nodes.map(node => ({
                          ...node,
                          id: node.id || generateId(),
                          position: node.position || { x: 100, y: 100 },
                          data: { label: node.label || node.data?.label || 'Component' }
                        }))}
                        edges={problem.solutionWorkspace.edges || []}
                        nodesDraggable={false}
                        nodesConnectable={false}
                        elementsSelectable={false}
                        fitView
                        className="bg-gray-50"
                      >
                        <Background color="#e2e8f0" gap={16} />
                      </ReactFlow>
                    </div>
                  ) : (
                    /* Written Solution Display */
                    <div className="h-full p-4 overflow-y-auto">
                      <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30 h-full">
                        <h4 className="text-sm font-semibold text-gray-300 mb-3">Expert Written Solution</h4>
                        {problem.writtenSolution ? (
                          <div className="prose prose-invert prose-sm max-w-none">
                            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                              {problem.writtenSolution}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-32 text-gray-500">
                            <div className="text-center">
                              <div className="text-2xl mb-2">📝</div>
                              <p className="text-sm">No expert solution available yet</p>
                              <p className="text-xs mt-1">This problem hasn't been solved by an expert</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Expert Notes Section */}
                {(problem.solutionWorkspace?.notes || problem.writtenSolution) && (
                  <div className="p-3 bg-gray-800/30 border-t border-gray-700/50">
                    <h4 className="text-xs font-semibold text-gray-300 mb-2">Additional Notes:</h4>
                    <div className="bg-gray-700/30 rounded p-2 max-h-24 overflow-y-auto">
                      <p className="text-xs text-gray-300 whitespace-pre-wrap">
                        {problem.solutionWorkspace?.notes || "See written solution above"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Solution Analysis Footer */}
        {showSolution && (
          <div className="bg-gray-800/50 border-t border-gray-700/50 p-4">
            <div className="max-w-6xl mx-auto">
              <h3 className="text-sm font-semibold text-white mb-3">Solution Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-300 mb-1">Your Design</h4>
                  <p className="text-gray-300">
                    Components: {nodes.length - 1}
                  </p>
                  <p className="text-gray-300">
                    Connections: {edges.length}
                  </p>
                  <p className="text-gray-300">
                    Notes: {markdownNotes ? 'Provided' : 'None'}
                  </p>
                </div>
                <div className="bg-green-600/10 border border-green-500/20 rounded-lg p-3">
                  <h4 className="font-semibold text-green-300 mb-1">Expert Design</h4>
                  <p className="text-gray-300">
                    Visual: {(problem.solutionWorkspace?.nodes?.length > 0) ? 'Available' : 'Text Only'}
                  </p>
                  <p className="text-gray-300">
                    Written: {problem.writtenSolution ? 'Available' : 'None'}
                  </p>
                  <p className="text-gray-300">
                    Status: {problem.hasSolution ? 'Complete' : 'Pending'}
                  </p>
                </div>
                <div className="bg-purple-600/10 border border-purple-500/20 rounded-lg p-3">
                  <h4 className="font-semibold text-purple-300 mb-1">Approach</h4>
                  <p className="text-gray-300">
                    {problem.solutionWorkspace?.nodes?.length > 0 ? 'Visual + Text' : 'Text-based'}
                  </p>
                </div>
                <div className="bg-yellow-600/10 border border-yellow-500/20 rounded-lg p-3">
                  <h4 className="font-semibold text-yellow-300 mb-1">Learning</h4>
                  <p className="text-gray-300">
                    Compare architectures and reasoning
                  </p>
                </div>
              </div>

              {/* Written Solution Section */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-white mb-2">Expert Written Solution</h4>
                <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                  {problem.writtenSolution ? (
                    <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                      {problem.writtenSolution}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-sm">No written solution available for this problem.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProblemSolving;