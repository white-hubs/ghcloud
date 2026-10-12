type ParamsValue = string | number | boolean | undefined | null;
type ParamsType = Record<string, ParamsValue>;

export function filterEmptyValues<T extends ParamsType>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  ) as Partial<T>;
}
