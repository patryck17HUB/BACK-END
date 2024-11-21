const jwt = require('jsonwebtoken');
const { findUser, createUser } = require('./login');

// Callback de Google
const googleCallback = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Error en la autenticación de Google.' });
  }

  try {
    const { user, isNewUser, role } = await findUser(req.user.user.googleID);

    if (isNewUser === true) {
      // Redirigir a una ruta específica con la información de registro incompleto
      const registrationUrl = `https://banca-sppdl-bueno.vercel.app/google-callback?isNewUser=true&googleId=${req.user.user.googleID}&email=${req.user.user.email}`;
      return res.redirect(registrationUrl);
    }

    if (!user || !user.user_id) {
      return res.status(500).json({ message: 'Usuario no encontrado o error en datos de usuario.' });
    }

    // Genera el token JWT para el usuario
    const token = jwt.sign(
      {
        user_id: user.user_id,
        googleId: user.googleID,
        role: role,
      },
      'debugkey',
      { expiresIn: '1h' }
    );

    // Redirige al frontend con el token incluido en la URL
    const callbackUrl = `https://banca-sppdl-bueno.vercel.app/google-callback?token=${token}`;
    return res.redirect(callbackUrl);
  } catch (err) {
    console.error('Error in googleCallback:', err);
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
      google_id: googleId,
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