const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const configuredLevel = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info;

function emit(level, message, meta) {
  if (LEVELS[level] > configuredLevel) return;

  const line = `${new Date().toISOString()} [${level.toUpperCase()}] ${message}`;
  const stream = level === 'error' || level === 'warn' ? console.error : console.log;

  if (meta === undefined) {
    stream(line);
  } else {
    stream(line, meta);
  }
}

export const logger = {
  error: (message, meta) => emit('error', message, meta),
  warn: (message, meta) => emit('warn', message, meta),
  info: (message, meta) => emit('info', message, meta),
  debug: (message, meta) => emit('debug', message, meta),
};
