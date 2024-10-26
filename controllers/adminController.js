const { users, accounts, transactions, transfers } = require('../models/init-models')(require('../config/database'));

// Obtener todos los usuarios
const getAllUsers = async (req, res) => {
    try {
        const usersList = await users.findAll();

        if (usersList.length > 0) {
            return res.status(200).json({ code: 200, message: usersList });
        } else {
            return res.status(404).json({ code: 404, message: "No hay usuarios" });
        }
    } catch (error) {
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};

// Obtener todas las cuentas
const getAllAccounts = async (req, res) => {
    try {
        const accountsList = await accounts.findAll();

        if (accountsList.length > 0) {
            return res.status(200).json({ code: 200, message: accountsList });
        } else {
            return res.status(404).json({ code: 404, message: "No hay cuentas" });
        }
    } catch (error) {
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};

// Obtener todos los movimientos
const getAllMovements = async (req, res) => {
    try {
        const [transactionsList, transfersList] = await Promise.all([
            transactions.findAll({ attributes: { include: [['transaction_date', 'date']] } }),
            transfers.findAll({ attributes: { include: [['transfer_date', 'date']] } })
        ]);

        const combined = [...transactionsList, ...transfersList];
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

// Exportar los métodos
module.exports = {
    getAllUsers,
    getAllAccounts,
    getAllMovements,
    // Exportar las demás funciones si es necesario...
};
