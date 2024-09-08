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

    if (password) {
        let query = `SELECT password FROM users WHERE user_id = ?`;

        try {
            const rows = await db.query(query, [user_id]);

            if (rows.length > 0) {
                const storedPasswordHash = rows[0].password;
                const isMatch = await argon2.verify(storedPasswordHash, password);

                if (isMatch) {
                    return res.status(200).json({ code: 200, message: "Contraseña correcta" });
                } else {
                    return res.status(400).json({ code: 400, message: "Contraseña incorrecta" });
                }
            } else {
                return res.status(400).json({ code: 400, message: "Usuario no encontrado" });
            }
        } catch (err) {
            return res.status(500).json({ code: 500, message: "Error al verificar la contraseña", error: err.message });
        }
    } else {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }
};

// Actualizar contraseña
const updatePassword = async (req, res) => {
    const { password } = req.body;
    const user_id = req.user.user_id;

    if (password) {
        try {
            const hashedPassword = await argon2.hash(password);
            const query = `UPDATE users SET password = ? WHERE user_id = ?`;
            const result = await db.query(query, [hashedPassword, user_id]);

            if (result.affectedRows == 1) {
                return res.status(200).json({ code: 200, message: "Contraseña actualizada correctamente" });
            } else {
                return res.status(500).json({ code: 500, message: "Error al actualizar la contraseña" });
            }
        } catch (err) {
            return res.status(500).json({ code: 500, message: "Error al hashear la contraseña", error: err.message });
        }
    } else {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }
};

// Actualizar correo
const updateEmail = async (req, res) => {
    const { email } = req.body;
    const user_id = req.user.user_id;

    if (email) {
        let query = `SELECT * FROM users WHERE email = ? AND user_id != ?`;

        try {
            const existingUser = await db.query(query, [email, user_id]);

            if (existingUser.length > 0) {
                return res.status(400).json({ message: 'El correo electrónico ya está en uso.' });
            }

            query = `UPDATE users SET email = ? WHERE user_id = ?`;
            const result = await db.query(query, [email, user_id]);

            if (result.affectedRows == 1) {
                return res.status(200).json({ code: 200, message: "Usuario actualizado correctamente" });
            } else {
                return res.status(500).json({ code: 500, message: "Ocurrió un error" });
            }
        } catch (error) {
            return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
        }
    } else {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }
};

// Actualizar nombre de usuario
const updateUsername = async (req, res) => {
    const { username } = req.body;
    const user_id = req.user.user_id;

    if (username) {
        let query = `SELECT * FROM users WHERE username = ? AND user_id != ?`;

        try {
            const existingUser = await db.query(query, [username, user_id]);

            if (existingUser.length > 0) {
                return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
            }

            query = `UPDATE users SET username = ? WHERE user_id = ?`;
            const result = await db.query(query, [username, user_id]);

            if (result.affectedRows == 1) {
                return res.status(200).json({ code: 200, message: "Usuario actualizado correctamente" });
            } else {
                return res.status(500).json({ code: 500, message: "Ocurrió un error" });
            }
        } catch (error) {
            return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
        }
    } else {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }
};

// Eliminar usuario
const deleteUser = async (req, res) => {
    const user_id = req.user.user_id;
    let query = `DELETE FROM users WHERE user_id = ?`;

    try {
        const result = await db.query(query, [user_id]);

        if (result.affectedRows == 1) {
            return res.status(200).json({code: 200, message: "Usuario eliminado correctamente"});
        } else {
            return res.status(500).json({code: 500, message: "Ocurrió un error"});
        }
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
