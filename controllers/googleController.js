const jwt = require('jsonwebtoken');
const { findUser, createUser } = require('./login');

// Callback de Google
const googleCallback = async (req, res) => {
  if (!req.user) {
    console.log('No user found in request', req.user);  // Log para verificar si req.user existe
    return res.status(401).json({ message: 'Error en la autenticación de Google.' });
  }

  try {
    console.log('Google user:', req.user.user); // Log para verificar qué datos contiene req.user

    // Llama a findUser para verificar si el usuario ya existe
    const { user, isNewUser, role } = await findUser(req.user.user.googleID);

    console.log('findUser response:', { user, isNewUser, role });  // Log para revisar lo que retorna findUser

    if (isNewUser === true) {
      return res.status(202).json({
        message: 'User needs to complete registration',
        isNewUser: true,
        user: {
          googleId: req.user.user.googleID,
          email: req.user.user.email
        }
      });
    }

    // Asegúrate de que user.user_id esté definido antes de crear el token
    if (!user || !user.user_id) {
      console.log('User or user_id is undefined:', user);  // Log de depuración para verificar si user_id está presente
      return res.status(500).json({ message: 'Usuario no encontrado o error en datos de usuario.' });
    }

    // Genera un token JWT para el usuario existente
    const token = jwt.sign({
      user_id: user.user_id,
      googleId: user.googleID,
      role: role
    }, 'debugkey', { expiresIn: '1h' });

    console.log('Generated token:', token);  // Log para revisar el token generado

    res.json({ token });
  } catch (err) {
    console.error('Error in googleCallback:', err);  // Log para capturar el error en el bloque catch
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