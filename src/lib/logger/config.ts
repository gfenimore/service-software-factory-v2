// src/lib/logger/config.ts
export const loggerConfig = {
    development: {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'HH:MM:ss.l',
          singleLine: false,
        },
      },
      level: 'debug',
    },
    production: {
      level: 'info',
      formatters: {
        level: (label: string) => {
          return { level: label.toUpperCase() }
        },
      },
      timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
      serializers: {
        error: (error: Error & { code?: string }) => {
          return {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code,
          }
        },
      },
    },
    test: {
      level: 'silent', // No logs during tests
    },
  }
  
  export function getLoggerConfig() {
    const env = process.env.NODE_ENV || 'development'
    
    if (env === 'test') return loggerConfig.test
    if (env === 'production') return loggerConfig.production
    return loggerConfig.development
  }