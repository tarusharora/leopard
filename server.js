
const SwaggerExpress = require('swagger-express-mw');
const app = require('express')();
const cors = require('cors');


module.exports = app; // for testing

const config = {
  appRoot: __dirname, // required config
};
const corsOption = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token'],
};

const createServer = () => SwaggerExpress.create(config, (err, swaggerExpress) => {
  if (err) { throw err; }

  // install middleware
  const passport = require('./api/utils/passport');
  swaggerExpress.register(app);
  app.use(cors(corsOption));
  app.use(passport.initialize());

  // function errorHandler(err, req, res, next) {
  //   res.status(500);
  //   res.render('error', { error: err });
  //   next();
  // }
  // app.use(errorHandler);

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
