global.GOOGLE_CLIENT_ID = "12186262901-7malkb5ij5np17tm5viqajaoa0eq2t2v.apps.googleusercontent.com";
global.GOOGLE_CLIENT_SECRET = "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";

const passport = require('passport');
const jwt = require('jsonwebtoken');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const { createUser } = require('../controllers/login');

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "http://bancasppdl.click/googlelogin/auth/google/callback",
  passReqToCallback: true
},
async function(request, accessToken, refreshToken, profile, done) {
  try {
    const { googleID } = profile;
    
    // Datos del perfil de Google
    const userData = {
      googleID: profile.id,
      email: profile.email,
      username: request.body.username, // Estos datos deben provenir del frontend
      first_name: request.body.first_name,
      last_name: request.body.last_name
    };

    // Verifica si los datos están presentes
    if (!userData.username || !userData.first_name || !userData.last_name || !userData.email) {
      // Si falta alguno de los datos, indica que se necesita completar el registro
      return done(null, { isNewUser: true, user: userData });
    }

    // Llama a createUser para buscar o crear el usuario en la base de datos
    const result = await createUser(userData);

    if (result.status === 201) {
      // Genera el token JWT
      const token = jwt.sign({
        id: result.user.user_id,
        googleId: result.user.googleID
      }, 'debugkey', {
        expiresIn: '1h'
      });

      return done(null, { user: result.user, token, isNewUser: false });
    } else {
      return done(new Error(result.error), null);
    }
  } catch (error) {
    return done(error);
  }
}));

module.exports = passport;
