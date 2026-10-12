import { DateUtils } from '@ghcloud/utils'
import type { Logger } from './logger'
import { BackgroundColorEnum, ColorEnum, ConsoleStyle, FontEnum, type Style } from './console-style'
import { type StackInfo, getCurrentStacks } from './stack'

interface LoggerManagerOptions {
  levels: Record<keyof Logger, { enable: boolean; printTrace?: boolean; }>;
  prefixFormatter: (level: string, tag: string, stack: StackInfo) => string;
}

const logLevelStyles: Record<keyof Logger, Style[]> = {
  debug: [BackgroundColorEnum.BLACK, ColorEnum.BRIGHT_GREEN, FontEnum.BOLD],
  info: [BackgroundColorEnum.GREEN, ColorEnum.BRIGHT_WHITE, FontEnum.BOLD],
  warn: [BackgroundColorEnum.YELLOW, ColorEnum.BRIGHT_YELLOW, FontEnum.BOLD],
  error: [BackgroundColorEnum.RED, ColorEnum.BRIGHT_GREEN, FontEnum.BOLD],
  fault: [BackgroundColorEnum.BRIGHT_RED, ColorEnum.BRIGHT_GREEN, FontEnum.BOLD]
}

export class LoggerManager {
  private readonly options: LoggerManagerOptions = {
    levels: {
      debug: { enable: true, printTrace: true },
      info: { enable: true, printTrace: true },
      warn: { enable: true, printTrace: true },
      error: { enable: true, printTrace: true },
      fault: { enable: true, printTrace: true }
    },
    prefixFormatter: (level: string, tag: string, stack: StackInfo) => {
      return `${DateUtils.format(new Date(), 'YYYY-MM-DD HH:mm:ss')} [${level.toUpperCase()}] [${tag}] [${stack?.trigger}]`
    }
  }

  public constructor (options: Partial<LoggerManagerOptions> = {}) {
    this.options = {
      ...this.options,
      ...options
    }
  }

  public getLogger (tag: string): Logger {
    const contextInDefaultLogger = this instanceof LoggerManager
    if (!contextInDefaultLogger) {
      throw new Error('Error \'getLogger\' exec context is not in \'LoggerManager\', please do not use [\'call\', \'apply\'] or other methods to modify the context environment!')
    }
    return {
      debug: (...variables) => { this.output('debug', tag, ...variables) },
      info: (...variables) => { this.output('info', tag, ...variables) },
      warn: (...variables) => { this.output('warn', tag, ...variables) },
      error: (...variables) => { this.output('error', tag, ...variables) },
      fault: (...variables) => { this.output('fault', tag, ...variables) },
    }
  }

  private output (level: keyof Logger, tag: string, ...variables: unknown[]): void {
    const levelConfig = this.options.levels[level]
    if (!levelConfig.enable) {
      return
    }
    const stacks = getCurrentStacks()
    const loggerCallerStack = stacks[3]
    const prefix = this.options.prefixFormatter(level, tag, loggerCallerStack)
    const stylePrefix = ConsoleStyle.style(prefix, logLevelStyles[level])

    switch (level) {
      case 'debug':
      case 'info':
      case 'warn':
      case 'error':
        log(console[level])
        break
      case 'fault':
        log((function(){}))
        break
      default:
        throw new Error('unknown log level')
    }

    function log (printer: (...args: unknown[]) => void): void {
      if (levelConfig.printTrace) {
        console.groupCollapsed(`${stylePrefix} ${variables.map(() => '%O').join(' ')}
    @ ${loggerCallerStack?.addr}:${loggerCallerStack?.row}:${loggerCallerStack?.col}`, ...variables)
        console.groupCollapsed('caller::stack')
        console.trace('trace')
        console.groupEnd()
        console.groupEnd()
        return
      }
      printer(stylePrefix, ...variables)
    }
  }
}
