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

module.exports = {
  getBearerToken,
};
