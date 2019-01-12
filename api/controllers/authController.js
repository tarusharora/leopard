const nconf = require('nconf');
const passport = require('../utils/passport');

const User = require('../models/user/User');
const EmailVerifyToken = require('../models/user/EmailVerifyToken');
const { generateEmailVerifyEmail } = require('../models/user/EmailTemplate');
const { SignInResponse } = require('../models/auth');
const { INVALID_PASSWORD, USER_DOESNT_EXISTS, USER_EXISTS } = require('../models/Errors');
const { VERIFICATION_EMAIL_SENT } = require('../models/Messages');

const { getRandomBytes } = require('../utils/crypto');
const { sendEmail } = require('../utils/aws-ses');
const { getBearerToken } = require('../utils/jwt');

const isEmailVerificationEnabled = nconf.get('app.isEmailVerificationEnabled');

const userSignin = async (req, res, next) => {
  try {
    passport.authenticate('local', async (err, user, info) => {
      if (err) { return next(err); }
      const { isUserFound, isPwdMatched } = info;
      if (!user) {
        if (!isUserFound) {
          const error = new Error(USER_DOESNT_EXISTS);
          error.statusCode = 404;
          return next(error);
        }
        if (!isPwdMatched) {
          const error = new Error(INVALID_PASSWORD);
          error.statusCode = 400;
          return next(error);
        }
      }
      const { id, email } = user;
      const token = await getBearerToken({
        payload: {
          userId: id,
        },
      });
      return res.send(new SignInResponse({ email, token, id }));
    })(req, res, next);
  } catch (err) {
    next(err);
  }
};

const userSignup = async (req, res, next) => {
  const {
    email, password, firstName, lastName,
  } = req.body;
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      res.status(409);
      next(new Error(USER_EXISTS));
      return;
    }
    const user = new User({
      email: email.toLowerCase(),
      password,
    });
    user.profile.firstName = firstName;
    if (lastName) user.profile.lastName = lastName;
    const newUser = await user.save();
    const { id, email: userEmail } = newUser;

    if (isEmailVerificationEnabled) {
      const token = getRandomBytes(16);
      const emailVerifyToken = new EmailVerifyToken({
        userId: id,
        token,
      });
      await emailVerifyToken.save();
      const {
        mailContent, recipient, sender, subject,
      } = await generateEmailVerifyEmail({ email, token, userName: 'TBD' });
      await sendEmail({
        from: sender,
        to: recipient,
        message: mailContent,
        subject,
      });
      res.send(new SignInResponse({ email: userEmail, message: VERIFICATION_EMAIL_SENT, id }));
    } else {
      const token = await getBearerToken({
        payload: {
          userId: id,
        },
      });
      res.send(new SignInResponse({ email: userEmail, id, token }));
    }
  } catch (error) {
    res.send(error);
  }
};

const postSignup = (req, res, next) => userSignup(req, res, next);
const postLogin = (req, res, next) => userSignin(req, res, next);


module.exports = {
  postLogin,
  postSignup,
};
