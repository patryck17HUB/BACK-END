const express = require('express');
const passport = require('passport');
require('./googleauth');

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
  passport.authenticate('google', { session: false }), // No usamos sesiones
  (req, res) => {
    // Devuelve el token JWT al cliente
    res.json({ token: req.user.token });
  }
);

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
