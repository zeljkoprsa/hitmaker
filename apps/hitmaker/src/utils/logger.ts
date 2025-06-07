/**
 * Logger utility for Metrodome
 *
 * Provides environment-aware logging with different log levels.
 * In production, only warnings and errors are logged by default.
 * In development, all logs are shown.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isProduction: boolean;
  private minLevel: LogLevel;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.minLevel = this.isProduction
      ? (process.env.REACT_APP_LOG_LEVEL as LogLevel) || 'warn'
      : 'debug';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    return levels[level] >= levels[this.minLevel];
  }

  debug(...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      if (this.isProduction) {
        // In production, we could send to a monitoring service instead
        // or just suppress completely
      } else {
        console.log('[DEBUG]', ...args);
      }
    }
  }

  info(...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log('[INFO]', ...args);
    }
  }

  warn(...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn('[WARN]', ...args);
    }
  }

  error(...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error('[ERROR]', ...args);
      // In production, you might want to send this to an error tracking service
    }
  }

  /**
   * Special logger for performance-critical timing logs
   * Only active in development or when debug level is enabled
   */
  performance(label: string, ...args: unknown[]): void {
    if (this.shouldLog('debug') && !this.isProduction) {
      console.log(`[PERF] ${label}`, ...args);
    }
  }

  /**
   * Enable debug mode even in production
   * Can be triggered by a special URL parameter or localStorage setting
   */
  enableDebugMode(): void {
    this.minLevel = 'debug';
    console.log('[LOGGER] Debug logging enabled');
  }
}

// Export singleton instance
export const logger = new Logger();
