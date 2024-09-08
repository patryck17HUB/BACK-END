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
movements.get('/', (req, res) => {
    return res.status(200).json({ code: 1, message: "Pasaste la autenticación" });
});

movements.get('/all', getAllMovements);
movements.get('/transactions', getTransactions);
movements.get('/transfers', getTransfers);

// ------------------------------------------ POSTS ------------------------------------------
movements.post('/transfers', postTransfer);
movements.post('/transactions', postTransaction);

module.exports = movements;
