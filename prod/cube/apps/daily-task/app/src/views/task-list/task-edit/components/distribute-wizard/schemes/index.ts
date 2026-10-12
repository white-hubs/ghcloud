import type { DistributeSchemeStrategy } from "./base-strategy";
import { SchemeOneStrategy } from "./scheme-one-strategy";
import { SchemeTwoStrategy } from "./scheme-two-strategy";
import { DistributeSchemeType } from "./types";

// 策略工厂
export class DistributeSchemeStrategyFactory {
  private static strategies: Map<DistributeSchemeType, DistributeSchemeStrategy> | null = null;

  private static initStrategies(): Map<DistributeSchemeType, DistributeSchemeStrategy> {
    if (!this.strategies) {
      this.strategies = new Map<DistributeSchemeType, DistributeSchemeStrategy>();
      this.strategies.set(DistributeSchemeType.SCHEME_ONE, new SchemeOneStrategy());
      this.strategies.set(DistributeSchemeType.SCHEME_TWO, new SchemeTwoStrategy());
    }
    return this.strategies;
  }

  static getStrategy(schemeType: DistributeSchemeType | null): DistributeSchemeStrategy | null {
    if (!schemeType) {
      return null;
    }
    return this.initStrategies().get(schemeType) || null;
  }

  static getAllStrategies(): DistributeSchemeStrategy[] {
    return Array.from(this.initStrategies().values());
  }
}

// 导出策略类
export { SchemeOneStrategy } from "./scheme-one-strategy";
export { SchemeTwoStrategy } from "./scheme-two-strategy";
export type { DistributeSchemeStrategy } from "./base-strategy";
export type { StrategyContext, ValidationResult } from "./types";
export { STEP_INDEX } from "./types";
