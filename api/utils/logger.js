

/**
 * Code imported from `pino-http`
 * Repo: https://github.com/pinojs/pino-http
 * License: MIT (https://raw.githubusercontent.com/pinojs/pino-http/master/LICENSE)
 */

const pino = require('pino');

const { serializersSym } = pino.symbols;
const FST_ERR_LOG_INVALID_DESTINATION = 'Cannot specify both logger.stream and logger.file options';

function createLogger(opts, stream) {
  stream = stream || opts.stream;
  delete opts.stream;

  if (stream && opts.file) {
    throw new Error(FST_ERR_LOG_INVALID_DESTINATION);
  } else if (opts.file) {
    // we do not have stream
    stream = pino.destination(opts.file);
    delete opts.file;
  }

  const prevLogger = opts.logger;
  const prevGenReqId = opts.genReqId;
  let logger = null;

  if (prevLogger) {
    opts.logger = undefined;
    opts.genReqId = undefined;
    // we need to tap into pino internals because in v5 it supports
    // adding serializers in child loggers
    if (prevLogger[serializersSym]) {
      opts.serializers = Object.assign({}, opts.serializers, prevLogger[serializersSym]);
    }
    logger = prevLogger.child(opts);
    opts.logger = prevLogger;
    opts.genReqId = prevGenReqId;
  } else {
    logger = pino(opts, stream);
  }

  return logger;
}

const serializers = {
  req: function asReqValue(req) {
    return {
      method: req.method,
      url: req.url,
      version: req.headers['accept-version'],
      headers: req.headers,
      hostname: req.hostname,
      remoteAddress: req.ip,
      remotePort: req.connection.remotePort,
    };
  },
  err: pino.stdSerializers.err,
  res: function asResValue(res) {
    return {
      statusCode: res.statusCode,
    };
  },
};

function now() {
  const ts = process.hrtime();
  return (ts[0] * 1e3) + (ts[1] / 1e6);
}

module.exports = {
  createLogger,
  serializers,
  now,
};
