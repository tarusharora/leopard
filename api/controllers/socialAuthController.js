const passport = require('../utils/passport');

const { getBearerToken } = require('../utils/jwt');
const { SignInResponse } = require('../models/auth');

const facebookLogin = (req, res, next) => {
  passport.authenticate('facebook', {
    scope: ['email'],
    display: 'popup',
  })(req, res, next);
};

const facebookLoginRedirect = (req, res, next) => {
  try {
    passport.authenticate('facebook', {}, async (err, user) => {
      if (err) { return next(err); }
      const { id, email } = user;
      const token = await getBearerToken({
        payload: {
          userId: id,
        },
      });
      return res.send(new SignInResponse({ email, token, id }));
    })(req, res, next);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  facebookLogin,
  facebookLoginRedirect,
};
