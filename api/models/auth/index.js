// class SignInResponse {
//   constructor({ token }) {
//     this.token = token;
//   }
// }

class SignInResponse {
  constructor({
    token, refreshToken, expiresIn, email, id, message,
  }) {
    this.token = token;
    this.tokenType = 'Bearer';
    this.refreshToken = refreshToken;
    this.expiresIn = expiresIn;
    this.email = email;
    this.id = id;
    this.message = message;
  }
}

module.exports = {
  SignInResponse,
};
