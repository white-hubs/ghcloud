import { MFRootEventNameEnum, publisher, type MFRootThemePayload } from "./event";

export type MFRootThemeMode = MFRootThemePayload["mode"];

const THEME_STORAGE_KEY = "cube:theme";

const themes: Record<MFRootThemeMode, MFRootThemePayload> = {
  "dawn-blue": { mode: "dawn-blue", primaryColor: "#1890ff" },
  "night-black": { mode: "night-black", primaryColor: "#2f8cff" },
};

export const DEFAULT_MF_ROOT_THEME = themes["dawn-blue"];

function isThemeMode(value: unknown): value is MFRootThemeMode {
  return value === "dawn-blue" || value === "night-black";
}

/** Retrieves the selection for shell startup and late-mounted micro applications. */
export function getMFRootTheme(): MFRootThemePayload {
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme) {
      const payload = JSON.parse(storedTheme) as Partial<MFRootThemePayload>;
      if (isThemeMode(payload.mode)) {
        return {
          mode: payload.mode,
          primaryColor: payload.primaryColor || themes[payload.mode].primaryColor,
        };
      }
    }
  } catch {
    // An unavailable or corrupt browser storage must not prevent shell startup.
  }

  return DEFAULT_MF_ROOT_THEME;
}

/**
 * The shell header calls this when a user selects 开河蓝 or 夜幕黑.
 * The legacy event remains intentionally published for applications that have
 * not yet adopted the structured theme contract.
 */
export function setMFRootTheme(mode: MFRootThemeMode): MFRootThemePayload {
  const payload = themes[mode];
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(payload));
  publisher.publish(MFRootEventNameEnum.MF_ROOT_CHANGE_THEME, payload);
  publisher.publish(MFRootEventNameEnum.MF_ROOT_CHANGE_SKIN, payload.primaryColor);
  return payload;
}
