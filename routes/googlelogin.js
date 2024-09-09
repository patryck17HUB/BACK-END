const express = require('express');
const passport = require('passport');
require('../middleware/googleauth');
const {
  googleCallback,
  completeRegistration,
  isLoggedIn
} = require('../controllers/googleController');

const googlelogin = express.Router();

// Inicializa Passport
googlelogin.use(passport.initialize());

// Ruta para iniciar la autenticación con Google
googlelogin.get('/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

// Callback de Google
googlelogin.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  googleCallback
);

// Ruta para completar el registro del usuario con los datos adicionales
googlelogin.post('/complete-registration', completeRegistration);

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
