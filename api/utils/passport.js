const passport = require('passport');

const { Strategy: LocalStrategy } = require('passport-local');

const User = require('../models/user/User');

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() }).exec();
    if (!user) {
      return done(null, false, { isUserFound: false });
    }
    const isMatch = await user.comparePassword(password);
    if (isMatch) {
      return done(null, user, { });
    }
    return done(null, false, { isUserFound: true, isPwdMatched: false });
  } catch (err) {
    done(err);
  }
  // User.findOne({ email: email.toLowerCase() }, (err, user) => {
  //   if (err) { return done(err); }
  //   if (!user) {
  //     return done(null, false, { msg: `Email ${email} not found.` });
  //   }
  //   //   const isMatch = await user.comparePassword(password);
  //   user.comparePassword(password, (err, isMatch) => {
  //     if (err) { return done(err); }
  //     if (isMatch) {
  //       return done(null, user);
  //     }
  //     return done(null, false, { msg: 'Invalid email or password.' });
  //   });
  // });
}));

module.exports = passport;
