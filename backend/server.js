// /backend/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const codeBlocks = require('./data/codeBlocks');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());

let connections = {};

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinCodeBlock', ({ codeBlockId, role }) => {
        if (!connections[codeBlockId]) {
            connections[codeBlockId] = { mentor: null, student: null };
        }

        if (role === 'mentor') {
            connections[codeBlockId].mentor = socket;
        } else if (role === 'student') {
            connections[codeBlockId].student = socket;
        }

        socket.join(codeBlockId);

        if (role === 'student' && connections[codeBlockId].mentor) {
            socket.emit('codeUpdate', codeBlocks.find(block => block.id == codeBlockId).code);
        }
    });

    socket.on('codeChange', ({ codeBlockId, newCode }) => {
        const codeBlock = codeBlocks.find(block => block.id == codeBlockId);
        codeBlock.code = newCode;

        if (connections[codeBlockId].mentor) {
            connections[codeBlockId].mentor.emit('codeUpdate', newCode);
        }

        if (newCode === codeBlock.solution) {
            socket.emit('solutionMatched');
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        for (const codeBlockId in connections) {
            if (connections[codeBlockId].mentor === socket) {
                connections[codeBlockId].mentor = null;
            } else if (connections[codeBlockId].student === socket) {
                connections[codeBlockId].student = null;
            }
        }
    });
});

app.get('/api/codeBlocks', (req, res) => {
    res.json(codeBlocks.map(block => ({ id: block.id, title: block.title })));
});

app.get('/api/codeBlocks/:id', (req, res) => {
    const codeBlock = codeBlocks.find(block => block.id == req.params.id);
    if (codeBlock) {
        res.json(codeBlock);
    } else {
        res.status(404).send('Code block not found');
    }
});

server.listen(5000, () => {
    console.log('Server is running on port 5000');
});
