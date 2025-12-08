const { createApp } = require("./app");
const { config } = require("./shared/config/env");
const { logger } = require("./shared/utils/logger");

const app = createApp();

app.listen(config.port, () => {
  logger.info(`Server running on http://localhost:${config.port}`);
});
