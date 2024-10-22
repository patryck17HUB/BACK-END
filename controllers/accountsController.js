const db = require('../config/database');

const getAllAccounts = async (req, res, next) => {
    const user_id = req.user.user_id;

    try {
        const query = 'SELECT * FROM accounts WHERE user_id = ?';
        const rows = await db.query(query, [user_id]);

        if (rows.length > 0) {
            return res.status(200).json({ code: 200, message: rows });
        } else {
            return res.status(404).json({ code: 404, message: "No hay cuentas" });
        }
    } catch (error) {
        console.error(error);  // Agregar logging para los errores
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};

const getAccountById = async (req, res, next) => {
    const user_id = req.user.user_id;
    const { account_id } = req.body;  // Usa params en lugar de body para ID
    try {
        const query = 'SELECT * FROM accounts WHERE user_id = ? AND account_id = ?';
        const rows = await db.query(query, [user_id, account_id]);

        if (rows.length > 0) {
            return res.status(200).json({ code: 200, message: rows });
        } else {
            return res.status(404).json({ code: 404, message: "No se encontró la cuenta" });
        }
    } catch (error) {
        console.error(error);  // Agregar logging para los errores
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};

const createAccount = async (req, res, next) => {
    const user_id = req.user.user_id;
    const { account_type, balance } = req.body;

    if (account_type && balance) {
        try {
            const query = 'INSERT INTO accounts (user_id, account_type, balance) VALUES (?, ?, ?)';
            const result = await db.query(query, [user_id, account_type, balance]);

            if (result.affectedRows === 1) {
                return res.status(201).json({ code: 201, message: "Cuenta creada correctamente" });
            } else {
                return res.status(500).json({ code: 500, message: "Ocurrió un error al crear la cuenta" });
            }
        } catch (error) {
            console.error(error);  // Agregar logging para los errores
            return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
        }
    } else {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }
};

const deleteAccount = async (req, res, next) => {
    const user_id = req.user.user_id;
    const { account_id } = req.params;  // Usa params en lugar de body para ID

    try {
        const query = 'DELETE FROM accounts WHERE user_id = ? AND account_id = ?';
        const result = await db.query(query, [user_id, account_id]);

        if (result.affectedRows === 1) {
            return res.status(200).json({ code: 200, message: "Cuenta eliminada correctamente" });
        } else {
            return res.status(404).json({ code: 404, message: "Cuenta no encontrada" });
        }
    } catch (error) {
        console.error(error);  // Agregar logging para los errores
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};

module.exports = {
    getAllAccounts,
    getAccountById,
    createAccount,
    deleteAccount
};
