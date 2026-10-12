export type DeepCaller = (object: object) => void

interface DeepCallOption {
  types: TypeOfType[];
  caller: DeepCaller;
  // @default false
  excludeNull?: boolean;
}

type TypeOfType = 'string' | 'object' | 'function' | 'symbol' | 'number' | 'boolean' | 'bigint' | 'undefined'

export function deepCall<T extends object> (obj: T, option: DeepCallOption): void {
  for (const value of Object.values(obj)) {
    if (value === null && option.excludeNull) {
      continue
    }
    const valueType = typeof value
    if (option.types.includes(valueType)) {
      option.caller(value)
    }
    if (typeof value === 'object') {
      deepCall(value, option)
    }
  }
}
