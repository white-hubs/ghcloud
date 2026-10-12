import type { VisualModelEntry } from "@ghcloud/cube-service-interface/visualization";

export type ModelEntry = VisualModelEntry;

/** 与 visual-config ModelConfig 对齐的应用内类型（稳定后再上收 interfaces） */
export interface ModelConfig {
  title: string;
  entry: ModelEntry;
  ue5: {
    modelLocation?: {
      lng: number;
      lat: number;
    };
    modelServer: {
      name: string;
      url: string;
      area?: string[];
    }[];
    modelPerspective: {
      label: string;
      value: string;
      area?: string;
      id?: string;
    }[];
    perspective: {
      id: string;
      areaId?: string;
      area: string;
      camera: string;
      hideActors?: string[];
      buildTagLocation?: string;
      shellCode?: string;
      label?: string;
    }[];
    applicationPerspective: {
      id: string;
      application: string;
      camera: string;
      path: string;
    }[];
    roamingRoute: {
      name: string;
      id: string;
      route: {
        pointName: string;
        perspective: string;
        id: string;
        name: string;
        sort: number;
        speed: number;
      }[];
    }[];
    iconScale: number | string;
    isFilterArea: string;
    navType: string;
    cardType: string;
    deviceStyle: string;
    autoWeather: boolean;
    labelList: unknown[];
    guideData: {
      isOld: string;
      modelLine: string;
      guideList: {
        sort: number;
        name: string;
        describe: string;
        id: string;
        setScreen?: {
          initPerspective: string;
          durationStay: number;
          effectList: { name: string; value: string }[];
        };
        pointList?: {
          id: string;
          title: string;
          point: string;
          angleView: string;
          type: string;
          describe: string;
          indicatorType: string;
          time: number;
        }[];
      }[];
    };
    correct?: boolean;
  };
  three: {
    modelServer: {
      name: string;
      url: string;
      area: string[];
      areaList: {
        id: string;
        name: string;
        aliasName: string;
      }[];
    }[];
    modelPerspective: {
      label: string;
      value: string;
      area: string;
      areaId: string;
      id?: string;
    }[];
    perspective: {
      id?: string;
      areaId?: string;
      value?: string;
      area: string;
      label?: string;
      camera: string;
      hideActors?: string[];
      buildTagLocation?: string;
    }[];
    roamingRoute: {
      name: string;
      id: string;
      route: {
        area: string;
        name: string;
        pointName: string;
        perspective: string;
        id: string;
        speed: number;
        sort: number;
      }[];
    }[];
    labelList: unknown[];
    areaLabelList: unknown[];
    scene: {
      background: {
        images: {
          url: string;
          area: { id: string; name: string; aliasName: string }[];
          id: string;
        }[];
        scale: number;
      };
    };
  };
  scada: {
    url: { menu: string; area: string; url: string; id: string; name: string }[];
    background: { area: string[]; url: string; id: string }[];
  };
}

export const MODEL_ENTRY_OPTIONS: { value: ModelEntry; label: string }[] = [
  { value: "views", label: "UE5" },
  { value: "views-2d", label: "二维组态" },
  { value: "views-gis", label: "WebGIS" },
  { value: "views-3d", label: "WebGPU" },
];

/** 默认模型配置 */
export const createDefaultModelConfig = (): ModelConfig => ({
  title: "三维可视化大屏",
  entry: "views",
  ue5: {
    modelLocation: { lng: 0, lat: 0 },
    modelServer: [],
    modelPerspective: [],
    perspective: [],
    applicationPerspective: [],
    roamingRoute: [],
    labelList: [],
    iconScale: 1,
    isFilterArea: "display",
    navType: "classicsNav",
    cardType: "classicsCard",
    deviceStyle: "pop",
    autoWeather: false,
    guideData: {
      isOld: "old",
      modelLine: "",
      guideList: [],
    },
  },
  three: {
    modelServer: [],
    modelPerspective: [],
    perspective: [],
    roamingRoute: [],
    labelList: [],
    areaLabelList: [],
    scene: {
      background: {
        images: [],
        scale: 1,
      },
    },
  },
  scada: {
    url: [],
    background: [],
  },
});

/** 解析接口返回的 JSON，空或非法时回落默认值 */
export const parseModelConfiguration = (raw: string | null | undefined): ModelConfig => {
  if (!raw || !raw.trim()) {
    return createDefaultModelConfig();
  }
  try {
    const parsed = JSON.parse(raw) as Partial<ModelConfig>;
    if (!parsed || typeof parsed !== "object" || Object.keys(parsed).length === 0) {
      return createDefaultModelConfig();
    }
    const defaults = createDefaultModelConfig();
    return {
      ...defaults,
      ...parsed,
      title: typeof parsed.title === "string" && parsed.title ? parsed.title : defaults.title,
      entry: (parsed.entry as ModelEntry) || defaults.entry,
      ue5: { ...defaults.ue5, ...(parsed.ue5 ?? {}) },
      three: { ...defaults.three, ...(parsed.three ?? parsed.ue5 ?? {}) },
      scada: { ...defaults.scada, ...(parsed.scada ?? {}) },
    };
  } catch {
    return createDefaultModelConfig();
  }
};

/** 导入模型配置校验：严格失败，不静默回落到默认配置 */
export const validateImportedModelConfiguration = (raw: string): { ok: true; config: ModelConfig } | { ok: false; error: string } => {
  const text = raw.trim();
  if (!text) {
    return { ok: false, error: "配置内容不能为空" };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "JSON 格式错误，请检查语法（如缺少逗号、引号未闭合等）" };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, error: "配置必须是 JSON 对象" };
  }
  const obj = parsed as Record<string, unknown>;
  if (!("entry" in obj) && !("ue5" in obj) && !("three" in obj) && !("scada" in obj)) {
    return { ok: false, error: "未识别为模型配置：请确认包含 entry / ue5 / three / scada 等字段" };
  }
  if ("entry" in obj && typeof obj.entry !== "string") {
    return { ok: false, error: "entry 字段必须是字符串" };
  }
  if ("ue5" in obj && (typeof obj.ue5 !== "object" || obj.ue5 === null || Array.isArray(obj.ue5))) {
    return { ok: false, error: "ue5 字段必须是对象" };
  }
  if ("three" in obj && (typeof obj.three !== "object" || obj.three === null || Array.isArray(obj.three))) {
    return { ok: false, error: "three 字段必须是对象" };
  }
  return { ok: true, config: parseModelConfiguration(text) };
};
