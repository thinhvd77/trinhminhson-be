const { config } = require("./src/shared/config/env");

/** @type { import("drizzle-kit").Config } */
module.exports = {
  schema: "./src/modules/**/*.model.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: config.databaseUrl,
  },
};
