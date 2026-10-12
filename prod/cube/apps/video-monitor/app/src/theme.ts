import { theme as antTheme } from "ant-design-vue";
import type { ThemeConfig } from "ant-design-vue/es/config-provider/context";

export type VideoMonitorThemeMode = "dawn-blue" | "night-black";

export interface VideoMonitorThemePayload {
  mode: VideoMonitorThemeMode;
  primaryColor: string;
}

const THEME_STORAGE_KEY = "cube:theme";

const themePresets: Record<VideoMonitorThemeMode, VideoMonitorThemePayload> = {
  "dawn-blue": {
    mode: "dawn-blue",
    primaryColor: "#1890ff",
  },
  "night-black": {
    mode: "night-black",
    primaryColor: "#2f8cff",
  },
};

export const DEFAULT_THEME = themePresets["dawn-blue"];

function isThemeMode(value: unknown): value is VideoMonitorThemeMode {
  return value === "dawn-blue" || value === "night-black";
}

export function normalizeThemePayload(value: unknown, fallback = DEFAULT_THEME): VideoMonitorThemePayload {
  if (typeof value === "object" && value !== null) {
    const candidate = value as Partial<VideoMonitorThemePayload>;
    if (isThemeMode(candidate.mode)) {
      return {
        mode: candidate.mode,
        primaryColor: candidate.primaryColor || themePresets[candidate.mode].primaryColor,
      };
    }
  }

  return fallback;
}

/** Reads the shell's persisted selection when this application mounts after a theme switch. */
export function readInitialTheme(): VideoMonitorThemePayload {
  if (import.meta.env.DEV) {
    const previewMode = new URLSearchParams(window.location.search).get("theme");
    if (isThemeMode(previewMode)) {
      return themePresets[previewMode];
    }
  }

  try {
    const storedValue = localStorage.getItem(THEME_STORAGE_KEY);
    return storedValue ? normalizeThemePayload(JSON.parse(storedValue)) : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

/** Preserves a selected mode while supporting the legacy primary-colour event. */
export function applyLegacyPrimaryColor(currentTheme: VideoMonitorThemePayload, primaryColor: unknown): VideoMonitorThemePayload {
  return typeof primaryColor === "string" && primaryColor.trim() ? { ...currentTheme, primaryColor } : currentTheme;
}

export function createAntTheme(theme: VideoMonitorThemePayload): ThemeConfig {
  const isDark = theme.mode === "night-black";

  return {
    algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    token: {
      colorPrimary: theme.primaryColor,
      colorBgBase: isDark ? "#080e1c" : "#f5f7fa",
      colorBgContainer: isDark ? "#10182b" : "#ffffff",
      colorBgElevated: isDark ? "#16213a" : "#ffffff",
      colorText: isDark ? "#f4f7ff" : "#1f2329",
      colorTextSecondary: isDark ? "#9aa8bf" : "#86909c",
      colorBorder: isDark ? "#233758" : "#e5e6eb",
      borderRadius: 8,
    },
  };
}
