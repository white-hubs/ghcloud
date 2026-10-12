import { registry } from "@cube-scada/core";
import { allBuiltinElements } from "@cube-scada/elements";

let initialized = false;
const baseUrl = import.meta.env.BASE_URL;
const BUILTIN_MANIFEST_URL = withBaseUrl("/builtin-elements/manifest.json");

interface BuiltinManifest {
  elements?: string[];
}

interface RemoteElementItem {
  type?: string;
}

function withBaseUrl(path: string): string {
  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

async function loadSvgBuiltinsFromPublic(): Promise<number> {
  try {
    const manifestResp = await fetch(BUILTIN_MANIFEST_URL, { cache: "no-store" });
    if (!manifestResp.ok) return 0;

    const manifest = (await manifestResp.json()) as BuiltinManifest;
    const paths = Array.isArray(manifest.elements) ? manifest.elements : [];
    if (paths.length === 0) return 0;

    let loadedCount = 0;
    await Promise.all(
      paths.map(async (elementPath) => {
        const resp = await fetch(withBaseUrl(elementPath), { cache: "no-store" });
        if (!resp.ok) return;

        const svg = await resp.text();
        if (!svg.includes("<svg")) return;

        await registry.registerFromSvg(svg);
        loadedCount += 1;
      }),
    );

    return loadedCount;
  } catch (error) {
    console.warn("[setupElements] load public SVG builtins failed:", error);
    return 0;
  }
}

async function loadCustomElementsFromService(): Promise<number> {
  try {
    const listResponse = await fetch("/scada/api/elements/", { cache: "no-store" });
    if (!listResponse.ok) return 0;

    const items = (await listResponse.json()) as RemoteElementItem[];
    if (!Array.isArray(items) || items.length === 0) return 0;

    let loadedCount = 0;
    await Promise.all(
      items.map(async (item) => {
        if (!item.type || registry.has(item.type)) return;

        const svgResponse = await fetch(`/scada/api/elements/${encodeURIComponent(item.type)}/svg`, { cache: "no-store" });
        if (!svgResponse.ok) return;

        const svg = await svgResponse.text();
        if (!svg.includes("<svg")) return;

        await registry.registerFromSvg(svg);
        loadedCount += 1;
      }),
    );
    return loadedCount;
  } catch (error) {
    console.warn("[setupElements] load custom elements failed:", error);
    return 0;
  }
}

export async function setupElements(): Promise<void> {
  if (initialized) return;

  await registry.registerPackage(allBuiltinElements);
  await loadSvgBuiltinsFromPublic();
  await loadCustomElementsFromService();

  initialized = true;
}

export { registry, allBuiltinElements };
