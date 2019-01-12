const nconf = require('nconf');
const db = require('./api/db');

const { appSettingsFilePath } = require('./config/config');
const { loadSettings } = require('./config/configurationAdaptor');
const server = require('./server');
const { configureHttpClient } = require('./api/utils//httpClient');

const startupProcess = () => new Promise((resolve) => {
  configureHttpClient({ timeout: nconf.get('externalRequestTimeoutMilliseconds') });
  const mongoURI = nconf.get('db.mongodb.uri');
  db.connectMongo(mongoURI);
  resolve();
});


loadSettings({ appSettingsPath: appSettingsFilePath })
  .then(startupProcess)
  .then(() => {
    const serverOptions = {
      passOnRequestHeaders: nconf.get('passOnRequestHeaders'),
    };
    server.createServer(serverOptions);
  })
  .catch((err) => {
    console.log(err);
    throw err;
  });
