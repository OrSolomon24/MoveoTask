const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const sessionMiddleware = require('./middleware/sessionManagement');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);

let codeBlocksCollection;

const connectToDatabase = async () => {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db('MoveoTask');
        codeBlocksCollection = db.collection('codeBlocks');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
};

let connections = {};

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinCodeBlock', async ({ codeBlockId, role }) => {
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

app.get('/api/codeBlocks', async (req, res) => {
    const codeBlocks = await codeBlocksCollection.find().project({ id: 1, title: 1 }).toArray();
    res.json(codeBlocks);
});

app.get('/api/codeBlocks/:id', async (req, res) => {
    const codeBlock = await codeBlocksCollection.findOne({ id: parseInt(req.params.id) });
    if (codeBlock) {
        res.json(codeBlock);
    } else {
        res.status(404).send('Code block not found');
    }
});

const startServer = async () => {
    await connectToDatabase();

    server.listen(5000, () => {
        console.log('Server is running on port 5000');
    });
};

startServer();
