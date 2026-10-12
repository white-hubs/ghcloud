/** 检测反爬 / WAF 挑战页，避免把 arg1 乱码当正文返回 */

const ALIYUN_WAF_MARKERS = ["aliyun_waf_aa", "aliyun_waf_bb", 'id="renderData"', "acw_sc__v2", 'name="aliyunwaf_'] as const;

const CLOUDFLARE_MARKERS = ["cf-browser-verification", "challenge-platform", "__cf_chl_opt"] as const;

function looksLikeHtml(contentType: string, html: string): boolean {
  const lower = contentType.toLowerCase();
  if (lower.includes("html") || lower.includes("text/plain")) {
    return true;
  }
  const trimmed = html.trimStart().slice(0, 200).toLowerCase();
  return trimmed.startsWith("<!doctype") || trimmed.startsWith("<html") || trimmed.includes("<head");
}

function countMarkers(html: string, markers: readonly string[]): number {
  let count = 0;
  for (const marker of markers) {
    if (html.includes(marker)) {
      count += 1;
    }
  }
  return count;
}

function isAliyunWafChallenge(html: string): boolean {
  if (html.includes("aliyun_waf_aa") && html.includes("renderData")) {
    return true;
  }
  return countMarkers(html, ALIYUN_WAF_MARKERS) >= 2;
}

function isCloudflareChallenge(html: string): boolean {
  return countMarkers(html, CLOUDFLARE_MARKERS) >= 2;
}

function isRenderDataJsonBody(html: string): boolean {
  return /^\s*\{"l1"\s*:\s*"var arg1=/i.test(html.trim()) || html.includes('{"l1":"var arg1=');
}

export function detectBotChallenge(html: string, contentType = ""): string | undefined {
  if (!looksLikeHtml(contentType, html)) {
    return undefined;
  }

  if (isAliyunWafChallenge(html)) {
    return "Aliyun WAF JavaScript challenge (requires browser cookie verification)";
  }

  if (isCloudflareChallenge(html)) {
    return "Cloudflare bot challenge (requires JavaScript verification)";
  }

  if (isRenderDataJsonBody(html)) {
    return "Anti-bot challenge page detected";
  }

  return undefined;
}
