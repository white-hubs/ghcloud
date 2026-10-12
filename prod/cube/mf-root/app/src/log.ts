import { LoggerManager } from '@ghcloud/logger'

export const logger = new LoggerManager({
  levels: {
    debug: { enable: true, printTrace: true },
    info: { enable: true, printTrace: true },
    warn: { enable: true, printTrace: true },
    error: { enable: true, printTrace: true },
    fault: { enable: true, printTrace: true },
  }
}).getLogger('mf-root')
