function notFound(req, res, next) {
  const error = new Error(`Rota não encontrada: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    console.error(`[ERROR] ${statusCode} - ${err.message}`);
    if (statusCode >= 500) console.error(err.stack);
  }

  // PostgreSQL unique violation
  if (err.code === '23505') {
    const field = err.detail?.match(/\((.+?)\)/)?.[1] || 'campo';
    return res.status(409).json({ message: `O ${field} já está em uso.` });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ message: 'Referência inválida nos dados fornecidos.' });
  }

  res.status(statusCode).json({
    message: err.message || 'Erro interno do servidor.',
    ...((!isProduction && statusCode >= 500) && { stack: err.stack }),
  });
}

function createError(message, statusCode = 500) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

module.exports = { notFound, errorHandler, createError };
