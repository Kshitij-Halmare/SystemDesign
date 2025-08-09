import React, { useEffect, useState } from 'react';
import { Search, Code, Clock, Star, ArrowRight, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
function Problems() {
    const [problems, setProblems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('All');
    const navigate=useNavigate();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/api/problem/getProblem`, {
                    method: "GET",
                });
                const data = await response.json();
                console.log(data);
                if (data.success) {
                    console.log(data.data);
                    setProblems(data.data);
                } else {
                    // toast.error(data.message || 'Failed to load problems');
                    console.error(data.message);
                }
            } catch (err) {
                // toast.error(err.message || 'Something went wrong');
                console.error(err.message);
            }
        };

        fetchData();
    }, []);

    const renderDescription = (description) => {
        if (!description?.blocks) return <p className="text-gray-400">No description</p>;
        return description.blocks.map((block, idx) => {
            switch (block.type) {
                case 'paragraph':
                    return <p key={idx} className="text-gray-300 leading-relaxed">{block.data.text}</p>;
                case 'header':
                    const Tag = `h${block.data.level}`;
                    return <Tag key={idx} className="text-white font-semibold mb-2">{block.data.text}</Tag>;
                case 'list':
                    return block.data.style === 'ordered' ? (
                        <ol key={idx} className="list-decimal list-inside text-gray-300 space-y-1">
                            {block.data.items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ol>
                    ) : (
                        <ul key={idx} className="list-disc list-inside text-gray-300 space-y-1">
                            {block.data.items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    );
                default:
                    return <div key={idx} className="text-gray-500">Unsupported block type: {block.type}</div>;
            }
        });
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'medium':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'hard':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getTagColor = (index) => {
        const colors = [
            'bg-blue-500/20 text-blue-400 border-blue-500/30',
            'bg-purple-500/20 text-purple-400 border-purple-500/30',
            'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
            'bg-pink-500/20 text-pink-400 border-pink-500/30',
            'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        ];
        return colors[index % colors.length];
    };

    const handleClick=(index)=>{
        const problemid=problems[index].problemId;
        navigate(`/problemSolve/${problemid}`)
    }

    const filteredProblems = problems.filter(problem => {
        const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            problem.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesDifficulty = selectedDifficulty === 'All' || problem.difficulty === selectedDifficulty;
        return matchesSearch && matchesDifficulty;
    });

    return (
        <div className="min-h-screen text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Code className="w-8 h-8 text-blue-400" />
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            Coding Problems
                        </h1>
                    </div>
                    <p className="text-gray-400 text-lg">
                        Challenge yourself with our curated collection of programming problems
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-8 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search problems by title or tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                    <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                    >
                        <option value="All">All Difficulties</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                <Star className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-green-400 font-semibold">Easy</p>
                                <p className="text-gray-400 text-sm">{problems.filter(p => p.difficulty === 'easy').length} problems</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-yellow-400 font-semibold">Medium</p>
                                <p className="text-gray-400 text-sm">{problems.filter(p => p.difficulty === 'medium').length} problems</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                                <Code className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <p className="text-red-400 font-semibold">Hard</p>
                                <p className="text-gray-400 text-sm">{problems.filter(p => p.difficulty === 'hard').length} problems</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Problems Grid */}
                <div className="grid gap-6">
                    {filteredProblems.map((problem, index) => (
                        <div 
                            key={index} 
                            onClick={()=>handleClick(index)}
                            className="group bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                                {/* Main Content */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors duration-200">
                                                {problem.title}
                                            </h3>
                                            <div className="flex items-center gap-3 mb-3">
                                                {problem.difficulty && (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                                                        {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                                                    </span>
                                                )}
                                                <span className="text-gray-400 text-sm flex items-center gap-1">
                                                    <Star className="w-4 h-4" />
                                                    {problem.views || 0} views
                                                </span>
                                                <span className="text-gray-400 text-sm flex items-center gap-1">
                                                    ❤️ {problem.likes || 0}
                                                </span>
                                                {problem.hintCount > 0 && (
                                                    <span className="text-blue-400 text-sm">
                                                        💡 {problem.hintCount} hints
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-200" />
                                    </div>

                                    {/* Description */}
                                    {/* <div className="mb-4">
                                        {renderDescription(problem.description)}
                                    </div> */}

                                    {/* Tags */}
                                    {problem.tags && problem.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {problem.tags.map((tag, tagIndex) => (
                                                <span 
                                                    key={tagIndex} 
                                                    className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getTagColor(tagIndex)}`}
                                                >
                                                    <Tag className="w-3 h-3" />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProblems.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">No problems found</h3>
                        <p className="text-gray-500">Try adjusting your search terms or filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Problems;