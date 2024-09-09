const db = require('../config/database');
const argon2 = require('argon2');

// Obtener detalles del usuario
const getUserDetails = async (req, res) => {
    const user_id = req.user.user_id;
    let query = `SELECT username, email, first_name, last_name FROM users WHERE user_id = ?`;
    
    try {
        const rows = await db.query(query, [user_id]);

        if (rows.length > 0) {
            return res.status(200).json({code: 200, message: rows[0]});
        }
        return res.status(404).json({code: 404, message: "Usuario no encontrado"});
    } catch (error) {
        return res.status(500).json({code: 500, message: "Error en el servidor", error: error.message});
    }
};

// Confirmar contraseña
const confirmPassword = async (req, res) => {
    const { password } = req.body;
    const user_id = req.user.user_id;

    if (!password) {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }

    try {
        const query = `SELECT password FROM users WHERE user_id = ?`;
        const rows = await db.query(query, [user_id]);

        if (rows.length > 0) {
            const isMatch = await argon2.verify(rows[0].password, password);
            return res.status(isMatch ? 200 : 400).json({ code: isMatch ? 200 : 400, message: isMatch ? "Contraseña correcta" : "Contraseña incorrecta" });
        } else {
            return res.status(404).json({ code: 404, message: "Usuario no encontrado" });
        }
    } catch (err) {
        return res.status(500).json({ code: 500, message: "Error al verificar la contraseña", error: err.message });
    }
};

// Actualizar contraseña
const updatePassword = async (req, res) => {
    const { password } = req.body;
    const user_id = req.user.user_id;

    if (!password) {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }

    try {
        const hashedPassword = await argon2.hash(password);
        const query = `UPDATE users SET password = ? WHERE user_id = ?`;
        const result = await db.query(query, [hashedPassword, user_id]);

        return res.status(result.affectedRows === 1 ? 200 : 500).json({ code: result.affectedRows === 1 ? 200 : 500, message: result.affectedRows === 1 ? "Contraseña actualizada correctamente" : "Error al actualizar la contraseña" });
    } catch (err) {
        return res.status(500).json({ code: 500, message: "Error al hashear la contraseña", error: err.message });
    }
};

// Actualizar correo
const updateEmail = async (req, res) => {
    const { email } = req.body;
    const user_id = req.user.user_id;

    if (!email) {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }

    try {
        const existingUserQuery = `SELECT 1 FROM users WHERE email = ? AND user_id != ? LIMIT 1`;
        const existingUser = await db.query(existingUserQuery, [email, user_id]);

        if (existingUser.length > 0) {
            return res.status(400).json({ code: 400, message: "El correo electrónico ya está en uso." });
        }

        const updateQuery = `UPDATE users SET email = ? WHERE user_id = ?`;
        const result = await db.query(updateQuery, [email, user_id]);

        return res.status(result.affectedRows === 1 ? 200 : 500).json({ code: result.affectedRows === 1 ? 200 : 500, message: result.affectedRows === 1 ? "Correo actualizado correctamente" : "Ocurrió un error" });
    } catch (error) {
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};

// Actualizar nombre de usuario
const updateUsername = async (req, res) => {
    const { username } = req.body;
    const user_id = req.user.user_id;

    if (!username) {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }

    try {
        const existingUserQuery = `SELECT 1 FROM users WHERE username = ? AND user_id != ? LIMIT 1`;
        const existingUser = await db.query(existingUserQuery, [username, user_id]);

        if (existingUser.length > 0) {
            return res.status(400).json({ code: 400, message: "El nombre de usuario ya está en uso." });
        }

        const updateQuery = `UPDATE users SET username = ? WHERE user_id = ?`;
        const result = await db.query(updateQuery, [username, user_id]);

        return res.status(result.affectedRows === 1 ? 200 : 500).json({ code: result.affectedRows === 1 ? 200 : 500, message: result.affectedRows === 1 ? "Nombre de usuario actualizado correctamente" : "Ocurrió un error" });
    } catch (error) {
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};

// Eliminar usuario
const deleteUser = async (req, res) => {
    const user_id = req.user.user_id;
    let query = `DELETE FROM users WHERE user_id = ?`;

    try {
        const result = await db.query(query, [user_id]);
        return res.status(result.affectedRows === 1 ? 200 : 500).json({ code: result.affectedRows === 1 ? 200 : 500, message: result.affectedRows === 1 ? "Usuario eliminado correctamente" : "Ocurrió un error" });
    } catch (error) {
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};

module.exports = {
    getUserDetails,
    confirmPassword,
    updatePassword,
    updateEmail,
    updateUsername,
    deleteUser
};
