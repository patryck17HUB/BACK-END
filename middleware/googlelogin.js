const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
require('./googleauth');
const { findUser, createUser } = require('./login');

const googlelogin = express.Router();

function isLoggedIn(req, res, next) {
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
}

// Inicializa Passport
googlelogin.use(passport.initialize());

// Ruta para iniciar la autenticación con Google
googlelogin.get('/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

// Callback de Google
googlelogin.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
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
  }
);

// Ruta para completar el registro del usuario con los datos adicionales
googlelogin.post('/complete-registration', async (req, res) => {
  const { googleId, username, first_name, last_name, email } = req.body;

  if (!googleId || !username || !first_name || !last_name || !email) {
    return res.status(400).json({ message: 'Faltan datos de usuario (googleId, username, first_name, last_name, email).' });
  }

  try {
    const user = await createUser({
      googleID: googleId,
      username,
      first_name,
      last_name,
      email
    });

    const token = jwt.sign({
      id: user.user_id,
      googleId: user.googleID
    }, 'debugkey', { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    return res.status(500).json({ message: 'Error al completar el registro del usuario.', error: err.message });
  }
});

// Verificación de autenticación
googlelogin.get('/isloggedin', isLoggedIn, (req, res) => {
  res.json({ isAuthenticated: true });
});

// Cierre de sesión
googlelogin.get('/logout', (req, res) => {
  res.send('Logout successful');
});

// Ruta en caso de fallo en la autenticación
googlelogin.get('/auth/google/failure', (req, res) => {
  res.send('Failed to authenticate..');
});

// Información del usuario autenticado
googlelogin.get('/userinfo', isLoggedIn, (req, res) => {
  res.json({
    userID: req.user.id,
    googleId: req.user.googleId,
  });
});

module.exports = googlelogin;
