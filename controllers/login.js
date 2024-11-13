const { users, userroles, roles } = require('../models/init-models')(require('../config/database'));
const argon2 = require('argon2');

// Buscar usuario
async function findUser(googleID) {
  try {
    const existingUser = await users.findOne({ where: { googleID } });

    if (existingUser) {
      const roleRows = await userroles.findAll({
        where: { user_id: existingUser.user_id },
        include: {
          model: roles,
          as: 'role',
          attributes: ['role_name']
        }
      });

      if (roleRows.length > 0) {
        const userRole = roleRows[0].role.role_name;
        return { status: 200, user: existingUser, isNewUser: false, role: userRole };
      } else {
        return { status: 404, error: 'Rol de usuario no encontrado' };
      }
    }

    return { status: 404, user: null, isNewUser: true };
  } catch (error) {
    return { status: 500, error: 'Error al buscar el usuario', details: error.message };
  }
}

// Crear usuario
async function createUser({ googleID, username, first_name, last_name, email }) {
  try {
    if (!username || !first_name || !last_name || !email) {
      return { status: 400, error: 'Datos insuficientes para crear un nuevo usuario' };
    }

    const existingUsername = await users.findOne({ where: { username } });
    if (existingUsername) {
      return { status: 400, error: 'El nombre de usuario ya está en uso.' };
    }

    const existingEmail = await users.findOne({ where: { email } });
    if (existingEmail) {
      return { status: 400, error: 'El correo electrónico ya está en uso.' };
    }

    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await argon2.hash(randomPassword);

    const newUser = await users.create({
      username,
      password: hashedPassword,
      email,
      first_name,
      last_name,
      googleID
    });

    const role = await roles.findOne({ where: { role_name: 'client' } });
    if (!role) {
      return { status: 500, error: 'No se encontró el rol de cliente' };
    }

    await userroles.create({
      user_id: newUser.user_id,
      role_id: role.role_id
    });

    return { status: 201, user: newUser };
  } catch (error) {
    return { status: 500, error: 'Error al crear el usuario', details: error.message };
  }
}

module.exports = {
  findUser,
  createUser
};
