export const loggerConfig = {
  development: {
    level: 'debug',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        translateTime: 'HH:MM:ss.l',
        singleLine: false,
      },
    },
  },
  production: {
    level: 'info',
    formatters: {
      level: (label: string) => {
        return { level: label.toUpperCase() }
      },
    },
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  },
  test: {
    level: 'silent',
  },
}

export function getLoggerConfig() {
  const env = process.env.NODE_ENV || 'development'
  
  if (env === 'test') return loggerConfig.test
  if (env === 'production') return loggerConfig.production
  
  // For development in Next.js, use basic config without transport
  if (typeof window === 'undefined') {
    // Server-side: use simple config
    return {
      level: 'debug',
      // Disable pretty printing to avoid worker issues
      formatters: {
        level: (label: string) => {
          return { level: label }
        },
      },
    }
  }
  
  return loggerConfig.development
}