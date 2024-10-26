const express = require('express');
const accounts = express.Router();
const { getAllAccounts, getAccountById, createAccount, deleteAccount } = require('../controllers/accountsController');

accounts.get('/all', getAllAccounts);
accounts.get('/select/:account_id', getAccountById);
accounts.post('/create', createAccount);
accounts.delete('/delete/:account_id', deleteAccount);

module.exports = accounts;
