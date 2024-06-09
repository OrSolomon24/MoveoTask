import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserRole } from '../constants';
import io from 'socket.io-client';
import Highlight from 'react-highlight';
import 'highlight.js/styles/default.css';

const host = process.env.REACT_APP_HOST;

const socket = io.connect(`${host}/`);

const CodeBlockPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [codeBlock, setCodeBlock] = useState(null);
    const [role, setRole] = useState(UserRole.MENTOR);
    const [code, setCode] = useState('');
    const [showSmiley, setShowSmiley] = useState(false);
    const textAreaRef = useRef(null);
    const [solution, setSolution] = useState('');
    const [showSolution, setShowSolution] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${host}/api/codeBlocks/${id}`);
                const data = await response.json();
                setCodeBlock(data);
                setCode(data.code);
                setSolution(data.solution);
            } catch (error) {
                console.error('Error fetching code block data:', error);
            }
        };

        fetchData();

        socket.emit('joinCodeBlock', { codeBlockId: id, role });

        const handleCodeUpdate = (newCode) => {
            setCode(newCode);
        };

        const handleSolutionMatched = () => {
            setShowSmiley(true);
        };

        const handleRoleAssigned = (assignedRole) => {
            setRole(assignedRole);
        };

        socket.on('codeUpdate', handleCodeUpdate);
        socket.on('solutionMatched', handleSolutionMatched);
        socket.on('roleAssigned', handleRoleAssigned);

        return () => {
            socket.off('codeUpdate', handleCodeUpdate);
            socket.off('solutionMatched', handleSolutionMatched);
            socket.off('roleAssigned', handleRoleAssigned);
            socket.emit('leaveCodeBlock', { codeBlockId: id, role });
        };
    }, [id, role]);

    const handleCodeChange = (event) => {
        const newCode = event.target.value;
        setCode(newCode);
        socket.emit('codeChange', { codeBlockId: id, newCode });
    };

    return (
        <div>
            <h1>{codeBlock ? codeBlock.title : 'Loading...'}</h1>
            {showSmiley ? (
                <div className='match'>
                    <div className="smiley-container">
                        😊
                    </div>
                    <div className="button-container">
                        <button onClick={() => setShowSmiley(false)}>Return To The Block</button>
                    </div>
                </div>
            ) : (
                <div>
                    {role === UserRole.MENTOR ? (
                        <Highlight className="javascript">{code}</Highlight>
                    ) : (
                        <textarea
                            ref={textAreaRef}
                            value={code}
                            onChange={handleCodeChange}
                            rows={20}
                            cols={80}
                        />
                    )}
                </div>
            )}
            <button onClick={() => navigate('/')}>Return to Lobby</button>
            <button onClick={() => setShowSolution(!showSolution)}>Show/Hide Solution</button>
            {showSolution && (
                <div>
                    <h2>Solution</h2>
                    <Highlight className="javascript">{solution}</Highlight>
                </div>
            )}
        </div>
    );
};

export default CodeBlockPage;
