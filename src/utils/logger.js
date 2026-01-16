/**
 * Sistema de Logging Condicional
 * Solo muestra logs en desarrollo, silencia en producción
 */

const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_APP_ENVIRONMENT === 'development'

class Logger {
  log(...args) {
    if (isDevelopment) {
      console.log(...args)
    }
  }

  info(...args) {
    if (isDevelopment) {
      console.info(...args)
    }
  }

  warn(...args) {
    if (isDevelopment) {
      console.warn(...args)
    }
  }

  error(...args) {
    // Los errores siempre se muestran, pero en producción podrían enviarse a Sentry
    console.error(...args)

    // TODO: Integrar con servicio de monitoreo en producción
    // if (!isDevelopment && window.Sentry) {
    //   Sentry.captureException(new Error(args.join(' ')))
    // }
  }

  debug(...args) {
    if (isDevelopment) {
      console.debug(...args)
    }
  }

  table(data) {
    if (isDevelopment && console.table) {
      console.table(data)
    }
  }

  group(label) {
    if (isDevelopment && console.group) {
      console.group(label)
    }
  }

  groupEnd() {
    if (isDevelopment && console.groupEnd) {
      console.groupEnd()
    }
  }
}

// Exportar instancia singleton
export const logger = new Logger()

// Usar así:
// import { logger } from 'src/utils/logger'
// logger.log('Esto solo se verá en desarrollo')
// logger.error('Esto se verá siempre')
