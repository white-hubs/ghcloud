import { readLegacySceneScopeFromContent, resolvePageSceneScope, type LegacySceneScopeKind, type SceneScopeKind } from "@cube-scada/core";

export const SCADA_API_BASE = "/scada/api";
export const SCADA_STUDIO_PATH = "/portal/scada-studio";
export const SCADA_STUDIO_ASSET_BASE = "/resource/v1/scada-studio";

export interface ScadaPageSummary {
  id: string;
  name: string;
  sceneScope?: LegacySceneScopeKind | SceneScopeKind;
  bindableElements?: ScadaBindableElementSummary[];
}

export interface ScadaBindableElementSummary {
  id: string;
  name: string;
  type?: string;
}

export interface DeviceScadaPageSummary extends ScadaPageSummary {
  sceneScope: "singleDevice";
  elementIds: string[];
}

export interface ElectricalCenterPageRef {
  id: string;
  name: string;
}

export function parseLegacySceneScopeFromPageContent(content: string | undefined | null): LegacySceneScopeKind | undefined {
  return readLegacySceneScopeFromContent(content);
}

export function toScadaPageSummary(item: { id: string; name: string }, content?: string): ScadaPageSummary {
  const sceneScope = parseLegacySceneScopeFromPageContent(content);
  return {
    id: item.id,
    name: item.name,
    ...(sceneScope ? { sceneScope } : {}),
  };
}

export function filterPagesByScope(pages: ScadaPageSummary[], scope: LegacySceneScopeKind): ScadaPageSummary[] {
  return pages.filter((page) => page.sceneScope === scope);
}

function parsePageContentRecord(content: string | undefined | null): Record<string, unknown> | null {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const record = parsed as Record<string, unknown>;
    const nestedPage = record.page;
    return nestedPage && typeof nestedPage === "object" && !Array.isArray(nestedPage) ? (nestedPage as Record<string, unknown>) : record;
  } catch {
    return null;
  }
}

function parseBindableElements(elements: unknown[]): ScadaBindableElementSummary[] {
  return elements.flatMap((element): ScadaBindableElementSummary[] => {
    if (!element || typeof element !== "object") return [];
    const record = element as Record<string, unknown>;
    if (record.deviceBinding !== "required" || typeof record.id !== "string" || !record.id.trim()) return [];
    const nameCandidates = [record.propertyBindName, record.label, record.id];
    const name = nameCandidates.find((value) => typeof value === "string" && value.trim()) as string;
    return [
      {
        id: record.id.trim(),
        name: name.trim(),
        ...(typeof record.type === "string" && record.type.trim() ? { type: record.type.trim() } : {}),
      },
    ];
  });
}

function parseBindablePage(content: string | undefined | null): {
  sceneScope: SceneScopeKind;
  legacySceneScope?: LegacySceneScopeKind;
  bindableElements: ScadaBindableElementSummary[];
} | null {
  const page = parsePageContentRecord(content);
  if (!page) return null;
  const elements = Array.isArray(page.elements) ? page.elements : [];
  return {
    sceneScope: resolvePageSceneScope({
      sceneScope: page.sceneScope,
      elements: elements.map((element) =>
        element && typeof element === "object" ? { deviceBinding: (element as Record<string, unknown>).deviceBinding } : {},
      ),
    }),
    ...(parseLegacySceneScopeFromPageContent(content) ? { legacySceneScope: parseLegacySceneScopeFromPageContent(content) } : {}),
    bindableElements: parseBindableElements(elements),
  };
}

export function toDeviceScadaPageSummary(
  item: { id: string; name: string },
  content: string | undefined,
  productCode: string,
): DeviceScadaPageSummary | null {
  const page = parsePageContentRecord(content);
  const normalizedProductCode = productCode.trim();
  if (!page || !normalizedProductCode) return null;
  const product = page.product;
  if (!product || typeof product !== "object" || Array.isArray(product)) return null;
  const productId = (product as Record<string, unknown>).id;
  if (typeof productId !== "string" || productId.trim() !== normalizedProductCode) return null;
  const elements = Array.isArray(page.elements) ? page.elements : [];
  const sceneScope = resolvePageSceneScope({
    sceneScope: page.sceneScope,
    elements: elements.map((element) =>
      element && typeof element === "object" ? { deviceBinding: (element as Record<string, unknown>).deviceBinding } : {},
    ),
  });
  if (sceneScope !== "singleDevice") return null;
  const elementIds = [
    ...new Set(
      elements.flatMap((element) => {
        if (!element || typeof element !== "object") return [];
        const id = (element as Record<string, unknown>).id;
        return typeof id === "string" && id.trim() ? [id.trim()] : [];
      }),
    ),
  ];
  return { id: item.id, name: item.name, sceneScope, elementIds };
}

export function toFacilityRoomPageSummary(item: { id: string; name: string }, content?: string): ScadaPageSummary | null {
  const parsed = parseBindablePage(content);
  if (!parsed) return null;
  if (parsed.legacySceneScope && parsed.legacySceneScope !== "facilityRoom") return null;
  if (!parsed.legacySceneScope && parsed.bindableElements.length === 0) return null;
  return {
    id: item.id,
    name: item.name,
    sceneScope: parsed.legacySceneScope ?? parsed.sceneScope,
    ...(parsed.bindableElements.length > 0 ? { bindableElements: parsed.bindableElements } : {}),
  };
}

export function toMultiDevicePageSummary(item: { id: string; name: string }, content?: string): ScadaPageSummary | null {
  const parsed = parseBindablePage(content);
  if (!parsed || parsed.sceneScope !== "multiDevice") return null;
  return { id: item.id, name: item.name, sceneScope: parsed.sceneScope, bindableElements: parsed.bindableElements };
}

export function parseElectricalCenterRef(payload: unknown): ElectricalCenterPageRef | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as { id?: unknown; name?: unknown };
  if (typeof record.id !== "string" || !record.id.trim()) return null;
  return {
    id: record.id,
    name: typeof record.name === "string" && record.name.trim() ? record.name : record.id,
  };
}

export function openScadaStudio(): void {
  history.pushState({}, "", SCADA_STUDIO_PATH);
}

async function readJson(response: Response): Promise<unknown> {
  return response.json() as Promise<unknown>;
}

export async function fetchElectricalCenterPage(fetcher: typeof fetch = fetch): Promise<ElectricalCenterPageRef | null> {
  try {
    const response = await fetcher(`${SCADA_API_BASE}/pages/electrical-center`, { credentials: "include" });
    if (!response.ok) return null;
    return parseElectricalCenterRef(await readJson(response));
  } catch {
    return null;
  }
}

export async function fetchFacilityRoomPages(fetcher: typeof fetch = fetch): Promise<ScadaPageSummary[]> {
  const listResponse = await fetcher(`${SCADA_API_BASE}/pages/`, { credentials: "include" });
  if (!listResponse.ok) {
    throw new Error(`组态列表加载失败（${listResponse.status}）`);
  }
  const list = (await readJson(listResponse)) as Array<{ id: string; name: string }>;
  if (!Array.isArray(list)) return [];
  const hydrated = await Promise.all(
    list.map(async (item) => {
      try {
        const detailResponse = await fetcher(`${SCADA_API_BASE}/pages/${encodeURIComponent(item.id)}`, { credentials: "include" });
        if (!detailResponse.ok) return null;
        const detail = (await readJson(detailResponse)) as { content?: string };
        return toFacilityRoomPageSummary(item, detail.content);
      } catch {
        return null;
      }
    }),
  );
  return hydrated.filter((page): page is ScadaPageSummary => page !== null);
}

export async function fetchDeviceScadaPageByProduct(
  productCode: string,
  fetcher: typeof fetch = fetch,
): Promise<DeviceScadaPageSummary | null> {
  const normalizedProductCode = productCode.trim();
  if (!normalizedProductCode) return null;
  const listResponse = await fetcher(`${SCADA_API_BASE}/pages/`, { credentials: "include" });
  if (!listResponse.ok) {
    throw new Error(`组态列表加载失败（${listResponse.status}）`);
  }
  const list = (await readJson(listResponse)) as Array<{ id: string; name: string }>;
  if (!Array.isArray(list)) return null;
  const pages = await Promise.all(
    list.map(async (item) => {
      try {
        const detailResponse = await fetcher(`${SCADA_API_BASE}/pages/${encodeURIComponent(item.id)}`, { credentials: "include" });
        if (!detailResponse.ok) return null;
        const detail = (await readJson(detailResponse)) as { content?: string };
        return toDeviceScadaPageSummary(item, detail.content, normalizedProductCode);
      } catch {
        return null;
      }
    }),
  );
  return pages.find((page): page is DeviceScadaPageSummary => page !== null) ?? null;
}

export async function fetchMultiDevicePages(fetcher: typeof fetch = fetch): Promise<ScadaPageSummary[]> {
  const listResponse = await fetcher(`${SCADA_API_BASE}/pages/`, { credentials: "include" });
  if (!listResponse.ok) {
    throw new Error(`组态列表加载失败（${listResponse.status}）`);
  }
  const list = (await readJson(listResponse)) as Array<{ id: string; name: string }>;
  if (!Array.isArray(list)) return [];

  const pages = await Promise.all(
    list.map(async (item) => {
      try {
        const detailResponse = await fetcher(`${SCADA_API_BASE}/pages/${encodeURIComponent(item.id)}`, { credentials: "include" });
        if (!detailResponse.ok) return null;
        const detail = (await readJson(detailResponse)) as { content?: string };
        return toMultiDevicePageSummary(item, detail.content);
      } catch {
        return null;
      }
    }),
  );
  return pages.filter((page): page is ScadaPageSummary => page !== null);
}
