const jwt = require('jsonwebtoken');
const { findUser, createUser } = require('./login');

// Callback de Google
const googleCallback = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Error en la autenticación de Google.' });
  }

  try {
    // Llama a findUser para verificar si el usuario ya existe
    const { user, isNewUser, role } = await findUser(req.user.user.googleID);
    if (isNewUser) {
      return res.status(202).json({
        message: 'User needs to complete registration',
        isNewUser: true,
        user: {
          googleId: req.user.user.googleID,
          email: req.user.user.email
        }
      });
    }

    // Genera un token JWT para el usuario existente
    const token = jwt.sign({
      user_id: user.user_id,
      googleId: user.googleID,
      role: role
    }, 'debugkey', { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    return res.status(500).json({ message: 'Error al procesar el usuario.', error: err.message });
  }
};

// Completar registro del usuario
const completeRegistration = async (req, res) => {
  const { googleId, username, first_name, last_name, email } = req.body;

  if (!googleId || !username || !first_name || !last_name || !email) {
    return res.status(400).json({ message: 'Faltan datos de usuario (googleId, username, first_name, last_name, email).' });
  }

  try {
    // Crea un nuevo usuario
    const user = await createUser({
      googleID: googleId,
      username,
      first_name,
      last_name,
      email
    });

    if (user.status === 201) {
      // Genera un token JWT para el nuevo usuario
      const token = jwt.sign({
        id: user.user.user_id,
        googleId: user.user.googleID
      }, 'debugkey', { expiresIn: '1h' });

      return res.json({ token });
    } else {
      // Devuelve un error si la creación del usuario falla
      return res.status(user.status).json({ message: user.error });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Error al completar el registro del usuario.', error: err.message });
  }
};

// Verificación de autenticación
const isLoggedIn = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, 'debugkey', (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};


module.exports = {
  googleCallback,
  completeRegistration,
  isLoggedIn
};