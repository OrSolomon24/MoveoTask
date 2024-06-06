import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const LobbyPage = () => {
    const [codeBlocks, setCodeBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/api/codeBlocks')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setCodeBlocks(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                setError(error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div>
            <h1>Choose code block</h1>
            <ul>
                {codeBlocks.map(block => (
                    <li key={block.id}>
                        <Link to={`/codeBlock/${block.id}`}>{block.title}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LobbyPage;
