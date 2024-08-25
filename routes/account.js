const express = require('express');
const account = express.Router();
const db = require('../config/database');
const argon2 = require('argon2');

account.get('/', async (req, res, next) => {
    return res.status(200).json({code: 1, message: "Pasaste la autenticación"});
});

account.post('/update/confirmpassword', async (req, res, next) => {
    const { password } = req.body;
    const user_id = req.user.user_id;

    if (password) {
        // Obtener el hash de la contraseña almacenada en la base de datos
        let query = `SELECT password FROM users WHERE user_id = '${user_id}'`;
        const rows = await db.query(query);

        if (rows.length > 0) {
            const storedPasswordHash = rows[0].password;

            // Comparar la contraseña ingresada con el hash almacenado
            try {
                const isMatch = await argon2.verify(storedPasswordHash, password);
                if (isMatch) {
                    return res.status(200).json({ code: 200, message: "Contraseña correcta" });
                } else {
                    return res.status(400).json({ code: 400, message: "Contraseña incorrecta" });
                }
            } catch (err) {
                return res.status(500).json({ code: 500, message: "Error al verificar la contraseña", error: err.message });
            }
        } else {
            return res.status(400).json({ code: 400, message: "Usuario no encontrado" });
        }
    } else {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }
});

account.put('/update/password', async (req, res, next) => {
    const { password } = req.body;
    const user_id = req.user.user_id;

    if (password) {
        try {
            // Hashear la nueva contraseña antes de almacenarla
            const hashedPassword = await argon2.hash(password);

            // Actualizar la contraseña en la base de datos
            const query = `UPDATE users SET password = '${hashedPassword}' WHERE user_id = ${user_id}`;
            const result = await db.query(query);

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
});

account.put('/update/email', async (req, res, next) => {
    const {email} = req.body;
    const user_id = req.user.user_id;

    if (email) {

        // Verificar que el email no esté en uso
        let query = `SELECT * FROM users WHERE email = '${email}' AND user_id != ${user_id}`;
        const existingUser = await db.query(query);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'El correo electrónico ya está en uso.' });
        }else {

            // Actualizar correo
            query = `UPDATE users SET email = '${email}' WHERE user_id = ${user_id}`;
            const rows = await db.query(query);
            if (rows.affectedRows == 1) {
                return res.status(200).json({code: 200, message: "Usuario actualizado correctamente"});
            }
        }
        return res.status(500).json({code: 500, message: "Ocurrió un error"});
    }
    return res.status(400).json({code: 400, message: "Campos incompletos"});
});

account.put('/update/username', async (req, res, next) => {
    const {username} = req.body;
    const user_id = req.user.user_id;

    if (username) {

        // Verificar que el username no esté en uso
        let query = `SELECT * FROM users WHERE username = '${username}' AND user_id != ${user_id}`;
        const existingUser = await db.query(query);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
        }else {

            // Actualizar correo
            query = `UPDATE users SET username = '${username}' WHERE user_id = ${user_id}`;
            const rows = await db.query(query);
            if (rows.affectedRows == 1) {
                return res.status(200).json({code: 200, message: "Usuario actualizado correctamente"});
            }
        }
        return res.status(500).json({code: 500, message: "Ocurrió un error"});
    }
    return res.status(400).json({code: 400, message: "Campos incompletos"});
});

account.delete('/delete', async (req, res, next) => {
    const user_id = req.user.user_id;
    let query = `DELETE FROM users WHERE user_id = ${user_id}`;
    const rows = await db.query(query);

    if (rows.affectedRows == 1) {
        return res.status(200).json({code: 200, message: "Usuario eliminado correctamente"});
    }
    return res.status(500).json({code: 500, message: "Ocurrió un error"});
});

module.exports = account;