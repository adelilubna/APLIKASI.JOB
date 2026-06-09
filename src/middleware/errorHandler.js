exports.errorHandler = (err, req, res, next) => {
  const status = Number(err.status || err.statusCode) || 500;
  const message = err.message || "Internal Server Error";

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({
    message,
  });
};

