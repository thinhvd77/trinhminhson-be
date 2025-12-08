class ApiResponse {
  static success(data, message = 'Success', statusCode = 200) {
    return {
      success: true,
      message,
      data,
      statusCode
    };
  }

  static error(message = 'Error', statusCode = 500, errors = null) {
    return {
      success: false,
      message,
      statusCode,
      ...(errors && { errors })
    };
  }

  static paginated(data, page, limit, total) {
    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = { ApiResponse };
