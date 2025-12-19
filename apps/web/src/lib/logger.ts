/**
 * Tanjai Structured Logger
 */
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export const logger = {
  info: (message: string, meta?: any) => log('info', message, meta),
  warn: (message: string, meta?: any) => log('warn', message, meta),
  error: (message: string, meta?: any) => log('error', message, meta),
  debug: (message: string, meta?: any) => log('debug', message, meta),
};

function log(level: LogLevel, message: string, meta?: any) {
  const timestamp = new Date().toISOString();
  const data = {
    timestamp,
    level,
    message,
    ...(meta && { meta }),
  };

  if (process.env.NODE_ENV === 'production') {
    // In production, you might send this to Axiom, Datadog, or Supabase
    console.log(JSON.stringify(data));
  } else {
    const color = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : '\x1b[32m';
    console.log(`${color}[${timestamp}] ${level.toUpperCase()}:\x1b[0m ${message}`, meta || '');
  }
}
