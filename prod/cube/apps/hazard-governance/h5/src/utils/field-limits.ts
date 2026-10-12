export const HAZARD_H5_FIELD_LIMITS = {
  longText: 500,
  shortText: 100,
} as const;

export const limitTextLength = (value: string, maxLength: number): string => (value.length > maxLength ? value.slice(0, maxLength) : value);
