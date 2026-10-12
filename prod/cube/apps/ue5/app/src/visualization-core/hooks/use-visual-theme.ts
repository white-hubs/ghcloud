import { computed, readonly, shallowRef, watch } from "vue";

import { VISUAL_THEME_CHANGE_EVENT } from "@/infrastructure/utils/visual-theme";

export type VisualTheme = "tech-blue" | "minimal-white";

export interface VisualThemeOption {
  label: string;
  value: VisualTheme;
}

interface VisualThemeConfig {
  defaultTheme?: VisualTheme;
  switchable?: boolean;
  switchVisible?: boolean;
}

const STORAGE_KEY = "cube-ue5-visual-theme";
const THEME_QUERY_KEY = "visualTheme";
const visualThemeOptions: VisualThemeOption[] = [
  { label: "科技蓝", value: "tech-blue" },
  { label: "极简白", value: "minimal-white" },
];
const themeValues = visualThemeOptions.map((option) => option.value);
const currentTheme = shallowRef<VisualTheme>("tech-blue");
const initialized = shallowRef(false);

const isVisualTheme = (value: unknown): value is VisualTheme => {
  return typeof value === "string" && themeValues.includes(value as VisualTheme);
};

const getVisualThemeConfig = (): VisualThemeConfig => {
  return (window as any).config?.otherConfig?.visualTheme ?? {};
};

const getQueryTheme = (): VisualTheme | null => {
  const queryTheme = new URLSearchParams(window.location.search).get(THEME_QUERY_KEY);
  return isVisualTheme(queryTheme) ? queryTheme : null;
};

const getStoredTheme = (): VisualTheme | null => {
  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  return isVisualTheme(storedTheme) ? storedTheme : null;
};

const resolveInitialTheme = (): VisualTheme => {
  const config = getVisualThemeConfig();
  return getQueryTheme() ?? getStoredTheme() ?? (isVisualTheme(config.defaultTheme) ? config.defaultTheme : "tech-blue");
};

const emitVisualThemeChange = (theme: VisualTheme): void => {
  window.dispatchEvent(new CustomEvent(VISUAL_THEME_CHANGE_EVENT, { detail: { theme } }));
};

export const initVisualTheme = (): void => {
  if (!initialized.value) {
    currentTheme.value = resolveInitialTheme();
    initialized.value = true;
  }
  document.documentElement.dataset.visualTheme = currentTheme.value;
  emitVisualThemeChange(currentTheme.value);
};

export const setVisualTheme = (theme: VisualTheme): void => {
  currentTheme.value = theme;
};

watch(
  currentTheme,
  (theme) => {
    document.documentElement.dataset.visualTheme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
    emitVisualThemeChange(theme);
  },
  { immediate: initialized.value },
);

export const useVisualTheme = () => {
  initVisualTheme();

  const config = computed(() => getVisualThemeConfig());
  const switchable = computed(() => config.value.switchable ?? true);
  const switchVisible = computed(() => switchable.value && (config.value.switchVisible ?? true));
  const currentThemeLabel = computed(() => {
    return visualThemeOptions.find((option) => option.value === currentTheme.value)?.label ?? currentTheme.value;
  });

  const toggleVisualTheme = (): void => {
    if (!switchable.value) {
      return;
    }
    setVisualTheme(currentTheme.value === "tech-blue" ? "minimal-white" : "tech-blue");
  };

  return {
    currentTheme: readonly(currentTheme),
    currentThemeLabel,
    switchVisible,
    visualThemeOptions,
    setVisualTheme,
    toggleVisualTheme,
  };
};
