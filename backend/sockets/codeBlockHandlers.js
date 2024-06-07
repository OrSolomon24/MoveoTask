const { getCodeBlocksCollection, getMentorStudentCollection } = require('../data/database');
const { getRoleForUser, insertMentorStudentRecord } = require('../utils/roleUtils');

let connections = {};

const handleSocketConnection = (socket) => {
    console.log('New client connected');

    socket.on('joinCodeBlock', async ({ codeBlockId }) => {
        console.log(`Client joining code block: ${codeBlockId}`);
        const codeBlocksCollection = getCodeBlocksCollection();
        const mentorStudentCollection = getMentorStudentCollection();

        const { role, existingStudent } = await getRoleForUser(codeBlockId, socket.handshake.address, mentorStudentCollection);

        if (role === 'student' && existingStudent) {
            console.log('Student already exists in the collection');
        } else {
            await insertMentorStudentRecord(codeBlockId, socket.handshake.address, role, mentorStudentCollection);
            console.log('New document inserted into mentorStudent collection');
        }

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

        socket.emit('roleAssigned', role);
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

    socket.on('leaveCodeBlock', async ({ codeBlockId, role }) => {
        const mentorStudentCollection = getMentorStudentCollection();

        if (!mentorStudentCollection) {
            console.error('Mentor student collection is not initialized');
            return;
        }

        const matchingDocuments = await mentorStudentCollection.find({
            blockId: codeBlockId,
            role,
            ip: socket.handshake.address
        }).toArray();
        console.log('Matching documents:', matchingDocuments);

        const deletionResult = await mentorStudentCollection.deleteOne({
            blockId: codeBlockId,
            role,
            ip: socket.handshake.address
        });

        if (deletionResult.deletedCount === 1) {
            console.log(`Client leaving code block: ${codeBlockId} ${role} ${socket.handshake.address}`);
        } else {
            console.error(`Failed to delete document for client leaving code block: ${codeBlockId} ${role} ${socket.handshake.address}`);
            console.log('Deletion result:', deletionResult);
        }
    });

    socket.on('disconnect', async () => {
        console.log('Client disconnected');
        const mentorStudentCollection = getMentorStudentCollection();

        for (const codeBlockId in connections) {
            if (connections[codeBlockId].mentor === socket) {
                connections[codeBlockId].mentor = null;
                await mentorStudentCollection.deleteOne({ blockId: codeBlockId, role: 'mentor', ip: socket.handshake.address });
            } else if (connections[codeBlockId].student === socket) {
                connections[codeBlockId].student = null;
                await mentorStudentCollection.deleteOne({ blockId: codeBlockId, role: 'student', ip: socket.handshake.address });
            }
        }
    });
};

module.exports = { handleSocketConnection };
