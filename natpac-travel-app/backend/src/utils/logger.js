const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const CURRENT_LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] || LOG_LEVELS.INFO;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  gray: '\x1b[90m'
};

// Format timestamp
const getTimestamp = () => {
  return new Date().toISOString();
};

// Format log message
const formatMessage = (level, message, meta = {}) => {
  const timestamp = getTimestamp();
  const logEntry = {
    timestamp,
    level,
    message,
    ...meta
  };
  
  return JSON.stringify(logEntry);
};

// Write to file
const writeToFile = (level, formattedMessage) => {
  const date = new Date().toISOString().split('T')[0];
  const filename = path.join(logsDir, `natpac-travel-${date}.log`);
  
  fs.appendFileSync(filename, formattedMessage + '\n');
  
  // Also write errors to separate error log
  if (level === 'ERROR') {
    const errorFilename = path.join(logsDir, `natpac-travel-error-${date}.log`);
    fs.appendFileSync(errorFilename, formattedMessage + '\n');
  }
};

// Console output with colors
const writeToConsole = (level, message, meta = {}) => {
  const timestamp = getTimestamp();
  let color = colors.reset;
  
  switch (level) {
    case 'ERROR':
      color = colors.red;
      break;
    case 'WARN':
      color = colors.yellow;
      break;
    case 'INFO':
      color = colors.blue;
      break;
    case 'DEBUG':
      color = colors.gray;
      break;
  }
  
  const metaString = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  console.log(`${color}[${timestamp}] ${level}: ${message}${metaString}${colors.reset}`);
};

// Main logging function
const log = (level, message, meta = {}) => {
  const levelValue = LOG_LEVELS[level];
  
  if (levelValue > CURRENT_LOG_LEVEL) {
    return;
  }
  
  const formattedMessage = formatMessage(level, message, meta);
  
  // Write to file in production, console in development
  if (process.env.NODE_ENV === 'production') {
    writeToFile(level, formattedMessage);
  } else {
    writeToConsole(level, message, meta);
  }
  
  // Always write errors and warnings to file
  if (level === 'ERROR' || level === 'WARN') {
    writeToFile(level, formattedMessage);
  }
};

// Specific log level functions
const error = (message, meta = {}) => {
  if (message instanceof Error) {
    meta.stack = message.stack;
    message = message.message;
  }
  log('ERROR', message, meta);
};

const warn = (message, meta = {}) => {
  log('WARN', message, meta);
};

const info = (message, meta = {}) => {
  log('INFO', message, meta);
};

const debug = (message, meta = {}) => {
  log('DEBUG', message, meta);
};

// Request logger middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, url, ip } = req;
  
  // Log request
  info(`${method} ${url}`, {
    ip,
    userAgent: req.headers['user-agent'],
    userId: req.user?.id
  });
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    const level = statusCode >= 400 ? 'WARN' : 'INFO';
    log(level, `${method} ${url} ${statusCode}`, {
      duration: `${duration}ms`,
      ip,
      userId: req.user?.id
    });
    
    originalEnd.call(res, chunk, encoding);
  };
  
  next();
};

// Performance logger
const perfLogger = (operation, duration, meta = {}) => {
  const level = duration > 1000 ? 'WARN' : 'INFO';
  log(level, `Performance: ${operation}`, {
    duration: `${duration}ms`,
    ...meta
  });
};

// Database query logger
const queryLogger = (query, duration, rows, error = null) => {
  const meta = {
    query: query.substring(0, 100),
    duration: `${duration}ms`,
    rows
  };
  
  if (error) {
    error(`Database query failed`, { ...meta, error: error.message });
  } else {
    debug(`Database query executed`, meta);
  }
};

// Log rotation - clean up old logs
const rotateLogs = () => {
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  const now = Date.now();
  
  fs.readdir(logsDir, (err, files) => {
    if (err) return;
    
    files.forEach(file => {
      const filePath = path.join(logsDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlink(filePath, (err) => {
            if (err) {
              error('Failed to delete old log file', { file, error: err.message });
            } else {
              info('Deleted old log file', { file });
            }
          });
        }
      });
    });
  });
};

// Run log rotation daily
if (process.env.NODE_ENV === 'production') {
  setInterval(rotateLogs, 24 * 60 * 60 * 1000);
}

module.exports = {
  error,
  warn,
  info,
  debug,
  requestLogger,
  perfLogger,
  queryLogger,
  rotateLogs
};