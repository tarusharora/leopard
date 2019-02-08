const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const nconf = require('nconf');
const { get: _get } = require('lodash');


const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  facebookProvider: {
    type: {
      id: String,
      token: String,
    },
    select: false,
  },
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  facebook: String,
  twitter: String,
  google: String,
  github: String,
  instagram: String,
  linkedin: String,
  steam: String,
  tokens: Array,
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  profile: {
    firstName: String,
    lastName: String,
    displayName: String,
    gender: String,
    location: String,
    website: String,
    picture: String,
    avatarUrl: String,
  },
}, { timestamps: true });


// plug in stripe billing
const isStripePaymentEnabled = nconf.get('isStripePaymentEnabled');
if (isStripePaymentEnabled) {
  const stripe = require('../stripe/Stripe');
  userSchema.plugin(stripe);
}

userSchema.statics.upsertFbUser = function (accessToken, refreshToken, profile, cb) {
  const User = this;
  return this.findOne({
    'facebookProvider.id': profile.id,
  }, (err, user) => {
    // no user was found, lets create a new one
    const email = _get(profile, 'emails[0].value', '');
    if (!user && email) {
      const newUser = new User({
        fullName: profile.displayName,
        email,
        facebookProvider: {
          id: profile.id,
          token: accessToken,
        },
      });

      newUser.save((error, savedUser) => cb(error, savedUser));
    } else {
      return cb(err, user);
    }
  });
};


/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, (error, hash) => {
      if (error) { return next(error); }
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      if (err) { reject(err); }
      resolve(isMatch);
    });
  });
};

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function gravatar(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
