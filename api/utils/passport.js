const passport = require('passport');

const { Strategy: LocalStrategy } = require('passport-local');

const TwitterTokenStrategy = require('passport-twitter-token');
const FacebookTokenStrategy = require('passport-facebook-token');
const GoogleTokenStrategy = require('passport-google-token').Strategy;
const User = require('../models/user/User');
const config = require('./socialConfig');

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
passport.use(new TwitterTokenStrategy({
  consumerKey: config.twitterAuth.consumerKey,
  consumerSecret: config.twitterAuth.consumerSecret,
  includeEmail: true,
},
((token, tokenSecret, profile, done) => {
  User.upsertTwitterUser(token, tokenSecret, profile, (err, user) => done(err, user));
})));

passport.use(new FacebookTokenStrategy({
  clientID: config.facebookAuth.clientID,
  clientSecret: config.facebookAuth.clientSecret,
},
(accessToken, refreshToken, profile, done) => {
  User.upsertFbUser(accessToken, refreshToken, profile, (err, user) => done(err, user));
}));

passport.use(new GoogleTokenStrategy({
  clientID: config.googleAuth.clientID,
  clientSecret: config.googleAuth.clientSecret,
},
((accessToken, refreshToken, profile, done) => {
  User.upsertGoogleUser(accessToken, refreshToken, profile, (err, user) => done(err, user));
})));

module.exports = passport;
