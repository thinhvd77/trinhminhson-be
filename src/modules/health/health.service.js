const pkg = require("../../../package.json");

function getHealthStatus() {
  return {
    status: "ok",
    service: pkg.name || "api",
    version: pkg.version,
    timestamp: new Date().toISOString(),
  };
}

module.exports = { getHealthStatus };
