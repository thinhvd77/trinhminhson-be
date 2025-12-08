const morgan = require("morgan");

// HTTP request logger middleware
// Combined: remote addr, method, url, status, response length, response time
const requestLogger = morgan(":method :url :status :res[content-length] - :response-time ms");

module.exports = { requestLogger };
