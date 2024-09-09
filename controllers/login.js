const db = require('../config/database');
const argon2 = require('argon2');

async function findUser(googleID) {
  try {
    let query = `SELECT * FROM users WHERE googleID = ?`;
    const existingUser = await db.query(query, [googleID]);

    if (existingUser.length === 1) {
      roleQuery = `
        SELECT roles.role_name 
        FROM userroles 
        JOIN roles ON userroles.role_id = roles.role_id 
        WHERE userroles.user_id = ?`;
      const roleRows = await db.query(roleQuery, [existingUser[0].user_id]);

      if (roleRows.length > 0) {
        const userRole = roleRows[0].role_name;
        return { status: 200, user: existingUser[0], isNewUser: false, role: userRole };
      } else {
        return { status: 404, error: 'Rol de usuario no encontrado' };
      }
    }

    return { status: 404, user: null, isNewUser: true };
  } catch (error) {
    return { status: 500, error: 'Error al buscar el usuario', details: error.message };
  }
}

async function createUser({ googleID, username, first_name, last_name, email }) {
  try {
    if (!username || !first_name || !last_name || !email) {
      return { status: 400, error: 'Datos insuficientes para crear un nuevo usuario' };
    }

    let usernameQuery = `SELECT * FROM users WHERE username = ?`;
    const existingUsername = await db.query(usernameQuery, [username]);
    if (existingUsername.length > 0) {
      return { status: 400, error: 'El nombre de usuario ya está en uso.' };
    }

    emailQuery = `SELECT * FROM users WHERE email = ?`;
    const existingEmail = await db.query(emailQuery, [email]);
    if (existingEmail.length > 0) {
      return { status: 400, error: 'El correo electrónico ya está en uso.' };
    }

    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await argon2.hash(randomPassword);

    let insertUserQuery = `
      INSERT INTO users (username, password, email, first_name, last_name, googleID) 
      VALUES (?, ?, ?, ?, ?, ?)`;
    const result = await db.query(insertUserQuery, [username, hashedPassword, email, first_name, last_name, googleID]);

    if (result.affectedRows === 1) {
      const userID = result.insertId;

      roleQuery = "SELECT role_id FROM roles WHERE role_name = ?";
      const roleResult = await db.query(roleQuery, ['client']);

      if (roleResult.length === 1) {
        const roleId = roleResult[0].role_id;

        let insertRoleQuery = "INSERT INTO userroles (user_id, role_id) VALUES (?, ?)";
        await db.query(insertRoleQuery, [userID, roleId]);

        let userQuery = `SELECT * FROM users WHERE user_id = ?`;
        const user = await db.query(userQuery, [userID]);

        return { status: 201, user: user[0] };
      } else {
        return { status: 500, error: 'No se encontró el rol de cliente' };
      }
    } else {
      return { status: 500, error: 'Ocurrió un error al registrar el usuario.' };
    }
  } catch (error) {
    return { status: 500, error: 'Error al crear el usuario', details: error.message };
  }
}

module.exports = {
  findUser,
  createUser,
};
