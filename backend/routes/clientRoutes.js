const express = require('express');
const router = express.Router();
const { getClients, getClientById } = require('../controllers/clientController');

router.get('/', getClients);
router.get('/:id', getClientById);

module.exports = router;
