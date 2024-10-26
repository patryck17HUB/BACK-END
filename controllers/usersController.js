const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const { users, userroles, roles } = require('../models/init-models')(require('../config/database'));

// Registro de usuario
const signUp = async (req, res) => {
    const { username, password, email, first_name, last_name } = req.body;

    if (!username || !password || !email || !first_name || !last_name) {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }

    try {
        // Verificar si el username ya está en uso
        const existingUsername = await users.findOne({ where: { username } });
        if (existingUsername) {
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
        }

        // Verificar si el email ya está en uso
        const existingEmail = await users.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ message: 'El correo electrónico ya está en uso.' });
        }

        // Hashear la contraseña antes de guardarla
        const hashedPassword = await argon2.hash(password);

        // Insertar nuevo usuario
        const newUser = await users.create({
            username,
            password: hashedPassword,
            email,
            first_name,
            last_name,
        });

        const role = await roles.findOne({ where: { role_name: 'client' } });
        if (!role) {
            return res.status(500).json({ code: 500, message: "No se encontró el rol de cliente" });
        }

        await userroles.create({
            user_id: newUser.user_id,
            role_id: role.role_id,
        });

        return res.status(201).json({ code: 201, message: "Usuario registrado correctamente con rol de cliente" });

    } catch (error) {
        return res.status(500).json({ code: 500, message: "Ocurrió un error en el servidor", error: error.message });
    }
};

// Inicio de sesión
const logIn = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }

    try {
        const user = await users.findOne({ where: { username } });

        if (!user) {
            return res.status(401).json({ code: 401, message: "Usuario y/o contraseña incorrectos" });
        }

        const isMatch = await argon2.verify(user.password, password);

        if (!isMatch) {
            return res.status(401).json({ code: 401, message: "Usuario y/o contraseña incorrectos" });
        }

        const roleRows = await userroles.findAll({
            where: { user_id: user.user_id },
            include: {
                model: roles,
                as: 'role', // Asegúrate de que el alias coincida con lo que definiste en init-models.js
                attributes: ['role_name'] // Incluye solo el campo que necesitas
            }
        });

        if (roleRows.length === 0) {
            return res.status(401).json({ code: 401, message: "Rol de usuario no encontrado" });
        }

        const userRole = roleRows[0].role.role_name; // Acceder al nombre del rol
        const token = jwt.sign({
            user_id: user.user_id,
            role: userRole
        }, "debugkey", { expiresIn: "1h" });

        return res.status(200).json({ code: 200, message: token });

    } catch (error) {
        return res.status(500).json({ code: 500, message: "Ocurrió un error en el servidor", error: error.message });
    }
};


module.exports = {
    signUp,
    logIn
};


/*const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const db = require('../config/database');

// Registro de usuario
const signUp = async (req, res) => {
    const { username, password, email, first_name, last_name } = req.body;

    if (!username || !password || !email || !first_name || !last_name) {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }

    try {
        // Verificar si el username ya está en uso
        const existingUsername = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUsername.length > 0) {
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
        }

        // Verificar si el email ya está en uso
        const existingEmail = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            return res.status(400).json({ message: 'El correo electrónico ya está en uso.' });
        }

        // Hashear la contraseña antes de guardarla
        const hashedPassword = await argon2.hash(password);

        // Insertar nuevo usuario
        const result = await db.query(
            'INSERT INTO users (username, password, email, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
            [username, hashedPassword, email, first_name, last_name]
        );

        if (result.affectedRows !== 1) {
            return res.status(500).json({ code: 500, message: "Ocurrió un error al registrar el usuario" });
        }

        const userId = result.insertId; // Obtener el user_id del nuevo usuario

        const roleResult = await db.query('SELECT role_id FROM roles WHERE role_name = ?', ['client']);
        if (roleResult.length === 0) {
            return res.status(500).json({ code: 500, message: "No se encontró el rol de cliente" });
        }

        const roleId = roleResult[0].role_id;
        await db.query('INSERT INTO userroles (user_id, role_id) VALUES (?, ?)', [userId, roleId]);

        return res.status(201).json({ code: 201, message: "Usuario registrado correctamente con rol de cliente" });

    } catch (error) {
        return res.status(500).json({ code: 500, message: "Ocurrió un error en el servidor", error: error.message });
    }
};

// Inicio de sesión
const logIn = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }

    try {
        const rows = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length !== 1) {
            return res.status(401).json({ code: 401, message: "Usuario y/o contraseña incorrectos" });
        }

        const storedPasswordHash = rows[0].password;
        const isMatch = await argon2.verify(storedPasswordHash, password);

        if (!isMatch) {
            return res.status(401).json({ code: 401, message: "Usuario y/o contraseña incorrectos" });
        }

        const roleRows = await db.query(`
            SELECT roles.role_name 
            FROM userroles 
            JOIN roles ON userroles.role_id = roles.role_id 
            WHERE userroles.user_id = ?`,
            [rows[0].user_id]
        );

        if (roleRows.length === 0) {
            return res.status(401).json({ code: 401, message: "Rol de usuario no encontrado" });
        }

        const userRole = roleRows[0].role_name;
        const token = jwt.sign({
            user_id: rows[0].user_id,
            role: userRole
        }, "debugkey", { expiresIn: "1h" });

        return res.status(200).json({ code: 200, message: token });

    } catch (error) {
        return res.status(500).json({ code: 500, message: "Ocurrió un error en el servidor", error: error.message });
    }
};

module.exports = {
    signUp,
    logIn
};
*/