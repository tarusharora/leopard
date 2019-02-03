const jwt = require('jsonwebtoken');
const nconf = require('nconf');

const userJwtExpiry = nconf.get('userJwtExpiry');
const jwtSecret = nconf.get('secrets.jwt');

const getBearerToken = ({ payload }) => new Promise((resolve, reject) => {
  jwt.sign(payload, jwtSecret, { expiresIn: userJwtExpiry }, (err, token) => {
    if (err) return reject(err);
    resolve(token);
  });
});
const getBearToken = ({ payload }, next) => new Promise((resolve, reject) => {
  jwt.sign(payload, jwtSecret, { expiresIn: userJwtExpiry }, (err, token) => {
    if (err) return reject(err);
    resolve(token);
  });
  return next();
});
const sendToken = (req, res) => {
  res.setHeader('x-auth-token', req.token);
  return res.status(200).send(JSON.stringify(req.user));
};

module.exports = {
  getBearerToken,
  sendToken,
  getBearToken,
};
