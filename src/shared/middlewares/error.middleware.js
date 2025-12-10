const { ZodError } = require("zod");

// 404 handler
function notFoundHandler(req, res, next) {
  res.status(404).json({ message: "Resource not found" });
}

// Generic error handler
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Log error for debugging
  console.error("Error:", err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code,
    }));

    console.error("Validation errors:", JSON.stringify(errors, null, 2));

    return res.status(400).json({
      message: "Validation error",
      errors,
    });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
}

module.exports = { notFoundHandler, errorHandler };
