import { htmlToText } from "./html-to-text";

const TITLE_PATTERN = /<title[^>]*>([\s\S]*?)<\/title>/i;

export function extractTitle(html: string): string | undefined {
  const match = TITLE_PATTERN.exec(html);
  if (match?.[1]) {
    const title = htmlToText(match[1]).trim();
    if (title !== "" && !isChallengeLikeText(title)) {
      return title;
    }
  }

  const text = htmlToText(html);
  const firstLine = text
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line !== "" && !isChallengeLikeText(line));
  return firstLine ?? undefined;
}

function isChallengeLikeText(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.startsWith('{"l1"') && trimmed.includes("arg1")) {
    return true;
  }
  if (trimmed.length > 200 && /^[A-Za-z0-9+/=]{200,}$/.test(trimmed.replace(/\s+/g, ""))) {
    return true;
  }
  return false;
}
