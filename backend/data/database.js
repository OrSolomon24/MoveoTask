const { MongoClient } = require('mongodb');
require('dotenv').config();

let codeBlocksCollection;

const connectToDatabase = async () => {
    const client = new MongoClient(process.env.MONGODB_URI);
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

const getCodeBlocksCollection = () => codeBlocksCollection;

module.exports = {
    connectToDatabase,
    getCodeBlocksCollection
};


// 5YzwR9IOhAUlOgdo orsolomon24