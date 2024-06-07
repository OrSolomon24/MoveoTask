const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();
const { connectToDatabase, getCodeBlocksCollection } = require('./data/database');
const codeBlocksRoutes = require('./routes/codeBlockRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());

let connections = {};

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinCodeBlock', async ({ codeBlockId, role }) => {
        const codeBlocksCollection = getCodeBlocksCollection();

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
            const codeBlock = await codeBlocksCollection.findOne({ id: parseInt(codeBlockId) });
            socket.emit('codeUpdate', codeBlock.code);
        }
    });

    socket.on('codeChange', async ({ codeBlockId, newCode }) => {
        const codeBlocksCollection = getCodeBlocksCollection();
        const codeBlock = await codeBlocksCollection.findOne({ id: parseInt(codeBlockId) });
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

app.use('/api/codeBlocks', codeBlocksRoutes);

const startServer = async () => {
    await connectToDatabase();

    server.listen(5000, () => {
        console.log('Server is running on port 5000');
    });
};

startServer();
