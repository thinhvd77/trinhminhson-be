const { createApp } = require("./app");
const { config } = require("./shared/config/env");
const { logger } = require("./shared/utils/logger");

const app = createApp();

app.listen(config.port, '0.0.0.0', () => {
  logger.info(`Server running on http://0.0.0.0:${config.port}`);
});
