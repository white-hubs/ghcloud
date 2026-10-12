export type Tone = "blue" | "green" | "orange" | "red" | "gray" | "purple";

export interface StatItem {
  label: string;
  value: string;
  tone?: Tone;
}

export interface TabItem {
  key: string;
  label: string;
}

export const toneColor: Record<Tone, string> = {
  blue: "blue",
  green: "green",
  orange: "orange",
  red: "red",
  gray: "default",
  purple: "purple",
};
