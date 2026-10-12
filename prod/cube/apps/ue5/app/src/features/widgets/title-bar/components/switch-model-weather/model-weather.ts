export type ModelWeatherOption = {
  label: string;
  value: string;
  weatherCode: string[];
  img: string;
};

export const modelWeatherList: ModelWeatherOption[] = [
  {
    label: "自动",
    value: "Sunny",
    weatherCode: ["00"],
    img: "tianqi/00.png",
  },
  {
    label: "晴",
    value: "Sunny",
    weatherCode: ["00"],
    img: "tianqi/00.png",
  },
  {
    label: "多云",
    value: "Cloudy",
    weatherCode: ["01"],
    img: "tianqi/01.png",
  },
  {
    label: "雾",
    value: "Foggy",
    weatherCode: ["18", "53"],
    img: "tianqi/18.png",
  },
  {
    label: "阴",
    value: "Overcast",
    weatherCode: ["02"],
    img: "tianqi/02.png",
  },
  {
    label: "小雨",
    value: "RainLight",
    weatherCode: ["07", "08", "13", "19", "301"],
    img: "tianqi/07.png",
  },
  {
    label: "大雨",
    value: "Rain",
    weatherCode: ["03", "04", "05", "09"],
    img: "tianqi/03.png",
  },
  {
    label: "暴雨",
    value: "RainThunderStorm",
    weatherCode: ["10", "11", "12", "24", "25"],
    img: "tianqi/10.png",
  },
  {
    label: "小雪",
    value: "SnowLight",
    weatherCode: ["06", "14", "15", "26", "27", "302"],
    img: "tianqi/06.png",
  },
  {
    label: "大雪",
    value: "Snow",
    weatherCode: ["16", "17"],
    img: "tianqi/16.png",
  },
  {
    label: "暴雪",
    value: "SnowBlizzard",
    weatherCode: ["28"],
    img: "tianqi/28.png",
  },
  {
    label: "沙尘",
    value: "SandDustCalm",
    weatherCode: ["20", "29", "30"],
    img: "tianqi/20.png",
  },
  {
    label: "沙暴",
    value: "SandDustStorm",
    weatherCode: ["31"],
    img: "tianqi/31.png",
  },
];

const WEATHER_LABEL_ALIASES: Record<string, string> = {
  自动: "自动",
  auto: "自动",
  晴: "晴",
  晴天: "晴",
  sunny: "晴",
  多云: "多云",
  cloudy: "多云",
  雾: "雾",
  foggy: "雾",
  阴: "阴",
  overcast: "阴",
  小雨: "小雨",
  rainlight: "小雨",
  大雨: "大雨",
  rain: "大雨",
  暴雨: "暴雨",
  大暴雨: "暴雨",
  特大暴雨: "暴雨",
  rainthunderstorm: "暴雨",
  thunderstorm: "暴雨",
  heavyrain: "暴雨",
  heavy_rain: "暴雨",
  largerain: "暴雨",
  小雪: "小雪",
  snowlight: "小雪",
  大雪: "大雪",
  snow: "大雪",
  暴雪: "暴雪",
  snowblizzard: "暴雪",
  沙尘: "沙尘",
  sanddustcalm: "沙尘",
  沙暴: "沙暴",
  sandduststorm: "沙暴",
};

export function extractWeatherRaw(raw: unknown): string | undefined {
  if (raw == null) {
    return undefined;
  }
  if (typeof raw === "string") {
    const text = raw.trim();
    if (!text) {
      return undefined;
    }
    if (text.startsWith("{") && text.endsWith("}")) {
      try {
        const nested = extractWeatherRaw(JSON.parse(text) as unknown);
        if (nested) {
          return nested;
        }
      } catch {
        // fall through
      }
    }
    return text;
  }
  if (typeof raw === "number") {
    const text = String(raw).trim();
    return text || undefined;
  }
  if (typeof raw !== "object") {
    return undefined;
  }
  const obj = raw as Record<string, unknown>;
  for (const key of ["value", "weather", "weatherType", "weather_type", "name", "label", "type"]) {
    const nested = obj[key];
    if (typeof nested === "string" || typeof nested === "number") {
      const text = String(nested).trim();
      if (text) {
        return text;
      }
    }
    if (nested != null && typeof nested === "object") {
      const deeper = extractWeatherRaw(nested);
      if (deeper) {
        return deeper;
      }
    }
  }
  return undefined;
}

export function resolveModelWeatherOption(raw: unknown): ModelWeatherOption | undefined {
  const text = extractWeatherRaw(raw);
  if (!text) {
    return undefined;
  }

  const byExactLabel = modelWeatherList.find((e) => e.label === text);
  if (byExactLabel) {
    return byExactLabel;
  }

  const aliasLabel = WEATHER_LABEL_ALIASES[text] ?? WEATHER_LABEL_ALIASES[text.toLowerCase()];
  if (aliasLabel) {
    return modelWeatherList.find((e) => e.label === aliasLabel);
  }

  const lower = text.toLowerCase();
  const byValue = modelWeatherList.find((e) => e.value === text || e.value.toLowerCase() === lower);
  if (byValue?.label === "自动") {
    return modelWeatherList.find((e) => e.value === byValue.value && e.label !== "自动") ?? byValue;
  }
  if (byValue) {
    return byValue;
  }

  const labelsByLen = [...modelWeatherList].filter((e) => e.label !== "自动").sort((a, b) => b.label.length - a.label.length);
  for (const option of labelsByLen) {
    if (text.includes(option.label)) {
      return option;
    }
  }
  const valuesByLen = [...new Set(modelWeatherList.map((e) => e.value))].sort((a, b) => b.length - a.length);
  for (const value of valuesByLen) {
    if (lower.includes(value.toLowerCase())) {
      return modelWeatherList.find((e) => e.value === value && e.label !== "自动");
    }
  }
  return undefined;
}
