const { ZodError } = require("zod");

// 404 handler
function notFoundHandler(req, res, next) {
  res.status(404).json({ message: "Resource not found" });
}

// Generic error handler
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors = Array.isArray(err.errors) 
      ? err.errors.map(e => ({
          field: Array.isArray(e.path) ? e.path.join('.') : String(e.path),
          message: e.message,
        }))
      : [];
    
    return res.status(400).json({
      message: "Validation error",
      errors,
    });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(status).json({ message });
}

module.exports = { notFoundHandler, errorHandler };
