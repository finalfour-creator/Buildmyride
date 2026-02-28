import createError from "http-errors";

/**
 * Global error middleware. Logs error and sends safe response (no stack in production).
 * @param {Error} err
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export function errorHandler(err, req, res, next) {
  const status = err.status ?? err.statusCode ?? 500;
  const message = err.message ?? "Internal Server Error";

  if (res.headersSent) {
    return next(err);
  }

  if (req.app.get("env") === "development") {
    console.error(err);
  }

  res.status(status).json({
    error: message,
    ...(req.app.get("env") === "development" && err.stack && { stack: err.stack }),
  });
}
