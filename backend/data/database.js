const { MongoClient } = require('mongodb');
require('dotenv').config();

let codeBlocksCollection;
let mentorStudentCollection;

const connectToDatabase = async () => {
    console.log('Starting database connection...');
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db('MoveoTask');
        codeBlocksCollection = db.collection('codeBlocks');
        mentorStudentCollection = db.collection('mentorStudent');
        console.log('Collections initialized');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        await client.close(); 
        console.log('MongoDB client closed due to connection failure');
        process.exit(1);
    }
};

const getCodeBlocksCollection = () => {
    console.log('Retrieving codeBlocks collection');
    return codeBlocksCollection;
};

const getMentorStudentCollection = () => {
    console.log('Retrieving mentorStudent collection');
    return mentorStudentCollection;
};

module.exports = {
    connectToDatabase,
    getCodeBlocksCollection,
    getMentorStudentCollection
};
