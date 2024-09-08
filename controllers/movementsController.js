const db = require('../config/database');

// Obtener todos los movimientos de una cuenta
const getAllMovements = async (req, res) => {
    const { account_id } = req.body;
    const user_id = req.user.user_id;

    if (account_id) {
        try {
            const accountQuery = `SELECT * FROM accounts WHERE account_id = '${account_id}' AND user_id = '${user_id}'`;
            const accountResult = await db.query(accountQuery);

            if (accountResult.length === 0) {
                return res.status(403).json({ code: 403, message: "Acceso denegado. La cuenta no pertenece al usuario." });
            }

            const transactionsQuery = `SELECT *, transaction_date AS date FROM transactions WHERE account_id = '${account_id}'`;
            const transactions = await db.query(transactionsQuery);

            const transfersQuery = `SELECT *, transfer_date AS date FROM transfers WHERE from_account_id = '${account_id}' OR to_account_id = '${account_id}'`;
            const transfers = await db.query(transfersQuery);

            const combined = [...transactions, ...transfers];
            const sorted = combined.sort((a, b) => new Date(b.date) - new Date(a.date));

            if (sorted.length > 0) {
                return res.status(200).json({ code: 200, message: sorted });
            } else {
                return res.status(200).json({ code: 200, message: "No hay movimientos" });
            }
        } catch (error) {
            return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
        }
    } else {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }
};

// Obtener transacciones de una cuenta
const getTransactions = async (req, res) => {
    const { account_id } = req.body;
    const user_id = req.user.user_id;

    try {
        const accountQuery = `SELECT * FROM accounts WHERE account_id = '${account_id}' AND user_id = '${user_id}'`;
        const accountResult = await db.query(accountQuery);

        if (accountResult.length === 0) {
            return res.status(403).json({ code: 403, message: "Acceso denegado. La cuenta no pertenece al usuario." });
        }

        const transactionsQuery = `SELECT *, transaction_date AS date FROM transactions WHERE account_id = '${account_id}' ORDER BY transaction_date DESC`;
        const transactions = await db.query(transactionsQuery);

        return transactions.length > 0
            ? res.status(200).json({ code: 200, message: transactions })
            : res.status(200).json({ code: 200, message: "No hay transacciones" });

    } catch (error) {
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};

// Obtener transferencias de una cuenta
const getTransfers = async (req, res) => {
    const { account_id } = req.body;
    const user_id = req.user.user_id;

    try {
        const accountQuery = `SELECT * FROM accounts WHERE account_id = '${account_id}' AND user_id = '${user_id}'`;
        const accountResult = await db.query(accountQuery);

        if (accountResult.length === 0) {
            return res.status(403).json({ code: 403, message: "Acceso denegado. La cuenta no pertenece al usuario." });
        }

        const transferQuery = `SELECT *, transfer_date AS date FROM transfers WHERE from_account_id = '${account_id}' OR to_account_id = '${account_id}' ORDER BY transfer_date DESC`;
        const transfers = await db.query(transferQuery);

        return transfers.length > 0
            ? res.status(200).json({ code: 200, message: transfers })
            : res.status(200).json({ code: 200, message: "No hay transferencias" });

    } catch (error) {
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};

// Realizar transferencia entre cuentas
const postTransfer = async (req, res) => {
    const user_id = req.user.user_id;
    const { from_account_id, to_account_id, amount, description } = req.body;

    if (from_account_id && to_account_id && amount) {
        try {
            let query = `SELECT balance FROM accounts WHERE account_id = '${from_account_id}' AND user_id = '${user_id}'`;
            const fromAccount = await db.query(query);

            if (fromAccount.length === 0 || fromAccount[0].balance < amount) {
                return res.status(400).json({ code: 400, message: "Fondos insuficientes o cuenta inválida" });
            }

            query = `SELECT * FROM accounts WHERE account_id = '${to_account_id}'`;
            const toAccount = await db.query(query);

            if (toAccount.length === 0) {
                return res.status(400).json({ code: 400, message: "Cuenta de destino inválida" });
            }

            await db.query('START TRANSACTION');
            await db.query(`UPDATE accounts SET balance = balance - ${amount} WHERE account_id = '${from_account_id}'`);
            await db.query(`UPDATE accounts SET balance = balance + ${amount} WHERE account_id = '${to_account_id}'`);
            await db.query(`INSERT INTO transfers (from_account_id, to_account_id, amount, description) VALUES ('${from_account_id}', '${to_account_id}', ${amount}, '${description}')`);
            await db.query('COMMIT');

            return res.status(200).json({ code: 200, message: "Transferencia realizada correctamente" });
        } catch (error) {
            await db.query('ROLLBACK');
            return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
        }
    } else {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }
};

// Realizar transacción
const postTransaction = async (req, res) => {
    const user_id = req.user.user_id;
    const { account_id, transaction_type, amount, description } = req.body;

    if (account_id && transaction_type && amount) {
        try {
            const accountQuery = `SELECT * FROM accounts WHERE account_id = '${account_id}' AND user_id = '${user_id}'`;
            const account = await db.query(accountQuery);

            if (account.length === 0) {
                return res.status(400).json({ code: 400, message: "Cuenta inválida" });
            }

            await db.query('START TRANSACTION');
            await db.query(`INSERT INTO transactions (account_id, transaction_type, amount, description) VALUES ('${account_id}', '${transaction_type}', ${amount}, '${description}')`);

            const balanceUpdate = transaction_type === 'deposit'
                ? `UPDATE accounts SET balance = balance + ${amount} WHERE account_id = '${account_id}'`
                : account[0].balance >= amount
                    ? `UPDATE accounts SET balance = balance - ${amount} WHERE account_id = '${account_id}'`
                    : null;

            if (!balanceUpdate) return res.status(400).json({ code: 400, message: "Fondos insuficientes" });
            
            await db.query(balanceUpdate);
            await db.query('COMMIT');

            return res.status(200).json({ code: 200, message: "Transacción realizada correctamente" });
        } catch (error) {
            await db.query('ROLLBACK');
            return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
        }
    } else {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }
};

module.exports = {
    getAllMovements,
    getTransactions,
    getTransfers,
    postTransfer,
    postTransaction
};