import React, { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import { FaTag, FaListUl, FaLightbulb, FaImage, FaTimes, FaCode } from 'react-icons/fa';
import './editorjs.css';
import { useAuth } from '../../Authentication/Authentication';
import { useProblemStore } from '../Components/ProblemInputStore';
import toast from 'react-hot-toast';
import SolutionWorkspace from './SolutionWorkSpace.jsx';
import ProblemDisplay from './ProblemDisplay.jsx';

function ProblemInput() {
    const { user, token } = useAuth();
    const { tags, setTags, images, setImages, hints, setHints } = useProblemStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [solutionData, setSolutionData] = useState({
        nodes: [],
        edges: [],
        notes: ''
    });
    const [writtenAnswer, setWrittenAnswer] = useState('');
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'medium',
        hints: [], // Changed to array
        userId: '',
        images: [], // Ensure it's array
        tags: [], // Ensure it's array
        views: 0,
        likes: 0,
        reviewed: false,
        // New fields for solution
        solutionWorkspace: null,
        writtenSolution: ''
    });

    const editorRef = useRef(null);
    const isInitialized = useRef(false);

    useEffect(() => {
        if (!isInitialized.current) {
            const editor = new EditorJS({
                holder: 'editorjs',
                onChange: async () => {
                    const content = await editor.save();
                    const description = JSON.stringify(content);
                    setFormData(prev => ({
                        ...prev,
                        description // Update description in real-time
                    }));
                },
                tools: {
                    header: {
                        class: Header,
                        inlineToolbar: true,
                        config: {
                            placeholder: 'Enter a header',
                            levels: [2, 3, 4],
                            defaultLevel: 3
                        }
                    },
                    list: { class: List, inlineToolbar: true },
                    paragraph: { class: Paragraph, inlineToolbar: true }
                },
                data: formData.description ? JSON.parse(formData.description) : { blocks: [] },
                placeholder: 'Describe the problem in detail...',
                autofocus: true,
                minHeight: 250,
            });

            editorRef.current = editor;
            isInitialized.current = true;
        }

        return () => {
            if (editorRef.current?.destroy) {
                editorRef.current.destroy();
                editorRef.current = null;
                isInitialized.current = false;
            }
        };
    }, [formData.description]); // Ensure the effect runs when description changes

    const handleInputTags = (e) => {
        const value = e.target.value.trim();
        if (value && !tags.includes(value)) {
            if (tags.length >= 5) {
                toast.error("Only 5 tags are allowed");
            } else {
                const updatedTags = [...tags, value];
                setTags(updatedTags);
                setFormData(prev => ({ ...prev, tags: updatedTags }));
            }
        }
    };

    const removeTag = (tagToRemove) => {
        const updatedTags = tags.filter(tag => tag !== tagToRemove);
        setTags(updatedTags);
        setFormData(prev => ({ ...prev, tags: updatedTags }));
    };

    const handleHintChange = (e) => {
        const value = e.target.value.trim();
        if (value && !hints.includes(value)) {
            if (hints.length >= 3) {
                toast.error("Only 3 hints are allowed");
            } else {
                const updatedHints = [...hints, value];
                setHints(updatedHints);
                setFormData(prev => ({ ...prev, hints: updatedHints }));
            }
        }
    };

    const removeHint = (hintToRemove) => {
        const updatedHints = hints.filter(hint => hint !== hintToRemove);
        setHints(updatedHints);
        setFormData(prev => ({ ...prev, hints: updatedHints }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);

        if (images.length + files.length > 5) {
            toast.error("Only 5 images are allowed");
            return;
        }

        files.forEach(file => {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not a valid image file`);
                return;
            }

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} is too large. Maximum size is 5MB`);
                return;
            }

            // Create a file object with additional metadata
            const imageObject = {
                file: file,
                name: file.name,
                size: file.size,
                type: file.type,
                url: URL.createObjectURL(file), // For preview
                id: Date.now() + Math.random() // Unique identifier
            };

            const updatedImages = [...images, imageObject];
            setImages(updatedImages);
            setFormData(prev => ({ ...prev, images: updatedImages }));
        });

        // Clear the file input
        e.target.value = '';
    };

    const removeImage = (imageToRemove) => {
        // Revoke the object URL to free memory
        if (imageToRemove.url) {
            URL.revokeObjectURL(imageToRemove.url);
        }

        const updatedImages = images.filter(image => image.id !== imageToRemove.id);
        setImages(updatedImages);
        setFormData(prev => ({ ...prev, images: updatedImages }));
    };

    // Handler for solution workspace changes
    const handleSolutionChange = (solution) => {
        setSolutionData(solution);
        setFormData(prev => ({
            ...prev,
            solutionWorkspace: JSON.stringify(solution)
        }));
    };

    // Handler for written answer changes
    const handleWrittenAnswerChange = (e) => {
        const value = e.target.value;
        setWrittenAnswer(value);
        setFormData(prev => ({
            ...prev,
            writtenSolution: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        if (!token || !user) {
            toast.error("User not authenticated");
            setIsSubmitting(false);
            return;
        }

        if (!formData.title || !formData.description || !formData.difficulty || !formData.tags) {
            toast.error("All Fields are required");
            setIsSubmitting(false);
            return;
        }

        // Validate that user has provided some form of solution
        if (!solutionData.nodes.length && !writtenAnswer.trim()) {
            toast.error("Please provide either a solution workspace design or written answer");
            setIsSubmitting(false);
            return;
        }

        // Create FormData for file upload
        const formDataToSend = new FormData();

        // Add basic form fields
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('difficulty', formData.difficulty);
        formDataToSend.append('userId', user.userId);
        formDataToSend.append('views', formData.views);
        formDataToSend.append('likes', formData.likes);
        formDataToSend.append('reviewed', formData.reviewed);

        // Add arrays as JSON strings
        formDataToSend.append('tags', JSON.stringify(tags));
        formDataToSend.append('hints', JSON.stringify(hints));

        // Add solution data
        formDataToSend.append('solutionWorkspace', JSON.stringify(solutionData));
        formDataToSend.append('writtenSolution', writtenAnswer);

        // Add image files
        images.forEach((imageObj, index) => {
            formDataToSend.append('images', imageObj.file);
        });

        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/api/problem/problemInput`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formDataToSend,
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error("Error: " + (errorData.message || "Failed to submit problem"));
                return;
            }

            toast.success("Problem and solution submitted successfully!");

            // Clean up object URLs before resetting
            images.forEach(image => {
                if (image.url) {
                    URL.revokeObjectURL(image.url);
                }
            });

            // Reset form data with proper arrays
            setFormData({
                title: '',
                description: '',
                difficulty: 'medium',
                hints: [],
                tags: [],
                images: [],
                views: 0,
                likes: 0,
                reviewed: false,
                solutionWorkspace: null,
                writtenSolution: ''
            });

            // Reset store arrays and solution data
            setTags([]);
            setHints([]);
            setImages([]);
            setSolutionData({ nodes: [], edges: [], notes: '' });
            setWrittenAnswer('');

            if (editorRef.current?.clear) {
                await editorRef.current.clear();
            }

        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Failed to submit problem. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="text-white px-6 py-5 mx-auto">
            <h1 className="text-2xl font-semibold py-6">Add Problem & Solution</h1>
            <form onSubmit={handleSubmit} className="space-y-6">

                <div className="space-y-2 relative">
                    <label htmlFor="title" className="block font-medium text-gray-300">Title</label>
                    <div className="flex items-center">
                        <FaTag className="text-gray-100 absolute left-4" />
                        <input
                            type="text"
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full pl-10 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white"
                            placeholder="Problem title"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block font-medium text-gray-300">Description</label>
                    <div id="editorjs" className="editorjs-container"></div>
                </div>

                <div className="space-y-2 relative">
                    <label htmlFor="difficulty" className="block font-medium text-gray-300">Difficulty</label>
                    <div className="flex items-center">
                        <FaListUl className="text-white absolute left-4 my-4" />
                        <select
                            id="difficulty"
                            value={formData.difficulty}
                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                            className="w-full pl-10 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white"
                            required
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2 relative">
                    <label htmlFor="hints" className="block font-medium text-gray-300">Hints</label>
                    <div className="flex items-center">
                        <FaLightbulb className="absolute left-4 text-white" />
                        <input
                            type="text"
                            id="hints"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleHintChange(e);
                                    e.target.value = '';
                                }
                            }}
                            className="w-full pl-10 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white"
                            placeholder="Press Enter to add hint"
                        />
                    </div>
                    <p className='text-gray-500 font-semibold px-3'>{`Hints added: ${hints.length}/3`}</p>

                    {/* Display added hints */}
                    {hints.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {hints.map((hint, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-600 text-white"
                                >
                                    {hint}
                                    <button
                                        type="button"
                                        onClick={() => removeHint(hint)}
                                        className="ml-2 text-white hover:text-red-300"
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-2 relative">
                    <label htmlFor="images" className="block font-medium text-gray-300">Images</label>
                    <div className="flex items-center">
                        <FaImage className="absolute left-4 text-white z-10" />
                        <input
                            type="file"
                            id="images"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="w-full pl-10 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                        />
                    </div>
                    <p className='text-gray-500 font-semibold px-3'>{`Images added: ${images.length}/5`}</p>
                    <p className='text-gray-400 text-sm px-3'>Supported formats: JPG, PNG, GIF, WEBP (Max 5MB each)</p>

                    {/* Display added images with previews */}
                    {images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                            {images.map((image, index) => (
                                <div
                                    key={image.id}
                                    className="relative bg-gray-800 rounded-lg p-2 border border-gray-700"
                                >
                                    <img
                                        src={image.url}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <div className="mt-2">
                                        <p className="text-white text-sm truncate">{image.name}</p>
                                        <p className="text-gray-400 text-xs">
                                            {(image.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeImage(image)}
                                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 text-xs"
                                    >
                                        <FaTimes size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-2 relative">
                    <label htmlFor="tags" className="block font-medium text-gray-300">Tags</label>
                    <div className="flex items-center">
                        <FaTag className="absolute left-4 text-white" />
                        <input
                            type="text"
                            id="tags"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleInputTags(e);
                                    e.target.value = '';
                                }
                            }}
                            className="w-full pl-10 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white"
                            placeholder="Press Enter to add tags"
                        />
                    </div>
                    <p className='text-gray-500 font-semibold px-3'>{`Tags added: ${tags.length}/5`}</p>

                    {/* Fallback display if TagsUi is not available */}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-md bg-gray-600 text-white hover:border-1 border-white"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="ml-3 text-white bg-red-500 rounded-full p-1 hover:bg-red-300 hover:text-red-500"
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Written Solution Section */}
                <div className="space-y-2 relative">
                    <label htmlFor="writtenAnswer" className="block font-medium text-gray-300">
                        Written Solution <span className="text-gray-400 text-sm">(Optional)</span>
                    </label>
                    <div className="flex items-start">
                        <FaCode className="absolute left-4 top-4 text-white z-10" />
                        <textarea
                            id="writtenAnswer"
                            value={writtenAnswer}
                            onChange={handleWrittenAnswerChange}
                            rows={6}
                            className="w-full pl-10 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white resize-vertical"
                            placeholder="Provide a detailed written solution, algorithm explanation, code implementation, or step-by-step approach..."
                        />
                    </div>
                    <p className='text-gray-400 text-sm px-3'>
                        Explain your solution approach, algorithms, complexity analysis, etc.
                    </p>
                </div>

            </form>
            
            {/* Solution Design Section */}
            <div className="mt-8 border-t border-gray-700 pt-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-300">
                    Solution Design Workspace
                    <span className="text-gray-400 text-sm ml-2 font-normal">
                        (Design your solution architecture)
                    </span>
                </h2>
                <div className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
                    <div className="pt-4 border-t border-gray-700 flex h-screen">
                        <ProblemDisplay problem={{ ...formData, description: JSON.parse(formData.description || '{}') }} showWorkspace={true} />
                        <SolutionWorkspace 
                            expertMode={false}
                            onSolutionChange={handleSolutionChange}
                            initialSolution={solutionData}
                        />
                    </div>
                </div>
                
                {/* Solution Status Indicator */}
                <div className="mt-4 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-300">
                                Solution Status: 
                                <span className={`ml-2 font-semibold ${
                                    solutionData.nodes.length > 0 || writtenAnswer.trim() 
                                        ? 'text-green-400' 
                                        : 'text-yellow-400'
                                }`}>
                                    {solutionData.nodes.length > 0 || writtenAnswer.trim() 
                                        ? 'Solution Provided' 
                                        : 'No Solution Yet'
                                    }
                                </span>
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {solutionData.nodes.length > 0 && `Workspace: ${solutionData.nodes.length} components`}
                                {solutionData.nodes.length > 0 && writtenAnswer.trim() && ' • '}
                                {writtenAnswer.trim() && `Written: ${writtenAnswer.length} characters`}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400">
                                Provide at least one solution format
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors w-full sm:w-auto"
            >
                {isSubmitting ? 'Submitting Problem & Solution...' : 'Submit Problem & Solution'}
            </button>
        </div>
    );
}

export default ProblemInput;