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
            return res.status(200).json({ code: 200, message: rows });
        } else {
            return res.status(404).json({ code: 404, message: "No hay usuarios" });
        }
    } catch (error) {
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
});

admin.get('/allaccounts', async (req, res, next) => {
    try {
        let query = `SELECT * FROM accounts`;
        const rows = await db.query(query);

        if (rows.length > 0) {
            return res.status(200).json({ code: 200, message: rows });
        } else {
            return res.status(404).json({ code: 404, message: "No hay cuentas" });
        }
    } catch (error) {
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
});

admin.get('/allmovements', async (req, res, next) => {
    try {
        // Consultar transacciones y transferencias, ordenadas por fecha de más reciente a más viejo
        let transactionsQuery = `SELECT * FROM transactions`;
        const transactions = await db.query(transactionsQuery);

        let transfersQuery = `SELECT * FROM transfers`;
        const transfers = await db.query(transfersQuery);

        // Combinar y ordenar por fecha
        const combined = [...transactions, ...transfers];
        const sorted = combined.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (sorted.length > 0) {
            return res.status(200).json({ code: 200, message: sorted });
        } else {
            return res.status(404).json({ code: 404, message: "No hay movimientos" });
        }
    } catch (error) {
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
});

admin.get('/alltransfers', async (req, res, next) => {
    try {
        // Consultar transferencias, ordenadas por fecha de más reciente a más viejo
        let transfersQuery = `SELECT * FROM transfers ORDER BY transfer_date DESC`;
        const transfers = await db.query(transfersQuery);

        if (transfers.length > 0) {
            return res.status(200).json({ code: 200, message: transfers });
        } else {
            return res.status(404).json({ code: 404, message: "No hay transferencias" });
        }
    } catch (error) {
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
});

admin.get('/alltransactions', async (req, res, next) => {
    try {
        // Consultar transacciones, ordenadas por fecha de más reciente a más viejo
        let transactionsQuery = `SELECT * FROM transactions ORDER BY transaction_date DESC`;
        const transactions = await db.query(transactionsQuery);

        if (transactions.length > 0) {
            return res.status(200).json({ code: 200, message: transactions });
        } else {
            return res.status(404).json({ code: 404, message: "No hay transacciones" });
        }
    } catch (error) {
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
});

admin.get('/oneuser', async (req, res, next) => {
    const { user_id } = req.body;

    try {
        // Verificar si el usuario existe
        let userExistQuery = `SELECT COUNT(*) as count FROM users WHERE user_id = ${user_id}`;
        const userExistResult = await db.query(userExistQuery);

        if (userExistResult[0].count === 0) {
            return res.status(404).json({ code: 404, message: "Usuario inválido" });
        }

        // Obtener información del usuario
        let userQuery = `SELECT * FROM users WHERE user_id = ${user_id}`;
        const user = await db.query(userQuery);

        return res.status(200).json({ code: 200, message: user });
    } catch (error) {
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
});

admin.get('/useraccounts', async (req, res, next) => {
    const { user_id } = req.body;

    try {
        // Verificar si el usuario existe
        let userExistQuery = `SELECT COUNT(*) as count FROM users WHERE user_id = ${user_id}`;
        const userExistResult = await db.query(userExistQuery);

        if (userExistResult[0].count === 0) {
            return res.status(404).json({ code: 404, message: "Usuario inválido" });
        }

        // Obtener cuentas del usuario
        let accountsQuery = `SELECT * FROM accounts WHERE user_id = ${user_id}`;
        const accounts = await db.query(accountsQuery);

        if (accounts.length > 0) {
            return res.status(200).json({ code: 200, message: accounts });
        } else {
            return res.status(200).json({ code: 200, message: "El usuario no tiene cuentas" });
        }
    } catch (error) {
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
});


admin.get('/oneaccount', async (req, res, next) => {
    const { account_id } = req.body;

    try {
        // Verificar si la cuenta existe
        let accountExistQuery = `SELECT COUNT(*) as count FROM accounts WHERE account_id = ${account_id}`;
        const accountExistResult = await db.query(accountExistQuery);

        if (accountExistResult[0].count === 0) {
            return res.status(404).json({ code: 404, message: "Cuenta inválida" });
        }

        // Obtener información de la cuenta
        let accountQuery = `SELECT * FROM accounts WHERE account_id = ${account_id}`;
        const account = await db.query(accountQuery);

        return res.status(200).json({ code: 200, message: account });
    } catch (error) {
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
});

admin.get('/accountmovements', async (req, res, next) => {
    const { account_id } = req.body;

    if (!account_id) {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }

    try {
        // Verificar si la cuenta existe
        let accountExistQuery = `SELECT COUNT(*) as count FROM accounts WHERE account_id = '${account_id}'`;
        const accountExistResult = await db.query(accountExistQuery);

        if (accountExistResult[0].count === 0) {
            return res.status(404).json({ code: 404, message: "Cuenta inválida" });
        }

        // Consultar transacciones de la cuenta, ordenadas por fecha de más reciente a más viejo
        let transactionsQuery = `SELECT *, transaction_date AS date FROM transactions WHERE account_id = '${account_id}'`;
        const transactions = await db.query(transactionsQuery);

        // Consultar transferencias de la cuenta, ordenadas por fecha de más reciente a más viejo
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
            return res.status(404).json({ code: 404, message: "No hay movimientos" });
        }
    } catch (error) {
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
});

admin.get('/accounttransactions', async (req, res, next) => {
    const { account_id } = req.body;

    if (!account_id) {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }

    try {
        // Verificar si la cuenta existe
        let accountExistQuery = `SELECT COUNT(*) as count FROM accounts WHERE account_id = '${account_id}'`;
        const accountExistResult = await db.query(accountExistQuery);

        if (accountExistResult[0].count === 0) {
            return res.status(404).json({ code: 404, message: "Cuenta inválida" });
        }

        // Consultar transacciones de la cuenta, ordenadas por fecha de más reciente a más viejo
        let transactionsQuery = `SELECT *, transaction_date AS date FROM transactions WHERE account_id = '${account_id}' ORDER BY transaction_date DESC`;
        const transactions = await db.query(transactionsQuery);

        if (transactions.length > 0) {
            return res.status(200).json({
                code: 200,
                message: transactions
            });
        } else {
            return res.status(404).json({ code: 404, message: "No hay transacciones" });
        }

    } catch (error) {
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
});

admin.get('/accounttransfers', async (req, res, next) => {
    const { account_id } = req.body;

    if (!account_id) {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }

    try {
        // Verificar si la cuenta existe
        let accountExistQuery = `SELECT COUNT(*) as count FROM accounts WHERE account_id = '${account_id}'`;
        const accountExistResult = await db.query(accountExistQuery);

        if (accountExistResult[0].count === 0) {
            return res.status(404).json({ code: 404, message: "Cuenta inválida" });
        }

        // Consultar transferencias de la cuenta, ordenadas por fecha de más reciente a más viejo
        let transferQuery = `SELECT *, transfer_date AS date FROM transfers WHERE from_account_id = '${account_id}' OR to_account_id = '${account_id}' ORDER BY transfer_date DESC`;
        const transfers = await db.query(transferQuery);

        if (transfers.length > 0) {
            return res.status(200).json({
                code: 200,
                message: transfers
            });
        } else {
            return res.status(404).json({ code: 404, message: "No hay transferencias" });
        }

    } catch (error) {
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
});

module.exports = admin;

// ------------------------------------------ DELETE ------------------------------------------
/*admin.delete('/deleteuser', async (req, res, next) => {

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
*/