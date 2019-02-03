const express = require('express');
const passport = require('passport');

const config = require('../utils/socialConfig');
require('../utils/passport');
const { getBearToken, sendToken } = require('../utils/jwt');

const facebookLogin = (req, res, next) => {
  try {
    passport.authenticate('facebook', { session: false }, (err, user) => {
      if (!req.user) {
        return res.send(401, 'User Not Authenticated');
      }
      req.auth = {
        id: res.user.id,
      };
      next();
    }, getBearToken, sendToken);
    //     next();
    // },  getBearerToken, sendToken);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  facebookLogin,
};
