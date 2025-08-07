import React, { useState } from 'react';

const ProblemDisplay = ({ 
  problem, 
  showWorkspace = true, 
  onSolutionSave = null,
  expertMode = false,
  initialSolution = null 
}) => {
  const [activeTab, setActiveTab] = useState('description');
  const [expertSolution, setExpertSolution] = useState(initialSolution || {
    nodes: [],
    edges: [],
    notes: '',
    explanation: ''
  });

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

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleSaveSolution = () => {
    if (onSolutionSave && expertMode) {
      onSolutionSave(expertSolution);
    }
  };

  return (
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
        {showWorkspace && (
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
        )}
        {expertMode && (
          <button
            onClick={() => setActiveTab('solution')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'solution'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/5'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Expert Solution
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'description' && (
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
        )}

        {activeTab === 'components' && showWorkspace && (
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

        {activeTab === 'solution' && expertMode && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Expert Solution</h3>
              <button
                onClick={handleSaveSolution}
                className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs transition-colors"
              >
                Save Solution
              </button>
            </div>
            
            <div>
              <h4 className="text-xs font-semibold text-gray-300 mb-2">Solution Explanation</h4>
              <textarea
                value={expertSolution.explanation}
                onChange={(e) => setExpertSolution(prev => ({ ...prev, explanation: e.target.value }))}
                className="w-full h-32 p-2 rounded text-sm bg-gray-700/50 text-white border border-gray-600/50 resize-none focus:ring-2 focus:ring-green-500 focus:outline-none placeholder-gray-400"
                placeholder="Explain your expert solution approach, key decisions, and best practices..."
              />
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-300 mb-2">Architecture Notes</h4>
              <textarea
                value={expertSolution.notes}
                onChange={(e) => setExpertSolution(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full h-24 p-2 rounded text-sm bg-gray-700/50 text-white border border-gray-600/50 resize-none focus:ring-2 focus:ring-green-500 focus:outline-none placeholder-gray-400"
                placeholder="Additional technical notes and considerations..."
              />
            </div>

            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
              <p className="text-green-300 text-xs">
                💡 This solution will be saved as the recommended approach for users to learn from.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemDisplay;