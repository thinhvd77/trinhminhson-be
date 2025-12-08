const levels = ["error", "warn", "info", "debug"];

function createLogger(level = "info") {
  const currentIndex = levels.indexOf(level);

  const shouldLog = (lvl) => levels.indexOf(lvl) <= currentIndex;

  return {
    error: (...args) => shouldLog("error") && console.error("[ERROR]", ...args),
    warn: (...args) => shouldLog("warn") && console.warn("[WARN]", ...args),
    info: (...args) => shouldLog("info") && console.info("[INFO]", ...args),
    debug: (...args) => shouldLog("debug") && console.debug("[DEBUG]", ...args),
  };
}

module.exports = { createLogger };
