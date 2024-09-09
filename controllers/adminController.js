const db = require('../config/database');

const getAllUsers = async (req, res) => {
    try {
        const query = 'SELECT * FROM users';
        const rows = await db.query(query);

        if (rows.length > 0) {
            return res.status(200).json({ code: 200, message: rows });
        } else {
            return res.status(404).json({ code: 404, message: "No hay usuarios" });
        }
    } catch (error) {
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};

const getAllAccounts = async (req, res) => {
    try {
        const query = 'SELECT * FROM accounts';
        const rows = await db.query(query);

        if (rows.length > 0) {
            return res.status(200).json({ code: 200, message: rows });
        } else {
            return res.status(404).json({ code: 404, message: "No hay cuentas" });
        }
    } catch (error) {
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};

const getAllMovements = async (req, res) => {
    try {
        const transactionsQuery = 'SELECT * FROM transactions';
        const transactions = await db.query(transactionsQuery);

        const transfersQuery = 'SELECT * FROM transfers';
        const transfers = await db.query(transfersQuery);

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
};

// Añadir otras funciones similares...

module.exports = {
    getAllUsers,
    getAllAccounts,
    getAllMovements,
    // Exportar las demás funciones...
};
