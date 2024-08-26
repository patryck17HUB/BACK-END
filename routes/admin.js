const express = require('express');
const admin = express.Router();
const db = require('../config/database');

admin.get('/', async (req, res, next) => {
    return res.status(200).json({code: 1, message: "Pasaste la autenticación en ADMIN"});
});

// ------------------------------------------ GETS ------------------------------------------
admin.get('/allusers', async (req, res, next) => {

    try {
        let query = `SELECT * FROM users`;
        const rows = await db.query(query);
        if (rows.length > 0) {
            return res.status(200).json({code: 200, message: rows});
        } else {
            return res.status(200).json({code: 200, message: "No hay cuentas"});
        }
    } catch (error) {
        return res.status(500).json({code: 500, message: "Error en el servidor", error: error.message});
    }
});

admin.get('/allaccounts', async (req, res, next) => {
    
    try {
        let query = `SELECT * FROM accounts`;
        const rows = await db.query(query);
        if (rows.length > 0) {
            return res.status(200).json({code: 200, message: rows});
        } else {
            return res.status(200).json({code: 200, message: "No hay cuentas"});
        }
    } catch (error) {
        return res.status(500).json({code: 500, message: "Error en el servidor", error: error.message});
    }
});

admin.get('/allmovements', async (req, res, next) => {

    try {
        // Consultar transacciones del usuario, ordenadas por fecha de más reciente a más viejo
        let transactionsQuery = `SELECT * FROM transactions`;
        const transactions = await db.query(transactionsQuery);

        // Consultar transferencias del usuario, ordenadas por fecha de más reciente a más viejo
        let transfersQuery = `SELECT * FROM transfers`;
        const transfers = await db.query(transfersQuery);

        // Combinar transacciones y transferencias
        const combined = [...transactions, ...transfers];

        // Ordenar combinados por fecha de más reciente a más viejo
        const sorted = combined.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (sorted.length > 0) {
            return res.status(200).json({
                code: 200,
                message: sorted
            });
        } else {
            return res.status(200).json({ code: 200, message: "No hay movimientos" });
        }
    } catch (error) {
        return res.status(500).json({code: 500, message: "Error en el servidor", error: error.message});
    }
});



// ------------------------------------------ DELETE ------------------------------------------
admin.delete('/deleteuser', async (req, res, next) => {

    const {user_id} = req.body;

    if (!user_id) {
        return res.status(400).json({code: 400, message: "Faltan parametros"});
    }

    try {
        let query = `DELETE FROM users WHERE user_id = ${user_id}`;
        const rows = await db.query(query);
        if (rows.affectedRows > 0) {
            return res.status(200).json({code: 200, message: "Usuario eliminado correctamente"});
        } else {
            return res.status(200).json({code: 200, message: "No se pudo eliminar el usuario"});
        }
    } catch (error) {
        return res.status(500).json({code: 500, message: "Error en el servidor", error: error.message});
    }

});

admin.delete('/deleteaccount', async (req, res, next) => {

    const {account_id} = req.body;

    if (!account_id) {
        return res.status(400).json({code: 400, message: "Faltan parametros"});
    }

    try {
        let query = `DELETE FROM accounts WHERE account_id = ${account_id}`;
        const rows = await db.query(query);
        if (rows.affectedRows > 0) {
            return res.status(200).json({code: 200, message: "Cuenta eliminada correctamente"});
        } else {
            return res.status(200).json({code: 200, message: "No se pudo eliminar la cuenta"});
        }
    } catch (error) {
        return res.status(500).json({code: 500, message: "Error en el servidor", error: error.message});
    }

});

admin.delete('/deleteuseraccounts', async (req, res, next) => {

    const {user_id} = req.body;

    if (!user_id) {
        return res.status(400).json({code: 400, message: "Faltan parametros"});
    }

    try {
        let query = `DELETE FROM accounts WHERE user_id = ${user_id}`;
        const rows = await db.query(query);
        if (rows.affectedRows > 0) {
            return res.status(200).json({code: 200, message: "Cuentas borradas correctamente del usuario " + user_id});
        } else {
            return res.status(200).json({code: 200, message: "No se pudo eliminar las cuentas del usuario " + user_id});
        }
    } catch (error) {
        return res.status(500).json({code: 500, message: "Error en el servidor", error: error.message});
    }

});

module.exports = admin;