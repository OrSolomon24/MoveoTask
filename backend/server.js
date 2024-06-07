const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();
const { connectToDatabase } = require('./data/database');
const codeBlocksRoutes = require('./routes/codeBlockRoutes');
const { handleSocketConnection } = require('./sockets/codeBlockHandlers');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());

io.on('connection', handleSocketConnection);

app.use('/api/codeBlocks', codeBlocksRoutes);

const startServer = async () => {
    await connectToDatabase();

    server.listen(5000, () => {
        console.log('Server is running on port 5000');
    });
};

startServer();
