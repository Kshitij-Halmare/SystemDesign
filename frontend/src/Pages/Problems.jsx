import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast'; // Make sure you have this installed

function Problems() {
    const [problems, setProblems] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/api/problem/getProblem`, {
                    method: "GET",
                });
                const data = await response.json();
                if (data.success) {
                    setProblems(data.data);
                } else {
                    toast.error(data.message || 'Failed to load problems');
                }
            } catch (err) {
                toast.error(err.message || 'Something went wrong');
            }
        };

        fetchData();
    }, []);

    const renderDescription = (description) => {
        if (!description?.blocks) return <p>No description</p>;
        return description.blocks.map((block, idx) => {
            switch (block.type) {
                case 'paragraph':
                    return <p key={idx}>{block.data.text}</p>;
                case 'header':
                    const Tag = `h${block.data.level}`;
                    return <Tag key={idx}>{block.data.text}</Tag>;
                case 'list':
                    return block.data.style === 'ordered' ? (
                        <ol key={idx}>
                            {block.data.items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ol>
                    ) : (
                        <ul key={idx}>
                            {block.data.items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    );
                default:
                    return <div key={idx}>Unsupported block type: {block.type}</div>;
            }
        });
    };

    return (
        <div className='text-white'>
            <h2>Problems</h2>
            {problems.map((problem, index) => (
                <div key={index} className="border p-4 mb-4">
                    <h3 className="text-xl font-semibold">{problem.title}</h3>
                    {renderDescription(problem.description)}
                </div>
            ))}
        </div>
    );
}

export default Problems;
