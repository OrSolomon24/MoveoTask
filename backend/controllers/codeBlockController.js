const { getCodeBlocksCollection } = require('../data/database');

const getCodeBlocks = async (req, res) => {
    const codeBlocksCollection = getCodeBlocksCollection();
    const codeBlocks = await codeBlocksCollection.find().project({ id: 1, title: 1 }).toArray();
    res.json(codeBlocks);
};

const getCodeBlockById = async (req, res) => {
    const codeBlocksCollection = getCodeBlocksCollection();
    const codeBlock = await codeBlocksCollection.findOne({ id: parseInt(req.params.id) });
    if (codeBlock) {
        res.json(codeBlock);
    } else {
        res.status(404).send('Code block not found');
    }
};

module.exports = {
    getCodeBlocks,
    getCodeBlockById
};
