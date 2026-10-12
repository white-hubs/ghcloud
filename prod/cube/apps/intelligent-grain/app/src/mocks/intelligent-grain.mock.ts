import {
  GrainAlertStatus,
  GrainAlertType,
  GrainColorOdorStatus,
  GrainDimension,
  GrainHealthLevel,
  GrainWarehouseType,
  type GrainAlertListItem,
  type GrainAlertPageResult,
  type GrainArchiveDetail,
  type GrainArchiveTrend,
  type GrainDashboardOverview,
  type GrainQualityRecord,
  type GrainRuleConfig,
  type GrainWarehouseRuleRow,
} from "@ghcloud/cube-service-interface/intelligent-grain";

import { registerMock } from "./index";

const collectTime = "2026-06-29T08:30:00+08:00";

const alerts: GrainAlertListItem[] = [
  {
    id: "9001",
    triggeredAt: "2026-06-29T07:48:00+08:00",
    warehouseId: "101",
    warehouseName: "一号浅圆仓",
    grainType: "小麦",
    alertType: GrainAlertType.TEMPERATURE_OVER_LIMIT,
    alertTypeName: "温度超标",
    level: 2,
    currentValueText: "31.8℃",
    thresholdText: ">= 30℃",
    status: GrainAlertStatus.PENDING,
    assignedUserName: "值班员",
  },
  {
    id: "9002",
    triggeredAt: "2026-06-29T06:20:00+08:00",
    warehouseId: "103",
    warehouseName: "三号平房仓",
    grainType: "玉米",
    alertType: GrainAlertType.STORAGE_ABNORMAL,
    alertTypeName: "储量异常",
    level: 3,
    currentValueText: "-2.6t",
    thresholdText: "日波动 <= -2t",
    status: GrainAlertStatus.PROCESSING,
    assignedUserName: "仓储主管",
  },
  {
    id: "9003",
    triggeredAt: "2026-06-28T22:10:00+08:00",
    warehouseId: "102",
    warehouseName: "二号浅圆仓",
    grainType: "稻谷",
    alertType: GrainAlertType.GAS_OVER_LIMIT,
    alertTypeName: "气体超标",
    level: 4,
    currentValueText: "CO2 0.15%",
    thresholdText: "<= 0.12%",
    status: GrainAlertStatus.CHECKING,
    assignedUserName: "质检员",
  },
];

const dashboard: GrainDashboardOverview = {
  refreshTime: collectTime,
  total: 3,
  warehouses: [
    {
      warehouseId: "101",
      warehouseName: "一号浅圆仓",
      areaName: "东区",
      grainType: "小麦",
      warehouseType: GrainWarehouseType.SHALLOW_ROUND,
      healthScore: 72,
      healthLevel: GrainHealthLevel.WARN,
      offline: false,
      latestCollectTime: collectTime,
      temperature: { metricCode: "TEMP_MAX", metricName: "最高粮温", value: 31.8, unit: "℃", status: "ALARM", collectTime },
      storage: { metricCode: "WEIGHT", metricName: "实时重量", value: 5280, unit: "t", status: "NORMAL", collectTime },
      humidity: { metricCode: "HUMIDITY", metricName: "仓内湿度", value: 63, unit: "%RH", status: "NORMAL", collectTime },
      gas: { metricCode: "CO2", metricName: "二氧化碳", value: 0.09, unit: "%", status: "NORMAL", collectTime },
      activeAlert: alerts[0],
    },
    {
      warehouseId: "102",
      warehouseName: "二号浅圆仓",
      areaName: "东区",
      grainType: "稻谷",
      warehouseType: GrainWarehouseType.SHALLOW_ROUND,
      healthScore: 86,
      healthLevel: GrainHealthLevel.GOOD,
      offline: false,
      latestCollectTime: collectTime,
      temperature: { metricCode: "TEMP_MAX", metricName: "最高粮温", value: 24.6, unit: "℃", status: "NORMAL", collectTime },
      storage: { metricCode: "WEIGHT", metricName: "实时重量", value: 4960, unit: "t", status: "NORMAL", collectTime },
      humidity: { metricCode: "HUMIDITY", metricName: "仓内湿度", value: 58, unit: "%RH", status: "NORMAL", collectTime },
      gas: { metricCode: "CO2", metricName: "二氧化碳", value: 0.15, unit: "%", status: "ALARM", collectTime },
      activeAlert: alerts[2],
    },
    {
      warehouseId: "103",
      warehouseName: "三号平房仓",
      areaName: "西区",
      grainType: "玉米",
      warehouseType: GrainWarehouseType.FLAT_WAREHOUSE,
      healthScore: 64,
      healthLevel: GrainHealthLevel.DANGER,
      offline: false,
      latestCollectTime: collectTime,
      temperature: { metricCode: "TEMP_MAX", metricName: "最高粮温", value: 28.2, unit: "℃", status: "NORMAL", collectTime },
      storage: { metricCode: "WEIGHT", metricName: "实时重量", value: 3120, unit: "t", status: "ALARM", collectTime },
      humidity: { metricCode: "HUMIDITY", metricName: "仓内湿度", value: 69, unit: "%RH", status: "ALARM", collectTime },
      gas: { metricCode: "CO2", metricName: "二氧化碳", value: 0.08, unit: "%", status: "NORMAL", collectTime },
      activeAlert: alerts[1],
    },
  ],
  alertQuickList: alerts,
};

const globalRules: GrainRuleConfig = {
  temperature: { max: 30, trendIncrease: 4, durationHours: 6 },
  storage: { dayDecreaseTon: 2, volumeDeviationPercent: 3 },
  humidity: { max: 70 },
  gas: { co2Max: 0.12, o2Min: 19.5 },
  escalation: { level2Minutes: 30, level3Minutes: 120 },
  version: 1,
};

const warehouseRules: GrainWarehouseRuleRow[] = [
  {
    warehouseId: "101",
    warehouseName: "一号浅圆仓",
    grainType: "小麦",
    overrideDimensions: [{ dimension: GrainDimension.TEMPERATURE, summary: "高温阈值 30℃" }],
    updatedAt: "2026-06-28T17:30:00+08:00",
  },
  {
    warehouseId: "102",
    warehouseName: "二号浅圆仓",
    grainType: "稻谷",
    overrideDimensions: [],
    updatedAt: "2026-06-25T11:12:00+08:00",
  },
  {
    warehouseId: "103",
    warehouseName: "三号平房仓",
    grainType: "玉米",
    overrideDimensions: [
      { dimension: GrainDimension.STORAGE, summary: "仓容日降阈值 2t" },
      { dimension: GrainDimension.HUMIDITY, summary: "湿度阈值 68%RH" },
    ],
    updatedAt: "2026-06-27T09:45:00+08:00",
  },
];

const qualityRecords: GrainQualityRecord[] = [
  {
    recordId: "7001",
    warehouseId: "102",
    warehouseName: "二号浅圆仓",
    grainVarietyName: "稻谷",
    grainType: "稻谷",
    inboundDate: "2025-04-01",
    inspectionTime: "2026-06-20T00:00:00+08:00",
    moisture: 12.5,
    fattyAcid: 15.2,
    germinationRate: 98,
    impurityRate: 0.3,
    imperfectGrainRate: 1,
    yellowRiceRate: 0.3,
    colorOdor: GrainColorOdorStatus.NORMAL,
    colorOdorName: "正常",
    inspector: "李明辉",
    updateTime: "2026-06-20T10:00:00+08:00",
  },
  {
    recordId: "7002",
    warehouseId: "101",
    warehouseName: "一号浅圆仓",
    grainVarietyName: "小麦",
    grainType: "小麦",
    inboundDate: "2025-03-15",
    inspectionTime: "2026-06-10T00:00:00+08:00",
    moisture: 12.3,
    fattyAcid: 18,
    germinationRate: 96,
    impurityRate: 0.5,
    imperfectGrainRate: 1.8,
    colorOdor: GrainColorOdorStatus.NORMAL,
    colorOdorName: "正常",
    inspector: "李明辉",
    updateTime: "2026-06-10T10:00:00+08:00",
  },
  {
    recordId: "7003",
    warehouseId: "103",
    warehouseName: "三号平房仓",
    grainVarietyName: "玉米",
    grainType: "玉米",
    inboundDate: "2025-06-01",
    inspectionTime: "2026-06-01T00:00:00+08:00",
    moisture: 14.2,
    fattyAcid: 30.8,
    germinationRate: 85,
    impurityRate: 1.2,
    imperfectGrainRate: 4.2,
    colorOdor: GrainColorOdorStatus.SLIGHT_ABNORMAL,
    colorOdorName: "轻微异常",
    inspector: "王永强",
    updateTime: "2026-06-01T10:00:00+08:00",
  },
];

function buildArchive(warehouseId: string): GrainArchiveDetail {
  const warehouse = dashboard.warehouses.find((item) => item.warehouseId === warehouseId) ?? dashboard.warehouses[0];
  return {
    warehouseId: warehouse.warehouseId,
    warehouseName: warehouse.warehouseName,
    areaName: warehouse.areaName,
    grainType: warehouse.grainType,
    inboundDate: "2026-05-10",
    latestScanTime: collectTime,
    health: {
      score: warehouse.healthScore,
      level: warehouse.healthLevel,
      dimensionScores: [
        {
          dimension: GrainDimension.TEMPERATURE,
          label: "温度",
          score: warehouse.healthLevel === GrainHealthLevel.WARN ? 68 : 86,
          weight: 0.3,
          ready: true,
        },
        {
          dimension: GrainDimension.STORAGE,
          label: "仓容",
          score: warehouse.healthLevel === GrainHealthLevel.DANGER ? 55 : 82,
          weight: 0.25,
          ready: true,
        },
        { dimension: GrainDimension.HUMIDITY, label: "湿度", score: 78, weight: 0.2, ready: true },
        { dimension: GrainDimension.GAS, label: "气体", score: 80, weight: 0.15, ready: true },
        { dimension: GrainDimension.QUALITY, label: "品质", score: 0, weight: 0.1, ready: false },
      ],
    },
    metrics: {
      temperature: warehouse.temperature,
      storage: warehouse.storage,
      humidity: warehouse.humidity ?? { metricCode: "HUMIDITY", metricName: "仓内湿度", value: 0, unit: "%RH" },
      gas: warehouse.gas ?? { metricCode: "CO2", metricName: "二氧化碳", value: 0, unit: "%" },
    },
    radar: [
      { dimension: GrainDimension.TEMPERATURE, label: "温度", value: 68 },
      { dimension: GrainDimension.STORAGE, label: "仓容", value: 76 },
      { dimension: GrainDimension.HUMIDITY, label: "湿度", value: 78 },
      { dimension: GrainDimension.GAS, label: "气体", value: 80 },
    ],
    ventilationSuggestion: {
      source: "RULE",
      ready: true,
      confidence: 0.82,
      summary: warehouse.healthLevel === GrainHealthLevel.DANGER ? "建议立即安排通风并复核仓容数据。" : "建议夜间低温时段短时通风。",
      suggestions: ["复核传感器采集时间", "优先处理当前活跃告警"],
    },
    qualityPrediction: {
      source: "RULE",
      ready: true,
      confidence: 0.72,
      summary: "品质维度基于积温推算（精度±3个月），待接入化验室实测数据后可校准。",
      suggestions: [
        "当前按品种、入库日期、累计积温和水分规则估算。",
        "待接入 intelligent_grain_quality_record 最近实测脂肪酸值后可校准预测结果。",
      ],
      grainType: warehouse.grainType,
      storageDays: 570,
      storageMonths: 19,
      accumulatedTemperature: 8320,
      standardAccumulatedTemperature: 8550,
      baseDecayRate: warehouse.grainType === "玉米" ? 0.7 : warehouse.grainType === "稻谷" ? 0.6 : 0.4,
      temperatureAccelerationFactor: 0.97,
      moistureCorrectionFactor: 1,
      safeMoisture: warehouse.grainType === "玉米" ? 14 : warehouse.grainType === "稻谷" ? 14.5 : 12.5,
      currentMoisture: warehouse.grainType === "玉米" ? 14 : warehouse.grainType === "稻谷" ? 14.5 : 12.5,
      initialFattyAcid: 20,
      latestMeasuredFattyAcid: null,
      latestMeasuredAt: null,
      currentFattyAcidEstimate: warehouse.grainType === "玉米" ? 33.3 : warehouse.grainType === "稻谷" ? 31.1 : 27.4,
      monthlyDecayRate: warehouse.grainType === "玉米" ? 0.7 : warehouse.grainType === "稻谷" ? 0.6 : 0.4,
      unsuitableThreshold: 35,
      expectedUnsuitableDate: warehouse.grainType === "玉米" ? "2026-09-01" : warehouse.grainType === "稻谷" ? "2027-01-01" : "2027-03-01",
      calibratedByMeasured: false,
      precisionNote: "基于积温推算，精度±3个月",
    },
    riskPredictions: [
      {
        source: "RULE",
        ready: true,
        confidence: 0.76,
        summary: "粮温-露点差 9.8℃（安全区间>5℃），温度梯度正常。无结露风险，建议持续监测。",
        suggestions: [],
        type: "DEW",
        title: "结露预测",
        icon: "💧",
        badgeText: "正常",
        badgeLevel: "normal",
        metrics: [
          { label: "露点温度", value: "12.3℃" },
          { label: "粮温-露点差", value: "9.8℃", highlight: true },
          { label: "表层粮温", value: "21.3℃" },
          { label: "温度梯度", value: "3.2℃", highlight: true },
        ],
        conclusion: "粮温-露点差 9.8℃（安全区间>5℃），温度梯度正常。无结露风险，建议持续监测。",
      },
      {
        source: "RULE",
        ready: true,
        confidence: 0.78,
        summary: "湿度>70%RH持续72h + 温度22-25℃ + CO₂上升 → 霉菌生长三条件齐备，建议立即通风降湿",
        suggestions: [],
        type: "MOLD",
        title: "霉变预测",
        icon: "🍄",
        badgeText: "一级",
        badgeLevel: "danger",
        metrics: [
          { label: "霉变风险指数", value: "78/100", highlight: true },
          { label: "预计恶化时间", value: "5-7天", highlight: true },
          { label: "水分活度", value: "0.72 aw" },
          { label: "CO₂增幅", value: "+15%/周", highlight: true },
        ],
        conclusion: "湿度>70%RH持续72h + 温度22-25℃ + CO₂上升 → 霉菌生长三条件齐备，建议立即通风降湿",
      },
      {
        source: "RULE",
        ready: true,
        confidence: 0.52,
        summary: "进入玉米象活跃季 + 3个测温点局部升温 + 该仓去年7月曾有虫害记录 → 建议专项检查",
        suggestions: [],
        type: "PEST",
        title: "虫害预测",
        icon: "🐛",
        badgeText: "三级",
        badgeLevel: "warn",
        metrics: [
          { label: "虫害风险评分", value: "52/100", highlight: true },
          { label: "活跃虫季", value: "6-9月" },
          { label: "升温异常点数", value: "3个" },
          { label: "历史复发风险", value: "中等", highlight: true },
        ],
        conclusion: "进入玉米象活跃季 + 3个测温点局部升温 + 该仓去年7月曾有虫害记录 → 建议专项检查",
      },
    ],
    latestAlert: warehouse.activeAlert,
  };
}

function buildTrend(): GrainArchiveTrend {
  return {
    dimension: GrainDimension.TEMPERATURE,
    metric: "TEMP_MAX",
    unit: "℃",
    thresholds: [{ name: "高温阈值", value: 30, unit: "℃" }],
    series: [
      {
        name: "最高粮温",
        unit: "℃",
        points: [
          { time: "2026-06-23", value: 27.6 },
          { time: "2026-06-24", value: 28.4 },
          { time: "2026-06-25", value: 29.2 },
          { time: "2026-06-26", value: 30.1, triggered: true },
          { time: "2026-06-27", value: 30.8, triggered: true },
          { time: "2026-06-28", value: 31.3, triggered: true },
          { time: "2026-06-29", value: 31.8, triggered: true },
        ],
      },
    ],
    summary: [
      { label: "峰值", value: "31.8℃", level: "danger" },
      { label: "七日增幅", value: "+4.2℃", level: "warn" },
    ],
  };
}

export function registerIntelligentGrainMocks(): void {
  registerMock("GET", /^\/api\/intelligent-grain\/dashboard\/overview/, () => dashboard);
  registerMock("GET", /^\/api\/intelligent-grain\/warehouses\/options/, () =>
    dashboard.warehouses.map((item) => ({
      warehouseId: item.warehouseId,
      warehouseName: item.warehouseName,
      areaName: item.areaName,
      grainVarietyId: item.warehouseId,
      grainVarietyName: item.grainType,
      grainType: item.grainType,
    })),
  );
  registerMock("GET", /^\/api\/intelligent-grain\/grain-varieties\/options/, () =>
    dashboard.warehouses.map((item) => ({
      varietyId: item.warehouseId,
      varietyName: item.grainType,
      warehouseId: item.warehouseId,
    })),
  );
  registerMock("GET", /^\/api\/intelligent-grain\/grain\/archives\/[^/]+$/, (req) => {
    const warehouseId = new URL(req.url).pathname.split("/").pop() ?? "101";
    return buildArchive(warehouseId);
  });
  registerMock("GET", /^\/api\/intelligent-grain\/archives\/[^/]+\/trend/, () => buildTrend());
  registerMock("GET", /^\/api\/intelligent-grain\/archives\/[^/]+\/records\/page/, () => ({
    total: 2,
    pages: 1,
    records: [
      { collectTime, value: 31.8, unit: "℃", deviceId: "temp-01", deviceName: "温湿度探头 01", metricName: "最高粮温", status: "ALARM" },
      { collectTime, value: 5280, unit: "t", deviceId: "scale-01", deviceName: "仓容秤 01", metricName: "实时重量", status: "NORMAL" },
    ],
  }));
  registerMock("GET", /^\/api\/intelligent-grain\/rules\/global/, () => globalRules);
  registerMock("PUT", /^\/api\/intelligent-grain\/rules\/global/, () => null);
  registerMock("POST", /^\/api\/intelligent-grain\/rules\/factory-defaults\/restore/, () => globalRules);
  registerMock("GET", /^\/api\/intelligent-grain\/rules\/warehouses\/page/, () => ({
    total: warehouseRules.length,
    pages: 1,
    records: warehouseRules,
  }));
  registerMock("GET", /^\/api\/intelligent-grain\/rules\/engine-constants/, () => ({
    dimensions: Object.values(GrainDimension),
    ruleCodes: ["TEMPERATURE_MAX", "STORAGE_DAILY_DROP", "HUMIDITY_MAX", "GAS_CO2_MAX"],
    supportedRanges: [7, 30, 90, 365],
  }));
  registerMock("GET", /^\/api\/intelligent-grain\/quality-records\/page/, () => ({
    total: qualityRecords.length,
    pages: 1,
    records: qualityRecords,
  }));
  registerMock("GET", /^\/api\/intelligent-grain\/quality-records\/export/, () => ({ fileName: "品质录入.xlsx" }));
  registerMock("POST", /^\/api\/intelligent-grain\/quality-records$/, () => qualityRecords[0]);
  registerMock("PUT", /^\/api\/intelligent-grain\/quality-records\/[^/]+$/, () => qualityRecords[0]);
  registerMock("DELETE", /^\/api\/intelligent-grain\/quality-records\/[^/]+$/, () => null);
  registerMock("GET", /^\/api\/intelligent-grain\/alerts\/page/, () => {
    const result: GrainAlertPageResult = {
      total: alerts.length,
      pages: 1,
      records: alerts,
      tabCounts: {
        ALL: alerts.length,
        PENDING: 1,
        PROCESSING: 1,
        CHECKING: 1,
      },
    };
    return result;
  });
  registerMock("GET", /^\/api\/intelligent-grain\/alerts\/export/, () => ({ fileName: "粮情告警.xlsx" }));
  registerMock("GET", /^\/api\/intelligent-grain\/mobile\/summary/, () => ({
    refreshTime: collectTime,
    warehouses: dashboard.warehouses,
    myAlerts: alerts,
  }));
  registerMock("GET", /^\/api\/intelligent-grain\/mobile\/my-alerts/, () => ({
    total: alerts.length,
    pages: 1,
    records: alerts,
  }));
}
