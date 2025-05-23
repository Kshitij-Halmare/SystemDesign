import React, { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import { FaTag, FaListUl, FaLightbulb } from 'react-icons/fa';
import './editorjs.css';

function ProblemInput() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'medium',
        hints: ''
    });

    const editorRef = useRef(null);
    const isInitialized = useRef(false);

    useEffect(() => {
        if (!isInitialized.current) {
            const initializeEditor = async () => {
                try {
                    const editor = new EditorJS({
                        holder: 'editorjs',
                        onChange: async () => {
                            try {
                                const content = await editor.save();
                                setFormData(prev => ({
                                    ...prev,
                                    description: JSON.stringify(content)
                                }));
                            } catch (error) {
                                console.error('Error saving editor content:', error);
                            }
                        },
                        tools: {
                            header: {
                                class: Header,
                                inlineToolbar: false,
                                config: {
                                    placeholder: 'Enter a header',
                                    levels: [2, 3, 4],
                                    defaultLevel: 3
                                }
                            },
                            list: {
                                class: List,
                                inlineToolbar: false,
                            },
                            paragraph: {
                                class: Paragraph,
                                inlineToolbar: false,
                            }
                        },
                        inlineToolbar: false,
                        data: formData.description ? JSON.parse(formData.description) : { blocks: [] },
                        placeholder: 'Describe the problem in detail...',
                        autofocus: true,
                        minHeight: 250,
                    });

                    await editor.isReady;
                    editorRef.current = editor;
                    isInitialized.current = true;
                } catch (error) {
                    console.error('Editor initialization error:', error);
                }
            };

            initializeEditor();
        }

        return () => {
            if (editorRef.current && typeof editorRef.current.destroy === 'function') {
                const maybePromise = editorRef.current.destroy();
                if (maybePromise && typeof maybePromise.then === 'function') {
                    maybePromise.then(() => {
                        editorRef.current = null;
                        isInitialized.current = false;
                    }).catch(error => console.error('Editor cleanup error:', error));
                } else {
                    // fallback if destroy() doesn't return a promise
                    editorRef.current = null;
                    isInitialized.current = false;
                }
            }
        };

    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
    };

    return (
        <div className="text-white px-6 py-5 max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold py-6">Add Problem</h1>
            <form onSubmit={handleSubmit} className="space-y-6">

                <div className="space-y-2 relative">
                    <label htmlFor="title" className="block font-medium text-gray-300">
                        Title
                    </label>
                    <div className='flex items-center '>
                        <FaTag className="text-gray-100 absolute left-4" />
                        <input
                            type="text"
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full pl-10 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="Problem title"
                            required
                        />
                    </div>
                </div>

                {/* Description - no icon because it’s EditorJS */}
                <div className="space-y-2">
                    <label className="block font-medium text-gray-300">
                        Description
                    </label>
                    <div
                        id="editorjs"
                        className="editorjs-container"
                    ></div>
                </div>

                {/* Difficulty with icon */}
                <div className="space-y-2 relative">
                    <label htmlFor="difficulty" className="block font-medium text-gray-300">
                        Difficulty
                    </label>
                    <div className='flex itesm-center '>
                        <FaListUl className="text-white absolute left-4 my-4" />
                        <select
                            id="difficulty"
                            value={formData.difficulty}
                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                            className="w-full pl-10 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            required
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                </div>

                {/* Hints with icon */}
                <div className="space-y-2 relative">
                    <label htmlFor="hints" className="block font-medium text-gray-300">
                        Hints
                    </label>
                    <div className='flex items-center'>
                        <FaLightbulb className="absolute left-4  text-white " />
                        <input
                            type="text"
                            id="hints"
                            value={formData.hints}
                            onChange={(e) => setFormData({ ...formData, hints: e.target.value })}
                            className="w-full pl-10 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="Hint"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors w-full sm:w-auto"
                >
                    Submit Problem
                </button>
            </form>
        </div>
    );
}

export default ProblemInput;
