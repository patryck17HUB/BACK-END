const db = require('../config/database');
const argon2 = require('argon2');

async function findUser(googleID) {
  try {

    let query = `SELECT * FROM users WHERE googleID = '${googleID}'`;
    const existingUser = await db.query(query);
    if (existingUser.length === 1) {
      const roleQuery = `
          SELECT roles.role_name 
          FROM userroles 
          JOIN roles ON userroles.role_id = roles.role_id 
          JOIN users ON userroles.user_id = users.user_id
          WHERE users.googleID = '${googleID}'`;
      const roleRows = await db.query(roleQuery);
      if (roleRows.length > 0) {
        const userRole = roleRows[0].role_name;

        return { user: existingUser[0], isNewUser: false, role: userRole };
      } else {
        throw new Error('Rol de usuario no encontrado');
      }
    }
    return { user: null, isNewUser: true };
  } catch (error) {
    throw error;
  }
}

async function createUser({ googleID, username, first_name, last_name, email }) {
  try {
    // Verificar si el nombre de usuario o el email ya están en uso
    if (!username || !first_name || !last_name || !email) {
      throw new Error('Datos insuficientes para crear un nuevo usuario');
    }

    const [existingUsername] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (Array.isArray(existingUsername) && existingUsername.length > 0) {
      throw new Error('El nombre de usuario ya está en uso.');
    }

    const [existingEmail] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (Array.isArray(existingEmail) && existingEmail.length > 0) {
      throw new Error('El correo electrónico ya está en uso.');
    }

    // Generar una contraseña aleatoria para el usuario
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await argon2.hash(randomPassword);

    let query = "INSERT INTO users (username, password, email, first_name, last_name, googleID) ";
    query += `VALUES ('${username}', '${hashedPassword}', '${email}', '${first_name}', '${last_name}', '${googleID}')`;
    const result = await db.query(query);

    if (result.affectedRows === 1) {
      const userID = result.insertId;
      // Obtener el rol de cliente
      const roleQuery = "SELECT role_id FROM roles WHERE role_name = 'client'";
      const roleResult = await db.query(roleQuery);

      if (roleResult.length === 1) {
        const roleId = roleResult[0].role_id;

        // Insertar en la tabla UserRoles
        let userRoleQuery = "INSERT INTO userroles (user_id, role_id) ";
        userRoleQuery += `VALUES (${userID}, ${roleId})`;
        await db.query(userRoleQuery);

        const query = `SELECT * FROM users WHERE user_id = '${userID}'`;
        return await db.query(query);
      } else {
        throw new Error('No se encontró el rol de cliente');
      }
    } else {
      throw new Error('Ocurrió un error al registrar el usuario.');
    }

  } catch (error) {
    throw error;
  }
}

module.exports = {
  findUser,
  createUser,
};