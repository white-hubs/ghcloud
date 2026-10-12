import { LoggerManager, type Logger } from '@ghcloud/logger'

export const logger: Logger = new LoggerManager().getLogger('goods-purchase-price')
