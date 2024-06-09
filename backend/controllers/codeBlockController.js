const { getCodeBlocksCollection } = require('../data/database');

const getCodeBlocks = async (req, res) => {
    console.log('Received request to get all code blocks');
    try {
        const codeBlocksCollection = getCodeBlocksCollection();
        console.log('Fetching code blocks from the database');
        const codeBlocks = await codeBlocksCollection.find().project({ id: 1, title: 1 }).toArray();
        console.log('Successfully retrieved code blocks:', codeBlocks);
        res.json(codeBlocks);
    } catch (error) {
        console.error('Error retrieving code blocks:', error);
        res.status(500).send('Internal Server Error');
    }
};

const getCodeBlockById = async (req, res) => {
    const codeBlockId = parseInt(req.params.id);
    console.log(`Received request to get code block with ID: ${codeBlockId}`);
    try {
        const codeBlocksCollection = getCodeBlocksCollection();
        console.log('Fetching code block from the database');
        const codeBlock = await codeBlocksCollection.findOne({ id: codeBlockId });
        if (codeBlock) {
            console.log('Successfully retrieved code block:', codeBlock);
            res.json(codeBlock);
        } else {
            console.log('Code block not found with ID:', codeBlockId);
            res.status(404).send('Code block not found');
        }
    } catch (error) {
        console.error('Error retrieving code block:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    getCodeBlocks,
    getCodeBlockById
};
