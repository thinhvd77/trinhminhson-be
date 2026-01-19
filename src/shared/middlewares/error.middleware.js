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

  // Build response object
  const response = { message };

  // Include additional error fields if present (for custom error codes)
  if (err.code) {
    response.code = err.code;
  }
  if (err.email) {
    response.email = err.email;
  }

  res.status(status).json(response);
}

module.exports = { notFoundHandler, errorHandler };
