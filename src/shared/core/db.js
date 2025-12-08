const { drizzle } = require("drizzle-orm/node-postgres");
const { Pool } = require("pg");
const { config } = require("../config/env");
const { logger } = require("../utils/logger");

const pool = new Pool({
  connectionString: config.databaseUrl,
});

pool.on("error", (err) => {
  logger.error("Unexpected error on idle client", err);
  process.exit(-1);
});

const db = drizzle(pool);

module.exports = { db, pool };
