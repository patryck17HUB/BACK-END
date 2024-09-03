global.GOOGLE_CLIENT_ID = "12186262901-7malkb5ij5np17tm5viqajaoa0eq2t2v.apps.googleusercontent.com";
global.GOOGLE_CLIENT_SECRET = "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";

const passport = require('passport');
const jwt = require('jsonwebtoken');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const { findOrCreate } = require('./login');

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/googlelogin/auth/google/callback",
    passReqToCallback: true
  },
  function(request, accessToken, refreshToken, profile, done) {
    console.log("PROFILEEEEEE"+profile);
    console.log("PROFILEEEEEE"+profile.id);
    findOrCreate({ googleID: profile.id }, function (err, user) {
      if (err) {
        return done(err);
      }
      // Genera el token JWT aquí
      const token = jwt.sign({ 
        id: user.userID, 
        googleId: user.googleID 
    }, 'debugkey', { 
        expiresIn: '1h' 
    });
      return done(null, { user, token });
    });
  }
));

module.exports = passport;
