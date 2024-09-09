const db = require('../config/database');

const verifyAccountOwnership = async (account_id, user_id) => {
    const query = 'SELECT * FROM accounts WHERE account_id = ? AND user_id = ?';
    const result = await db.query(query, [account_id, user_id]);
    return result.length > 0;
};

// Obtener todos los movimientos de una cuenta
const getAllMovements = async (req, res) => {
    const { account_id } = req.body;
    const user_id = req.user.user_id;

    if (!account_id) {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }

    try {
        if (!(await verifyAccountOwnership(account_id, user_id))) {
            return res.status(403).json({ code: 403, message: "Acceso denegado. La cuenta no pertenece al usuario." });
        }

        const transactionsQuery = 'SELECT *, transaction_date AS date FROM transactions WHERE account_id = ?';
        const transfersQuery = 'SELECT *, transfer_date AS date FROM transfers WHERE from_account_id = ? OR to_account_id = ?';

        const [transactions, transfers] = await Promise.all([
            db.query(transactionsQuery, [account_id]),
            db.query(transfersQuery, [account_id, account_id])
        ]);

        const combined = [...transactions, ...transfers];
        const sorted = combined.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json({ code: 200, message: sorted.length > 0 ? sorted : "No hay movimientos" });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};

// Obtener transacciones de una cuenta
const getTransactions = async (req, res) => {
    const { account_id } = req.body;
    const user_id = req.user.user_id;

    if (!account_id) {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }

    try {
        if (!(await verifyAccountOwnership(account_id, user_id))) {
            return res.status(403).json({ code: 403, message: "Acceso denegado. La cuenta no pertenece al usuario." });
        }

        const query = 'SELECT *, transaction_date AS date FROM transactions WHERE account_id = ? ORDER BY transaction_date DESC';
        const transactions = await db.query(query, [account_id]);

        res.status(200).json({ code: 200, message: transactions.length > 0 ? transactions : "No hay transacciones" });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};

// Obtener transferencias de una cuenta
const getTransfers = async (req, res) => {
    const { account_id } = req.body;
    const user_id = req.user.user_id;

    if (!account_id) {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }

    try {
        if (!(await verifyAccountOwnership(account_id, user_id))) {
            return res.status(403).json({ code: 403, message: "Acceso denegado. La cuenta no pertenece al usuario." });
        }

        const query = 'SELECT *, transfer_date AS date FROM transfers WHERE from_account_id = ? OR to_account_id = ? ORDER BY transfer_date DESC';
        const transfers = await db.query(query, [account_id, account_id]);

        res.status(200).json({ code: 200, message: transfers.length > 0 ? transfers : "No hay transferencias" });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};

// Realizar transferencia entre cuentas
const postTransfer = async (req, res) => {
    const user_id = req.user.user_id;
    const { from_account_id, to_account_id, amount, description } = req.body;

    if (!from_account_id || !to_account_id || !amount) {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }

    try {
        const fromAccountQuery = 'SELECT balance FROM accounts WHERE account_id = ? AND user_id = ?';
        const toAccountQuery = 'SELECT * FROM accounts WHERE account_id = ?';
        
        const [fromAccount, toAccount] = await Promise.all([
            db.query(fromAccountQuery, [from_account_id, user_id]),
            db.query(toAccountQuery, [to_account_id])
        ]);

        if (fromAccount.length === 0 || fromAccount[0].balance < amount) {
            return res.status(400).json({ code: 400, message: "Fondos insuficientes o cuenta inválida" });
        }

        if (toAccount.length === 0) {
            return res.status(400).json({ code: 400, message: "Cuenta de destino inválida" });
        }

        await db.query('START TRANSACTION');
        await db.query('UPDATE accounts SET balance = balance - ? WHERE account_id = ?', [amount, from_account_id]);
        await db.query('UPDATE accounts SET balance = balance + ? WHERE account_id = ?', [amount, to_account_id]);
        await db.query('INSERT INTO transfers (from_account_id, to_account_id, amount, description) VALUES (?, ?, ?, ?)', [from_account_id, to_account_id, amount, description]);
        await db.query('COMMIT');

        res.status(200).json({ code: 200, message: "Transferencia realizada correctamente" });
    } catch (error) {
        await db.query('ROLLBACK');
        res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};

// Realizar transacción
const postTransaction = async (req, res) => {
    const user_id = req.user.user_id;
    const { account_id, transaction_type, amount, description } = req.body;

    if (!account_id || !transaction_type || !amount) {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }

    try {
        const accountQuery = 'SELECT * FROM accounts WHERE account_id = ? AND user_id = ?';
        const account = await db.query(accountQuery, [account_id, user_id]);

        if (account.length === 0) {
            return res.status(400).json({ code: 400, message: "Cuenta inválida" });
        }

        await db.query('START TRANSACTION');
        await db.query('INSERT INTO transactions (account_id, transaction_type, amount, description) VALUES (?, ?, ?, ?)', [account_id, transaction_type, amount, description]);

        const balanceUpdate = transaction_type === 'deposit'
            ? 'UPDATE accounts SET balance = balance + ? WHERE account_id = ?'
            : (account[0].balance >= amount)
                ? 'UPDATE accounts SET balance = balance - ? WHERE account_id = ?'
                : null;

        if (!balanceUpdate) {
            return res.status(400).json({ code: 400, message: "Fondos insuficientes" });
        }

        await db.query(balanceUpdate, [amount, account_id]);
        await db.query('COMMIT');

        res.status(200).json({ code: 200, message: "Transacción realizada correctamente" });
    } catch (error) {
        await db.query('ROLLBACK');
        res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};

module.exports = {
    getAllMovements,
    getTransactions,
    getTransfers,
    postTransfer,
    postTransaction
};