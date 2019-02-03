module.exports = {
  facebookAuth: {
    clientID: '285967122092096',
    clientSecret: 'a2638a4059a29f1e66b140503a2085e5',
    callbackURL: 'http://localhost:4000/api/auth/facebook/callback',
    profileURL: 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',

  },

  twitterAuth: {
    consumerKey: 'your-consumer-key-here',
    consumerSecret: 'your-client-secret-here',
    callbackURL: 'http://localhost:4000/auth/twitter/callback',
  },

  googleAuth: {
    clientID: 'your-clientID-here',
    clientSecret: 'your-client-secret-here',
    callbackURL: 'http://localhost:4000/auth/google/callback',
  },
};
