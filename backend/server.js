const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();
const { connectToDatabase, getCodeBlocksCollection, getMentorStudentCollection } = require('./data/database');
const codeBlocksRoutes = require('./routes/codeBlockRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());

let connections = {};

io.on('connection', (socket) => {
    console.log('New client connected');
    
    // When a client joins a code block
    socket.on('joinCodeBlock', async ({ codeBlockId }) => {
        console.log(`Client joining code block: ${codeBlockId}`);
        const codeBlocksCollection = getCodeBlocksCollection();
        const mentorStudentCollection = getMentorStudentCollection();

        let role = 'mentor';
        const existingRecord = await mentorStudentCollection.findOne({ blockId: codeBlockId });
        console.log('Existing record:', existingRecord);

        if (existingRecord) {
            role = 'student';
        }

        console.log(`Role assigned: ${role}`);

        // Insert a new document into the mentorStudent collection
        await mentorStudentCollection.insertOne({
            blockId: codeBlockId,
            ip: socket.handshake.address,
            role: role
        });

        console.log('New document inserted into mentorStudent collection');

        if (!connections[codeBlockId]) {
            connections[codeBlockId] = { mentor: null, student: null };
        }

        if (role === 'mentor') {
            connections[codeBlockId].mentor = socket;
        } else if (role === 'student') {
            connections[codeBlockId].student = socket;
        }

        socket.join(codeBlockId);

        // If student and mentor is already connected, emit code update
        if (role === 'student' && connections[codeBlockId].mentor) {
            const codeBlock = await codeBlocksCollection.findOne({ id: parseInt(codeBlockId) });
            socket.emit('codeUpdate', codeBlock.code);
        }

        socket.emit('roleAssigned', role);  // Notify the client of their role
    });

    // When code is changed by any user
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


// When a client leaves a code block
socket.on('leaveCodeBlock', async ({ codeBlockId, role }) => {
    const mentorStudentCollection = getMentorStudentCollection();
    
    // Check if mentorStudentCollection is properly initialized
    if (!mentorStudentCollection) {
        console.error('Mentor student collection is not initialized');
        return;
    }
    
    // Log documents matching the filter criteria
    const matchingDocuments = await mentorStudentCollection.find({ 
        blockId: codeBlockId, 
        role, 
        ip: socket.handshake.address 
    }).toArray();
    console.log('Matching documents:', matchingDocuments);
    
    // Delete the document from the collection
    const deletionResult = await mentorStudentCollection.deleteOne({ 
        blockId: codeBlockId, 
        role, 
        ip: socket.handshake.address 
    });
    
    // Check if the deletion was successful
    if (deletionResult.deletedCount === 1) {
        console.log(`Client leaving code block: ${codeBlockId} ${role} ${socket.handshake.address}`);
    } else {
        console.error(`Failed to delete document for client leaving code block: ${codeBlockId} ${role} ${socket.handshake.address}`);
        console.log('Deletion result:', deletionResult);
    }
});

    
    // When a client disconnects
    socket.on('disconnect', async () => {
        console.log('Client disconnected');
        const mentorStudentCollection = getMentorStudentCollection();
        for (const codeBlockId in connections) {
            if (connections[codeBlockId].mentor === socket) {
                connections[codeBlockId].mentor = null;
                await mentorStudentCollection.deleteOne({ blockId: codeBlockId, role: 'mentor' });
            } else if (connections[codeBlockId].student === socket) {
                connections[codeBlockId].student = null;
                await mentorStudentCollection.deleteOne({ blockId: codeBlockId, role: 'student' });
            }
        }
    });
});

// Route for code blocks
app.use('/api/codeBlocks', codeBlocksRoutes);

// Start the server
const startServer = async () => {
    await connectToDatabase();

    server.listen(5000, () => {
        console.log('Server is running on port 5000');
    });
};

startServer();