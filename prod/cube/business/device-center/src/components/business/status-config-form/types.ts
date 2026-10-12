export interface Rule {
  property: string | undefined;
  dataType: string | undefined;
  operator: string | undefined;
  value: string | number | undefined;
  type: string;
  translation?: string;
}

export interface Condition {
  rules: Rule[];
}

export interface StatusConfig {
  status: string;
  conditions: Condition;
}

export interface FormState {
  statusConfigs: StatusConfig[];
  errors: Record<string, string>;
}