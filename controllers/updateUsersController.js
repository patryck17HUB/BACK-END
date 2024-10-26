const { users } = require('../models/init-models')(require('../config/database'));
const argon2 = require('argon2');
const { Op } = require('sequelize'); // Importar Op para operadores de Sequelize

// Obtener detalles del usuario
const getUserDetails = async (req, res) => {
    const user_id = req.user.user_id;

    try {
        const user = await users.findOne({
            where: { user_id },
            attributes: ['username', 'email', 'first_name', 'last_name'] // Solo los campos que necesitas
        });

        if (user) {
            return res.status(200).json({ code: 200, message: user });
        }
        return res.status(404).json({ code: 404, message: "Usuario no encontrado" });
    } catch (error) {
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
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
        const user = await users.findOne({
            where: { user_id },
            attributes: ['password'] // Solo el campo de la contraseña
        });

        if (user) {
            const isMatch = await argon2.verify(user.password, password);
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

        const [updated] = await users.update({ password: hashedPassword }, {
            where: { user_id }
        });

        return res.status(updated ? 200 : 500).json({ code: updated ? 200 : 500, message: updated ? "Contraseña actualizada correctamente" : "Error al actualizar la contraseña" });
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
        const existingUser = await users.findOne({
            where: { email, user_id: { [Op.ne]: user_id } } // Op.ne significa "no igual"
        });

        if (existingUser) {
            return res.status(400).json({ code: 400, message: "El correo electrónico ya está en uso." });
        }

        const [updated] = await users.update({ email }, { where: { user_id } });

        return res.status(updated ? 200 : 500).json({ code: updated ? 200 : 500, message: updated ? "Correo actualizado correctamente" : "Ocurrió un error" });
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
        const existingUser = await users.findOne({
            where: { username, user_id: { [Op.ne]: user_id } }
        });

        if (existingUser) {
            return res.status(400).json({ code: 400, message: "El nombre de usuario ya está en uso." });
        }

        const [updated] = await users.update({ username }, { where: { user_id } });

        return res.status(updated ? 200 : 500).json({ code: updated ? 200 : 500, message: updated ? "Nombre de usuario actualizado correctamente" : "Ocurrió un error" });
    } catch (error) {
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};

// Eliminar usuario
const deleteUser = async (req, res) => {
    const user_id = req.user.user_id;

    try {
        const deleted = await users.destroy({ where: { user_id } });

        return res.status(deleted ? 200 : 500).json({ code: deleted ? 200 : 500, message: deleted ? "Usuario eliminado correctamente" : "Ocurrió un error" });
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