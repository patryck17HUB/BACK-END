const express = require('express');
const movements = express.Router();
const {
    getAllMovements,
    getTransactions,
    getTransfers,
    postTransfer,
    postTransaction
} = require('../controllers/movementsController');

// ------------------------------------------ GETS ------------------------------------------

movements.get('/all/:account_id', getAllMovements);
movements.get('/transactions/:account_id', getTransactions);
movements.get('/transfers/:account_id', getTransfers);

// ------------------------------------------ POSTS ------------------------------------------
movements.post('/transfers', postTransfer);
movements.post('/transactions', postTransaction);

module.exports = movements;
