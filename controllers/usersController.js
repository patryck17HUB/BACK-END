const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const db = require('../config/database');

// Registro de usuario
const signUp = async (req, res) => {
    const { username, password, email, first_name, last_name } = req.body;

    if (username && password && email && first_name && last_name) {
        try {
            // Verificar si el username ya está en uso
            const query1 = `SELECT * FROM users WHERE username = ?`;
            const existingUsername = await db.query(query1, [username]);
            if (existingUsername.length > 0) {
                return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
            }

            // Verificar si el email ya está en uso
            const query2 = `SELECT * FROM users WHERE email = ?`;
            const existingEmail = await db.query(query2, [email]);
            if (existingEmail.length > 0) {
                return res.status(400).json({ message: 'El correo electrónico ya está en uso.' });
            }

            // Hashear la contraseña antes de guardarla
            const hashedPassword = await argon2.hash(password);

            // Insertar nuevo usuario
            let query = `INSERT INTO users (username, password, email, first_name, last_name) VALUES (?, ?, ?, ?, ?)`;
            const result = await db.query(query, [username, hashedPassword, email, first_name, last_name]);

            if (result.affectedRows == 1) {
                const userId = result.insertId; // Obtener el user_id del nuevo usuario

                const roleQuery = `SELECT role_id FROM roles WHERE role_name = 'client'`;
                const roleResult = await db.query(roleQuery);

                if (roleResult.length > 0) {
                    const roleId = roleResult[0].role_id;

                    // Insertar en la tabla UserRoles
                    let userRoleQuery = `INSERT INTO userroles (user_id, role_id) VALUES (?, ?)`;
                    await db.query(userRoleQuery, [userId, roleId]);

                    return res.status(201).json({ code: 201, message: "Usuario registrado correctamente con rol de cliente" });
                } else {
                    return res.status(500).json({ code: 500, message: "No se encontró el rol de cliente" });
                }
            } else {
                return res.status(500).json({ code: 500, message: "Ocurrió un error al registrar el usuario" });
            }
        } catch (error) {
            return res.status(500).json({ code: 500, message: "Ocurrió un error en el servidor", error: error.message });
        }
    } else {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }
};

// Inicio de sesión
const signIn = async (req, res) => {
    const { username, password } = req.body;

    if (username && password) {
        try {
            const query = `SELECT * FROM users WHERE username = ?`;
            const rows = await db.query(query, [username]);

            if (rows.length == 1) {
                const storedPasswordHash = rows[0].password;

                // Verificar la contraseña ingresada con el hash almacenado
                const isMatch = await argon2.verify(storedPasswordHash, password);

                if (isMatch) {
                    // Obtener el rol del usuario
                    const roleQuery = `
                        SELECT roles.role_name 
                        FROM userroles 
                        JOIN roles ON userroles.role_id = roles.role_id 
                        WHERE userroles.user_id = ?`;
                    const roleRows = await db.query(roleQuery, [rows[0].user_id]);

                    if (roleRows.length > 0) {
                        const userRole = roleRows[0].role_name;

                        // Generar el token con el rol en el payload
                        const token = jwt.sign({
                            user_id: rows[0].user_id,
                            role: userRole
                        }, "debugkey", {
                            expiresIn: "1h"
                        });

                        return res.status(200).json({ code: 200, message: token });
                    } else {
                        return res.status(401).json({ code: 401, message: "Rol de usuario no encontrado" });
                    }
                } else {
                    return res.status(401).json({ code: 401, message: "Usuario y/o contraseña incorrectos" });
                }
            } else {
                return res.status(401).json({ code: 401, message: "Usuario y/o contraseña incorrectos" });
            }
        } catch (error) {
            return res.status(500).json({ code: 500, message: "Ocurrió un error en el servidor", error: error.message });
        }
    } else {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }
};

module.exports = {
    signUp,
    signIn
};
