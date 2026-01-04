const { createApp } = require("./app");
const { config } = require("./shared/config/env");
const { logger } = require("./shared/utils/logger");

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const app = createApp();

app.listen(config.port, '0.0.0.0', () => {
  logger.info(`Server running on http://0.0.0.0:${config.port}`);
});
