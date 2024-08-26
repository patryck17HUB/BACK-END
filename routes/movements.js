const express = require('express');
const movements = express.Router();
const db = require('../config/database');

// ------------------------------------------ GETS ------------------------------------------
movements.get('/', async (req, res, next) => {
    return res.status(200).json({code: 1, message: "Pasaste la autenticación"});
});

movements.get('/all', async (req, res, next) => {
    const { account_id } = req.body;
    const user_id = req.user.user_id;

    if (account_id){
    try {
        // Verificar que la cuenta pertenece al usuario
        const accountQuery = `SELECT * FROM accounts WHERE account_id = '${account_id}' AND user_id = '${user_id}'`;
        const accountResult = await db.query(accountQuery);

        if (accountResult.length === 0) {
            return res.status(403).json({ code: 403, message: "Acceso denegado. La cuenta no pertenece al usuario." });
        }

        // Consultar transacciones del usuario, ordenadas por fecha de más reciente a más viejo
        let transactionsQuery = `SELECT *, transaction_date AS date FROM transactions WHERE account_id = '${account_id}'`;
        const transactions = await db.query(transactionsQuery);

        // Consultar transferencias del usuario, ordenadas por fecha de más reciente a más viejo
        let transfersQuery = `SELECT *, transfer_date AS date FROM transfers WHERE from_account_id = '${account_id}' OR to_account_id = '${account_id}'`;
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
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
    }
    return res.status(400).json({ code: 400, message: "Campos incompletos" });
});


movements.get('/transactions', async (req, res, next) => {
    const {account_id} = req.body;
    const user_id = req.user.user_id;

    try {
        // Verificar que la cuenta pertenece al usuario
        const accountQuery = `SELECT * FROM accounts WHERE account_id = '${account_id}' AND user_id = '${user_id}'`;
        const accountResult = await db.query(accountQuery);

        if (accountResult.length === 0) {
            return res.status(403).json({ code: 403, message: "Acceso denegado. La cuenta no pertenece al usuario." });
        }

        // Consultar transacciones del usuario, ordenadas por fecha de más reciente a más viejo
        let transactionsQuery = `SELECT *, transaction_date AS date FROM transactions WHERE account_id = '${account_id}'`;
        const transactions = await db.query(transactionsQuery);

        if (transactions.length > 0) {
            return res.status(200).json({
                code: 200,
                message: transactions
            });
        }
        else {
            return res.status(200).json({ code: 200, message: "No hay transacciones" });
        }

    } catch (error) {
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
});

movements.get('/transfers', async (req, res, next) => {
    const {account_id} = req.body;
    const user_id = req.user.user_id;

    try {
        // Verificar que la cuenta pertenece al usuario
        const accountQuery = `SELECT * FROM accounts WHERE account_id = '${account_id}' AND user_id = '${user_id}'`;
        const accountResult = await db.query(accountQuery);

        if (accountResult.length === 0) {
            return res.status(403).json({ code: 403, message: "Acceso denegado. La cuenta no pertenece al usuario." });
        }

        // Consultar transacciones del usuario, ordenadas por fecha de más reciente a más viejo
        let transferQuery = `SELECT *, transfer_date AS date FROM transfers WHERE from_account_id = '${account_id}' OR to_account_id = '${account_id}'`;
        const transfers = await db.query(transferQuery);

        if (transfers.length > 0) {
            return res.status(200).json({
                code: 200,
                message: transfers
            });
        }
        else {
            return res.status(200).json({ code: 200, message: "No hay transferencias" });
        }

    } catch (error) {
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
});

// ------------------------------------------ POSTS ------------------------------------------
movements.post('/transfers', async (req, res, next) => {
    const user_id = req.user.user_id;
    const { from_account_id, to_account_id, amount, description } = req.body;

    if (from_account_id && to_account_id && amount) {
        // Ejecutar las consultas en un bloque try-catch para manejar errores
        try {
            // Verificar que la cuenta de origen pertenece al usuario y tiene fondos suficientes
            let query = `SELECT balance FROM accounts WHERE account_id = '${from_account_id}' AND user_id = '${user_id}'`;
            const fromAccount = await db.query(query);

            if (fromAccount.length === 0 || fromAccount[0].balance < amount) {
                return res.status(400).json({code: 400, message: "Fondos insuficientes o cuenta inválida"});
            }

            // Verificar que la cuenta de destino existe
            query = `SELECT * FROM accounts WHERE account_id = '${to_account_id}'`;
            const toAccount = await db.query(query);

            if (toAccount.length === 0) {
                return res.status(400).json({code: 400, message: "Cuenta de destino inválida"});
            }

            // Iniciar transacción en la base de datos
            await db.query('START TRANSACTION');

            // Debitar la cuenta de origen
            query = `UPDATE accounts SET balance = balance - ${amount} WHERE account_id = '${from_account_id}'`;
            await db.query(query);

            // Acreditar la cuenta de destino
            query = `UPDATE accounts SET balance = balance + ${amount} WHERE account_id = '${to_account_id}'`;
            await db.query(query);

            // Insertar registro de transferencia
            query = `INSERT INTO transfers (from_account_id, to_account_id, amount, description) VALUES ('${from_account_id}', '${to_account_id}', ${amount}, '${description}')`;
            await db.query(query);

            // Confirmar la transacción
            await db.query('COMMIT');

            return res.status(200).json({code: 200, message: "Transferencia realizada correctamente"});
        } catch (error) {
            // Revertir la transacción en caso de error
            await db.query('ROLLBACK');
            return res.status(500).json({code: 500, message: "Error en el servidor", error: error.message});
        }
    } else {
        return res.status(400).json({code: 400, message: "Campos incompletos"});
    }
});

movements.post('/transactions', async (req, res, next) => {
    const user_id = req.user.user_id;
    const { account_id, transaction_type, amount, description } = req.body;

    if (account_id && transaction_type && amount) {
        // Ejecutar las consultas en un bloque try-catch para manejar errores
        try {
            // Verificar que la cuenta pertenece al usuario
            let query = `SELECT * FROM accounts WHERE account_id = '${account_id}' AND user_id = '${user_id}'`;
            const account = await db.query(query);

            if (account.length === 0) {
                return res.status(400).json({code: 400, message: "Cuenta inválida"});
            }

            // Iniciar transacción en la base de datos
            await db.query('START TRANSACTION');

            // Insertar registro de transacción
            query = `INSERT INTO transactions (account_id, transaction_type, amount, description) VALUES ('${account_id}', '${transaction_type}', ${amount}, '${description}')`;
            await db.query(query);

            // Actualizar el saldo de la cuenta
            if (transaction_type === 'deposit') {
                query = `UPDATE accounts SET balance = balance + ${amount} WHERE account_id = '${account_id}'`;
            } else {
                if (account[0].balance < amount) {
                    return res.status(400).json({code: 400, message: "Fondos insuficientes"});
                }
                query = `UPDATE accounts SET balance = balance - ${amount} WHERE account_id = '${account_id}'`;
            }
            await db.query(query);
            
            // Confirmar la transacción
            await db.query('COMMIT');

            return res.status(200).json({code: 200, message: "Transacción realizada correctamente"});
        } catch (error) {
            // Revertir la transacción en caso de error
            await db.query('ROLLBACK');
            return res.status(500).json({code: 500, message: "Error en el servidor", error: error.message});
        }
    }
});
module.exports = movements;