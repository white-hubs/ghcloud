export function trimText(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const trimmed = String(value).trim();
  return trimmed === "" ? undefined : trimmed;
}

export function displayText(value: unknown): string {
  if (value === true) {
    return "是";
  }
  if (value === false) {
    return "否";
  }
  if (value === 0) {
    return "0";
  }
  return trimText(value) ?? "--";
}

export function signedScore(value?: number): string {
  if (value === undefined || value === null) {
    return "--";
  }
  return value > 0 ? `+${value}` : String(value);
}

export function deductScoreText(value?: number): string {
  if (value === undefined || value === null) {
    return "--";
  }
  return value > 0 ? `-${value}` : String(value);
}

export function bonusScoreText(value?: number): string {
  if (value === undefined || value === null) {
    return "--";
  }
  return value > 0 ? `+${value}` : String(value);
}

export function scoreClass(value?: number): string {
  if ((value ?? 0) > 0) {
    return "positive";
  }
  if ((value ?? 0) < 0) {
    return "negative";
  }
  return "";
}

export function parseDate(value: unknown): Date | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }
  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value.map((item) => Number(item));
    if ([year, month, day, hour, minute, second].some((item) => Number.isNaN(item))) {
      return undefined;
    }
    return new Date(year, month - 1, day, hour, minute, second);
  }
  if (typeof value === "number") {
    const milliseconds = value < 10_000_000_000 ? value * 1000 : value;
    const date = new Date(milliseconds);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
  if (typeof value === "string") {
    const text = value.trim();
    if (text === "") {
      return undefined;
    }
    if (/^\d+$/.test(text)) {
      return parseDate(Number(text));
    }
    const matched = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (matched !== null) {
      const [, year, month, day, hour = "0", minute = "0", second = "0"] = matched;
      return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
    }
    const date = new Date(text);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
  return undefined;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatDate(value?: unknown): string {
  const date = parseDate(value);
  if (date === undefined) {
    return displayText(value);
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatDateTime(value?: unknown): string {
  const date = parseDate(value);
  if (date === undefined) {
    return displayText(value);
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatShortDateTime(value?: unknown): string {
  const date = parseDate(value);
  if (date === undefined) {
    return displayText(value);
  }
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatQueryDateTime(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function monthLabelFromDate(date = new Date()): string {
  return `${date.getMonth() + 1}月`;
}
