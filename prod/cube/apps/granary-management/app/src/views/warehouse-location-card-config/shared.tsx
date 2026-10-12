import { DatePicker } from "ant-design-vue";
import dayjs, { type Dayjs } from "dayjs";

import type {
  WarehouseLocationCardPositionProfileSaveParam,
  WarehouseLocationCardPositionProfileVO,
  WarehouseLocationCardQualityInspectionSaveParam,
  WarehouseLocationCardQualityInspectionVO,
} from "@ghcloud/cube-granary-management-service";
import { PopOver } from "@ghcloud/cube-ui";

export interface ProfileFormState {
  positionNo: string;
  positionCode: string;
  flatWarehouseNo: string;
  length: string;
  width: string;
  height: string;
  temperatureRangeMin: string;
  temperatureRangeMax: string;
  digitalGrainVolume: string;
  deductedVolume: string;
  storageBagCount: string;
  averageBagWeight: string;
  originPlace: string;
  harvestYear: string;
  keeper: string;
  filingDate: string;
  authorizedUnit: string;
  storageSite: string;
  inboundTime: string;
  storageNature: string;
  storageMode: string;
  constantTemperatureRate: string;
  bulkDensityOrRoughness: string;
  convertedMoisture: string;
  wholeOrImperfectGrain: string;
}

export interface QualityFormState {
  id: number | string | null;
  inspectionTime: number | null;
  inspector: string;
  moisture: string;
  impurity: string;
  mixedRate: string;
  headRiceRate: string;
  outOfPaddyBrownRiceRate: string;
  yellowRiceRate: string;
  tasteScore: string;
  roughness: string;
  fattyAcid: string;
  cadmium: string;
  aflatoxinB1: string;
  lead: string;
  mercury: string;
  inorganicArsenic: string;
  colorSmell: string;
}

export const emptyProfileForm = (): ProfileFormState => ({
  positionNo: "",
  positionCode: "",
  flatWarehouseNo: "",
  length: "",
  width: "",
  height: "",
  temperatureRangeMin: "",
  temperatureRangeMax: "",
  digitalGrainVolume: "",
  deductedVolume: "",
  storageBagCount: "",
  averageBagWeight: "",
  originPlace: "",
  harvestYear: "",
  keeper: "",
  filingDate: "",
  authorizedUnit: "",
  storageSite: "",
  inboundTime: "",
  storageNature: "",
  storageMode: "",
  constantTemperatureRate: "",
  bulkDensityOrRoughness: "",
  convertedMoisture: "",
  wholeOrImperfectGrain: "",
});

export const emptyQualityForm = (): QualityFormState => ({
  id: null,
  inspectionTime: null,
  inspector: "",
  moisture: "",
  impurity: "",
  mixedRate: "",
  headRiceRate: "",
  outOfPaddyBrownRiceRate: "",
  yellowRiceRate: "",
  tasteScore: "",
  roughness: "",
  fattyAcid: "",
  cadmium: "",
  aflatoxinB1: "",
  lead: "",
  mercury: "",
  inorganicArsenic: "",
  colorSmell: "",
});

export const text = (value: unknown): string => {
  if (value == null || value === "") {
    return "--";
  }
  const s = String(value);
  return s === "[object InputEvent]" ? "--" : s;
};

const inputText = (value: unknown): string => {
  if (value == null) {
    return "";
  }
  const s = String(value);
  return s === "[object InputEvent]" ? "" : s;
};

const payloadText = (value: string): string => {
  const s = value.trim();
  return s === "[object InputEvent]" ? "" : s;
};

const pickerDateString = (dateString: string | string[], showTime: boolean): string => {
  const value = Array.isArray(dateString) ? (dateString[0] ?? "") : dateString;
  return showTime ? value.replace(" ", "T") : value;
};

const numberValue = (value: string): number | null => {
  const s = payloadText(value);
  if (s === "") {
    return null;
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const timestampValue = (value: string | number | null | undefined): number | null => {
  if (value == null || value === "") {
    return null;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  const s = payloadText(value);
  if (s === "") {
    return null;
  }
  if (/^\d{10,}$/.test(s)) {
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }
  const parsed = dayjs(s.replace("T", " "));
  return parsed.isValid() ? parsed.valueOf() : null;
};

export const formatDateTime = (value: string | number | null | undefined): string => {
  if (value == null || value === "") {
    return "--";
  }
  if (typeof value === "number") {
    return dayjs(value).format("YYYY-MM-DD HH:mm:ss");
  }
  return value.replace("T", " ").slice(0, 19);
};

export const parseDateTime = (value: string): Dayjs | null => {
  const s = value.trim();
  if (s === "") {
    return null;
  }
  if (/^\d{10,}$/.test(s)) {
    return dayjs(Number(s));
  }
  return dayjs(s.replace("T", " "));
};

export const routeQueryString = (raw: unknown): string => {
  if (Array.isArray(raw)) {
    return routeQueryString(raw[0]);
  }
  return typeof raw === "string" ? raw : "";
};

export const renderCell = (value: unknown): JSX.Element => {
  const v = text(value);
  return <PopOver content={v}>{v}</PopOver>;
};

export const copyProfileToForm = (form: ProfileFormState, profile: WarehouseLocationCardPositionProfileVO | null | undefined): void => {
  const p = profile ?? {};
  form.positionNo = inputText((p as WarehouseLocationCardPositionProfileVO).positionNo);
  form.positionCode = inputText((p as WarehouseLocationCardPositionProfileVO).positionCode);
  form.flatWarehouseNo = inputText((p as WarehouseLocationCardPositionProfileVO).flatWarehouseNo);
  form.length = inputText((p as WarehouseLocationCardPositionProfileVO).length);
  form.width = inputText((p as WarehouseLocationCardPositionProfileVO).width);
  form.height = inputText((p as WarehouseLocationCardPositionProfileVO).height);
  form.temperatureRangeMin = inputText((p as WarehouseLocationCardPositionProfileVO).temperatureRangeMin);
  form.temperatureRangeMax = inputText((p as WarehouseLocationCardPositionProfileVO).temperatureRangeMax);
  form.digitalGrainVolume = inputText((p as WarehouseLocationCardPositionProfileVO).digitalGrainVolume);
  form.deductedVolume = inputText((p as WarehouseLocationCardPositionProfileVO).deductedVolume);
  form.storageBagCount = inputText((p as WarehouseLocationCardPositionProfileVO).storageBagCount);
  form.averageBagWeight = inputText((p as WarehouseLocationCardPositionProfileVO).averageBagWeight);
  form.originPlace = inputText((p as WarehouseLocationCardPositionProfileVO).originPlace);
  form.harvestYear = inputText((p as WarehouseLocationCardPositionProfileVO).harvestYear);
  form.keeper = inputText((p as WarehouseLocationCardPositionProfileVO).keeper);
  form.filingDate = inputText((p as WarehouseLocationCardPositionProfileVO).filingDate);
  form.authorizedUnit = inputText((p as WarehouseLocationCardPositionProfileVO).authorizedUnit);
  form.storageSite = inputText((p as WarehouseLocationCardPositionProfileVO).storageSite);
  form.inboundTime = inputText((p as WarehouseLocationCardPositionProfileVO).inboundTime);
  form.storageNature = inputText((p as WarehouseLocationCardPositionProfileVO).storageNature);
  form.storageMode = inputText((p as WarehouseLocationCardPositionProfileVO).storageMode);
  form.constantTemperatureRate = inputText((p as WarehouseLocationCardPositionProfileVO).constantTemperatureRate);
  form.bulkDensityOrRoughness = inputText((p as WarehouseLocationCardPositionProfileVO).bulkDensityOrRoughness);
  form.convertedMoisture = inputText((p as WarehouseLocationCardPositionProfileVO).convertedMoisture);
  form.wholeOrImperfectGrain = inputText((p as WarehouseLocationCardPositionProfileVO).wholeOrImperfectGrain);
};

export const copyQualityToForm = (form: QualityFormState, record?: WarehouseLocationCardQualityInspectionVO): void => {
  const q = record ?? emptyQualityForm();
  form.id = record?.id ?? null;
  form.inspectionTime = timestampValue(q.inspectionTime);
  form.inspector = inputText(q.inspector);
  form.moisture = inputText(q.moisture);
  form.impurity = inputText((q as WarehouseLocationCardQualityInspectionVO & { impurity?: number | null }).impurity);
  form.mixedRate = inputText((q as WarehouseLocationCardQualityInspectionVO & { mixedRate?: number | null }).mixedRate);
  form.headRiceRate = inputText((q as WarehouseLocationCardQualityInspectionVO & { headRiceRate?: number | null }).headRiceRate);
  form.outOfPaddyBrownRiceRate = inputText(
    (q as WarehouseLocationCardQualityInspectionVO & { outOfPaddyBrownRiceRate?: number | null }).outOfPaddyBrownRiceRate,
  );
  form.yellowRiceRate = inputText((q as WarehouseLocationCardQualityInspectionVO & { yellowRiceRate?: number | null }).yellowRiceRate);
  form.tasteScore = inputText((q as WarehouseLocationCardQualityInspectionVO & { tasteScore?: number | null }).tasteScore);
  form.roughness = inputText(
    (q as WarehouseLocationCardQualityInspectionVO & { roughRiceYield?: number | null }).roughness ??
      (q as WarehouseLocationCardQualityInspectionVO & { roughRiceYield?: number | null }).roughRiceYield,
  );
  form.fattyAcid = inputText(q.fattyAcid);
  form.cadmium = inputText((q as WarehouseLocationCardQualityInspectionVO & { cadmium?: number | null }).cadmium);
  form.aflatoxinB1 = inputText((q as WarehouseLocationCardQualityInspectionVO & { aflatoxinB1?: number | null }).aflatoxinB1);
  form.lead = inputText((q as WarehouseLocationCardQualityInspectionVO & { lead?: number | null }).lead);
  form.mercury = inputText((q as WarehouseLocationCardQualityInspectionVO & { mercury?: number | null }).mercury);
  form.inorganicArsenic = inputText(
    (q as WarehouseLocationCardQualityInspectionVO & { inorganicArsenic?: number | null }).inorganicArsenic,
  );
  form.colorSmell = inputText(q.colorSmell);
};

export const ProfileField = (props: {
  label: string;
  value: string;
  editable: boolean;
  required?: boolean;
  changeValue: (value: string) => void;
}): JSX.Element => (
  <label class="location-card-config-field">
    <span class="location-card-config-field-label">
      {props.label}
      {props.required === true ? " *" : ""}
    </span>
    <input
      class="location-card-config-native-input"
      value={inputText(props.value)}
      disabled={!props.editable}
      placeholder={props.editable ? "请输入" : ""}
      onInput={(event) => props.changeValue((event.target as HTMLInputElement).value)}
    />
  </label>
);

export const ProfileRangeField = (props: {
  label: string;
  minValue: string;
  maxValue: string;
  editable: boolean;
  changeMinValue: (value: string) => void;
  changeMaxValue: (value: string) => void;
}): JSX.Element => (
  <label class="location-card-config-field">
    <span class="location-card-config-field-label">{props.label}</span>
    <span class="location-card-config-range-inputs">
      <input
        class="location-card-config-native-input"
        type="number"
        value={inputText(props.minValue)}
        disabled={!props.editable}
        placeholder={props.editable ? "下限" : ""}
        onInput={(event) => props.changeMinValue((event.target as HTMLInputElement).value)}
      />
      <span class="location-card-config-range-separator">至</span>
      <input
        class="location-card-config-native-input"
        type="number"
        value={inputText(props.maxValue)}
        disabled={!props.editable}
        placeholder={props.editable ? "上限" : ""}
        onInput={(event) => props.changeMaxValue((event.target as HTMLInputElement).value)}
      />
    </span>
  </label>
);

export const ProfileDateField = (props: {
  label: string;
  value: string;
  editable: boolean;
  required?: boolean;
  showTime?: boolean;
  changeValue: (value: string) => void;
}): JSX.Element => {
  const showTime = props.showTime ?? true;
  return (
    <label class="location-card-config-field">
      <span class="location-card-config-field-label">
        {props.label}
        {props.required === true ? " *" : ""}
      </span>
      <DatePicker
        value={parseDateTime(props.value)}
        disabled={!props.editable}
        showTime={showTime}
        format={showTime ? "YYYY-MM-DD HH:mm:ss" : "YYYY-MM-DD"}
        placeholder={props.editable ? "请选择" : ""}
        style={{ width: "100%" }}
        onChange={(_value: Dayjs | null, dateString: string | string[]) => {
          props.changeValue(pickerDateString(dateString, showTime));
        }}
      />
    </label>
  );
};

export const TimestampDateField = (props: {
  label: string;
  value: number | null;
  editable: boolean;
  required?: boolean;
  changeValue: (value: number | null) => void;
}): JSX.Element => (
  <label class="location-card-config-field">
    <span class="location-card-config-field-label">
      {props.label}
      {props.required === true ? " *" : ""}
    </span>
    <DatePicker
      value={props.value == null ? null : dayjs(props.value)}
      disabled={!props.editable}
      showTime
      format="YYYY-MM-DD HH:mm:ss"
      placeholder={props.editable ? "请选择" : ""}
      style={{ width: "100%" }}
      onChange={(value: Dayjs | null) => {
        props.changeValue(value == null ? null : value.valueOf());
      }}
    />
  </label>
);

export const buildProfilePayload = (warehouseId: number, form: ProfileFormState): WarehouseLocationCardPositionProfileSaveParam => ({
  warehouseId,
  positionCode: payloadText(form.positionCode),
  flatWarehouseNo: payloadText(form.flatWarehouseNo),
  length: numberValue(form.length),
  width: numberValue(form.width),
  height: numberValue(form.height),
  temperatureRangeMin: numberValue(form.temperatureRangeMin),
  temperatureRangeMax: numberValue(form.temperatureRangeMax),
  digitalGrainVolume: numberValue(form.digitalGrainVolume),
  deductedVolume: numberValue(form.deductedVolume),
  storageBagCount: numberValue(form.storageBagCount),
  averageBagWeight: numberValue(form.averageBagWeight),
  originPlace: payloadText(form.originPlace),
  harvestYear: payloadText(form.harvestYear),
  keeper: payloadText(form.keeper),
  filingDate: payloadText(form.filingDate),
  authorizedUnit: payloadText(form.authorizedUnit),
  storageSite: payloadText(form.storageSite),
  inboundTime: payloadText(form.inboundTime),
  storageNature: payloadText(form.storageNature),
  storageMode: payloadText(form.storageMode),
  constantTemperatureRate: numberValue(form.constantTemperatureRate),
  bulkDensityOrRoughness: numberValue(form.bulkDensityOrRoughness),
  convertedMoisture: numberValue(form.convertedMoisture),
  wholeOrImperfectGrain: numberValue(form.wholeOrImperfectGrain),
});

type FilledQualityFormState = Omit<QualityFormState, "inspectionTime"> & { inspectionTime: number };

export const buildQualityPayload = (
  warehouseId: number,
  form: FilledQualityFormState,
): WarehouseLocationCardQualityInspectionSaveParam => ({
  ...(form.id != null ? { id: form.id } : { warehouseId }),
  inspectionTime: form.inspectionTime,
  inspector: payloadText(form.inspector),
  moisture: numberValue(form.moisture),
  impurity: numberValue(form.impurity),
  mixedRate: numberValue(form.mixedRate),
  headRiceRate: numberValue(form.headRiceRate),
  outOfPaddyBrownRiceRate: numberValue(form.outOfPaddyBrownRiceRate),
  yellowRiceRate: numberValue(form.yellowRiceRate),
  tasteScore: numberValue(form.tasteScore),
  roughness: numberValue(form.roughness),
  fattyAcid: numberValue(form.fattyAcid),
  cadmium: numberValue(form.cadmium),
  aflatoxinB1: numberValue(form.aflatoxinB1),
  lead: numberValue(form.lead),
  mercury: numberValue(form.mercury),
  inorganicArsenic: numberValue(form.inorganicArsenic),
  colorSmell: payloadText(form.colorSmell),
});
