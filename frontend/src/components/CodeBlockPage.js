import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Highlight from 'react-highlight';

const socket = io.connect('/');

const CodeBlockPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [codeBlock, setCodeBlock] = useState(null);
    const [role, setRole] = useState('mentor');
    const [code, setCode] = useState('');
    const [showSmiley, setShowSmiley] = useState(false);
    const textAreaRef = useRef(null);

    useEffect(() => {
        fetch(`/api/codeBlocks/${id}`)
            .then(response => response.json())
            .then(data => {
                setCodeBlock(data);
                setCode(data.code);
            });

        socket.emit('joinCodeBlock', { codeBlockId: id, role });

        socket.on('codeUpdate', newCode => {
            setCode(newCode);
        });

        socket.on('solutionMatched', () => {
            setShowSmiley(true);
        });

        socket.on('roleAssigned', (assignedRole) => {
            setRole(assignedRole);
        });
        return () => {
            socket.off('codeUpdate');
            socket.off('solutionMatched');
            socket.off('roleAssigned');
            socket.emit('leaveCodeBlock', { codeBlockId: id, role });
        };
    }, [id,role]);

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
                        {role === 'mentor' ? (
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

            <button onClick={() => setRole(role === 'mentor' ? 'student' : 'mentor')}>
                Switch to {role === 'mentor' ? 'student' : 'mentor'}
            </button>
            <button onClick={() => navigate('/')}>Return to Lobby</button>
        </div>
    );
};

export default CodeBlockPage;
