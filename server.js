

const SwaggerExpress = require('swagger-express-mw');
const app = require('express')();


module.exports = app; // for testing

const config = {
  appRoot: __dirname, // required config
};

const createServer = () => SwaggerExpress.create(config, (err, swaggerExpress) => {
  const passport = require('./api/utils/passport');
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  app.use(passport.initialize());

  app.use((err, req, res, next) => {
    // Do logging and user-friendly error message display
    console.error(err);
    res.status(500).json({ error: err });
  });

  const port = process.env.PORT || 10010;
  app.listen(port);

  if (swaggerExpress.runner.swagger.paths['/hello']) {
    console.log(`try this:\ncurl http://127.0.0.1:${port}/hello?name=Scott`);
  }
});

module.exports.createServer = createServer;
