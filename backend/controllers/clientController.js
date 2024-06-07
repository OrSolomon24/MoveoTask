const { getClientCollection } = require('../data/database');

const getClients = async (req, res) => {
    const clientCollection = getClientCollection();
    const clients = await clientCollection.find().toArray();
    res.json(clients);
};

const getClientById = async (req, res) => {
    const clientCollection = getClientCollection();
    const clientId = parseInt(req.params.id);
    const client = await clientCollection.findOne({ id: clientId });
    if (client) {
        res.json(client);
    } else {
        res.status(404).send('Client not found');
    }
};

module.exports = {
    getClients,
    getClientById
};
