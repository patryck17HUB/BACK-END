const express = require('express');
const banco = express.Router();
const db = require('../config/database');

banco.post('/', async (req, res, next) => {
    const {account_id, transaction_type, amount} = req.body;

    if (account_id && transaction_type && amount) {
        let query = "INSERT INTO transactions (transaction_id, account_id, transaction_type, amount, transaction_date) ";
        query += `VALUES (NULL, ${account_id}, '${transaction_type}', ${amount}, NOW())`;
        
        const rows = await db.query(query);

        if (rows.affectedRows == 1) {
            return res.status(201).json({code: 201, message: "Transacción exitosa"});
        }
        return res.status(500).json({code: 500, message: "Ocurrió un error"});
    }
    return res.status(500).json({code: 500, message: "Campos incompletos"});
});

banco.get('/', async (req, res, next) => {
    try {
        const bco = await db.query("SELECT * FROM accounts");
        return res.status(200).json({code: 1, message: bco});
    } catch (err) {
        return res.status(500).json({code: 500, message: "Algo salió mal"});
    }
});

banco.get('/:id([0-9]{1,3})', async (req, res, next) => {
    try {
        const bco = await db.query(`SELECT * FROM accounts WHERE account_id = ${req.params.id}`);
        return res.status(200).json({code: 1, message: bco});
    } catch (err) {
        return res.status(500).json({code: 500, message: "Algo salió mal"});
    }
});

module.exports = banco;