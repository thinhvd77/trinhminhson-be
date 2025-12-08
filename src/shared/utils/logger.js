const { createLogger } = require('../config/logger');
const { config } = require('../config/env');

const logger = createLogger(config.logLevel);

module.exports = { logger };
