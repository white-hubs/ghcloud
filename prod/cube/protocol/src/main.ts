import type { CubeTerminalEnum } from './cube-terminal.protocol'

export * from './cube-terminal.protocol'
export * from './cube-service.protocol'
export * from './cube-stat.protocol'
export * from './cube-message-event.protocol'

export interface CubeAuth {
  token: string;
  tenant: string;
  terminal: CubeTerminalEnum;
}

export enum CubeHeaders {
  TERMINAL = 'terminal',
  AUTHORIZATION = 'Authorization',
  TENANT = 'tenant',
}
