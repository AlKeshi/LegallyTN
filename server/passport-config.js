const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    const user = getUserByEmail(email);
    if (!user) {
      return done(null, false, { message: 'No user found with this email' });
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid password' });
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    authenticateUser
  ));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    const user = getUserById(id);
    if (!user) {
      return done(new Error('User not found'));
    }
    // Only send non-sensitive user data
    const safeUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType
    };
    return done(null, safeUser);
  });
}

module.exports = initialize;