import { SIX_CONFIG_KEYS, SIX_CONFIG_LABELS, type SixConfigKey } from "./skill-instructions";

export interface ConfigMentionOption {
  key: SixConfigKey;
  label: string;
}

export interface ActiveConfigMention {
  start: number;
  end: number;
  query: string;
}

export const CONFIG_MENTION_OPTIONS: ConfigMentionOption[] = SIX_CONFIG_KEYS.map((key) => ({
  key,
  label: SIX_CONFIG_LABELS[key],
}));

export function findActiveConfigMention(text: string, caret: number): ActiveConfigMention | null {
  const beforeCaret = text.slice(0, caret);
  const match = beforeCaret.match(/(^|\s)@([^\s@]*)$/);
  if (!match || match.index == null) {
    return null;
  }
  const prefix = match[1] ?? "";
  return {
    start: match.index + prefix.length,
    end: caret,
    query: match[2] ?? "",
  };
}

export function filterConfigMentionOptions(query: string): ConfigMentionOption[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return CONFIG_MENTION_OPTIONS;
  }
  return CONFIG_MENTION_OPTIONS.filter(
    (option) => option.label.toLowerCase().includes(normalized) || option.key.toLowerCase().includes(normalized),
  );
}

export function applyConfigMentionSelection(text: string, mention: ActiveConfigMention, label: string): { text: string; caret: number } {
  const insertion = `@${label} `;
  return {
    text: text.slice(0, mention.start) + insertion + text.slice(mention.end),
    caret: mention.start + insertion.length,
  };
}
