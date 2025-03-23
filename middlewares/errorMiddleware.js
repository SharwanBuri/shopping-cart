const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    status: false,
    message: err.message || "Internal Server Error",
    //stack: process.env.NODE_ENV === "development" ? err.stack : undefined, // Show stack only in dev mode
  });
};

module.exports = errorHandler;
