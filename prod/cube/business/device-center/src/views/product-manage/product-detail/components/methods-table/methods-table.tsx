import { defineComponent, reactive, ref, onMounted } from "vue";

import { useCubeModal } from "@ghcloud/cube-app-design";
import { Input, Select, Button, message, Form, FormItem, InputNumber, CheckCircleFilled } from "@ghcloud/cube-ui";

import { cubeDeviceCenterService } from "@/api/service";

import styles from "./methods-table.module.less";
interface DataTypeOption {
  label: string;
  value: string;
}
interface Props {
  id: string;
}
interface MethodRow {
  order: number;
  identifier: string;
  name: string;
  isAsync: "async" | "sync";
  outputType: string;
  outputIdentifier?: string;
  outputName?: string;
  description: string;
  unit?: string | null;
  min?: number | undefined;
  max?: number | undefined;
  precision?: number | undefined;
  enumItems?: { value: string | number; text: string }[];
  inputParams?: InputParam[];
  outputParams?: OutputParam[];
  inputRequired: boolean;
  outputRequired: boolean;
  maxLength?: number | undefined;
  boolZeroText?: string | undefined;
  boolOneText?: string | undefined;
  dataRequired: boolean;
  id?: string;
}

interface InputParam {
  order: number;
  identifier: string;
  name: string;
  required: "REQUIRED" | "OPTIONAL";
  dataType: string;
  unit?: string | null;
  min?: number | undefined;
  max?: number | undefined;
  precision?: number | undefined;
  enumItems?: { value: string | number; text: string }[];
  maxLength?: number | undefined;
  boolZeroText?: string | undefined;
  boolOneText?: string | undefined;
  dataRequired: boolean;
}

interface OutputParam {
  order: number;
  identifier?: string;
  name?: string;
  dataType: string;
  unit?: string | null;
  min?: number | undefined;
  max?: number | undefined;
  precision?: number | undefined;
  enumItems?: { value: string | number; text: string }[];
  maxLength?: number | undefined;
  boolZeroText?: string | undefined;
  boolOneText?: string | undefined;
  dataRequired: boolean;
}

const DEFAULT_INITIAL_ROW_COUNT = 10;
const MIN_NUMERIC_RANGE_VALUE = -999_999_999_999_999;

function buildEmptyRow(order: number): MethodRow {
  return {
    order,
    identifier: "",
    name: "",
    isAsync: "sync",
    outputType: "int",
    outputIdentifier: "",
    outputName: "",
    description: "",
    dataRequired: false,
    inputRequired: false,
    outputRequired: false,
  };
}

/** 构建表格初始行 */
function buildInitialRows(): MethodRow[] {
  return Array.from({ length: DEFAULT_INITIAL_ROW_COUNT }, (_, index) => buildEmptyRow(index + 1));
}

/** 打开输入参数配置弹窗 */
function openInputParamsConfig(row: MethodRow): void {
  currentMethod.value = row;
  inputParamsState.items = (row.inputParams || []).map((p) => ({ ...p }));
  if (inputParamsState.items.length === 0) {
    inputParamsState.items.push({ order: 1, identifier: "", name: "", required: "OPTIONAL", dataType: "int", dataRequired: false });
  }
  inputParamsModalApi.open();
}

/** 打开输出参数配置弹窗 */
function openOutputParamsConfig(row: MethodRow): void {
  currentMethod.value = row;
  outputParamsState.items = (row.outputParams || []).map((p) => ({ ...p }));
  if (outputParamsState.items.length === 0) {
    outputParamsState.items.push({ order: 1, identifier: "", name: "", dataType: "int", dataRequired: false });
  }
  if (outputParamsState.items.length > 0) {
    const first = outputParamsState.items[0];
    if (!first.identifier && row.outputIdentifier) {
      first.identifier = row.outputIdentifier;
    }
    if (!first.name && row.outputName) {
      first.name = row.outputName;
    }
  }
  outputParamsModalApi.open();
}

const currentRow = ref<MethodRow | InputParam | OutputParam | null>(null);
const currentMethod = ref<MethodRow | null>(null);

const enumState = reactive<{ items: { order: number; value: string | number; text: string }[] }>({ items: [] });
const [EnumModal, enumModalApi] = useCubeModal({
  title: "枚举项",
  onConfirm: () => {
    const hasItems = enumState.items && enumState.items.length > 0;
    const allValid = hasItems && enumState.items.every((e) => String(e.value).length > 0 && String(e.text).length > 0);
    if (!allValid) {
      message.warning("请完善必填项：枚举项的 Value 与 Text");
      return;
    }
    if (currentRow.value) {
      currentRow.value.enumItems = enumState.items.map((e) => ({ value: e.value, text: e.text }));
      currentRow.value.dataRequired = true;
    }
    enumModalApi.close();
  },
  onCancel: () => enumModalApi.close(),
});

const typeConfigState = reactive<{
  type: string;
  min?: number | undefined;
  max?: number | undefined;
  precision?: number | undefined;
  maxLength?: number | undefined;
  boolZeroText?: string | undefined;
  boolOneText?: string | undefined;
}>({ type: "int" });
const [TypeConfigModal, typeConfigModalApi] = useCubeModal({
  title: "参数配置",
  onConfirm: () => {
    const t = typeConfigState.type;

    if (t === "int" || t === "float" || t === "double" || t === "long") {
      if (typeConfigState.min === undefined || typeConfigState.max === undefined) {
        message.warning("请完善必填项：取值范围");
        return;
      }
      if ((t === "float" || t === "double") && typeConfigState.precision === undefined) {
        message.warning("请完善必填项：精度");
        return;
      }
    }
    if (t === "string" && typeConfigState.maxLength === undefined) {
      message.warning("请完善必填项：字符长度");
      return;
    }
    if (t === "boolean") {
      if (!typeConfigState.boolZeroText || !typeConfigState.boolOneText) {
        message.warning("请完善必填项：布尔值文本");
        return;
      }
    }
    if (currentRow.value) {
      if (t === "int" || t === "float" || t === "double" || t === "long") {
        currentRow.value.min = typeConfigState.min;
        currentRow.value.max = typeConfigState.max;
        currentRow.value.precision = t === "int" || t === "long" ? undefined : typeConfigState.precision;
      }
      if (t === "string") {
        currentRow.value.maxLength = typeConfigState.maxLength;
      }
      if (t === "boolean") {
        currentRow.value.boolZeroText = typeConfigState.boolZeroText;
        currentRow.value.boolOneText = typeConfigState.boolOneText;
      }
      currentRow.value.dataRequired = true;
    }
    typeConfigModalApi.close();
  },
  onCancel: () => typeConfigModalApi.close(),
});

/**
 * 校验参数：参数标识和参数名称必须同时填写或同时为空
 */
function validateParams(params: (InputParam | OutputParam)[], paramType: "输入参数" | "输出参数"): boolean {
  for (let index = 0; index < params.length; index++) {
    const param = params[index];
    const identifier = param.identifier ? String(param.identifier).trim() : "";
    const name = param.name ? String(param.name).trim() : "";
    const hasIdentifier = identifier !== "";
    const hasName = name !== "";

    // 如果只填写了参数标识，但没有填写参数名称
    if (hasIdentifier && !hasName) {
      message.error(`${paramType}第${index + 1}条：参数标识和参数名称必须同时填写`);
      return false;
    }

    // 如果只填写了参数名称，但没有填写参数标识
    if (hasName && !hasIdentifier) {
      message.error(`${paramType}第${index + 1}条：参数标识和参数名称必须同时填写`);
      return false;
    }
  }
  return true;
}

const inputParamsState = reactive<{ items: InputParam[] }>({ items: [] });
const [InputParamsModal, inputParamsModalApi] = useCubeModal({
  title: "输入参数",
  width: "1180px",
  onConfirm: () => {
    // 校验输入参数：参数标识和参数名称必须同时填写或同时为空
    if (!validateParams(inputParamsState.items, "输入参数")) {
      return;
    }

    if (currentMethod.value) {
      currentMethod.value.inputRequired = true;
      currentMethod.value.inputParams = inputParamsState.items.map((p, idx) => ({ ...p, order: idx + 1 }));
    }
    inputParamsModalApi.close();
  },
  onCancel: () => inputParamsModalApi.close(),
});

const outputParamsState = reactive<{ items: OutputParam[] }>({ items: [] });
const [OutputParamsModal, outputParamsModalApi] = useCubeModal({
  title: "输出参数",
  width: "1030px",
  onConfirm: () => {
    // 校验输出参数：参数标识和参数名称必须同时填写或同时为空
    if (!validateParams(outputParamsState.items, "输出参数")) {
      return;
    }

    if (currentMethod.value) {
      currentMethod.value.outputRequired = true;
      currentMethod.value.outputParams = outputParamsState.items.map((p, idx) => ({ ...p, order: idx + 1 }));
      const first = outputParamsState.items[0];
      if (first) {
        currentMethod.value.outputIdentifier = first.identifier || "";
        currentMethod.value.outputName = first.name || "";
      }
    }
    outputParamsModalApi.close();
  },
  onCancel: () => outputParamsModalApi.close(),
});

export const MethodsTable = defineComponent({
  props: ["id"],
  name: "MethodsTable",
  setup: (props: Props) => {
    const rows = reactive<MethodRow[]>(buildInitialRows());
    const saving = ref(false);
    const loading = ref(false);
    const DataTypeOptions = ref<DataTypeOption[]>([]);
    const UnitOptions = ref<{ label: string; value: string }[]>([]);

    /** 将后端 required 映射为本地枚举 */
    function toLocalRequired(required?: boolean): "REQUIRED" | "OPTIONAL" {
      return required ? "REQUIRED" : "OPTIONAL";
    }

    function parseMaxLengthConfig(cfg: any): number | undefined {
      const maxLength = cfg?.strLen ?? cfg?.maxLength ?? cfg?.max ?? cfg?.length;
      if (maxLength === undefined || maxLength === null || maxLength === "") {
        return undefined;
      }
      return Number(maxLength);
    }

    /** 解析后端 data_config 到本地输入参数配置（支持 enum/boolean 的 enumValues 格式） */
    function parseInputConfig(p: any): Partial<InputParam> {
      const cfg = p?.data_config || {};
      const dt = p?.data_type;
      if (dt === "int" || dt === "long" || dt === "float" || dt === "double") {
        return {
          min: cfg?.min,
          max: cfg?.max,
          precision: dt === "int" || dt === "long" ? undefined : (cfg?.step ?? cfg?.precision),
        };
      }
      if (dt === "string") {
        return { maxLength: parseMaxLengthConfig(cfg) };
      }
      if (dt === "enum") {
        const ev = Array.isArray(cfg?.enumValues) ? cfg.enumValues : [];
        return { enumItems: ev.map((x: any) => ({ value: x?.value, text: x?.label })) };
      }
      if (dt === "boolean") {
        const ev = Array.isArray(cfg?.enumValues) ? cfg.enumValues : [];
        const findLabel = (val: number) => {
          const hit = ev.find((x: any) => String(x?.value) === String(val));
          return hit?.label;
        };
        return { boolZeroText: findLabel(0) ?? cfg?.zeroText ?? "关", boolOneText: findLabel(1) ?? cfg?.oneText ?? "开" };
      }
      return {};
    }

    /** 解析后端枚举项到本地格式 */
    function parseEnumItems(items: any[] | undefined): { value: string | number; text: string }[] {
      if (!items || !Array.isArray(items)) {
        return [];
      }
      return items.map((it) => ({ value: it?.value ?? it?.val ?? "", text: it?.text ?? it?.label ?? "" }));
    }

    /** 将后端输入参数项映射为本地 InputParam */
    function mapBackendParamToInput(p: any, idx: number): InputParam {
      const base: InputParam = {
        order: idx + 1,
        identifier: p?.param_code ?? "",
        name: p?.name ?? "",
        required: toLocalRequired(p?.required),
        dataType: p?.data_type ?? "int",
        unit: p?.unit_symbol ?? null,
        precision: p?.precision,
        enumItems: parseEnumItems(p?.enum_items),
        dataRequired: true,
      };
      const extra = parseInputConfig(p);
      return { ...base, ...extra };
    }

    /** 解析后端 data_config 到本地输出参数配置（支持 enum/boolean 的 enumValues 格式） */
    function parseOutputConfig(p: any): Partial<OutputParam> {
      const cfg = p?.data_config || {};
      const dt = p?.data_type;
      if (dt === "int" || dt === "long" || dt === "float" || dt === "double") {
        return {
          min: cfg?.min,
          max: cfg?.max,
          precision: dt === "int" || dt === "long" ? undefined : (cfg?.step ?? cfg?.precision),
        };
      }
      if (dt === "string") {
        return { maxLength: parseMaxLengthConfig(cfg) };
      }
      if (dt === "enum") {
        const ev = Array.isArray(cfg?.enumValues) ? cfg.enumValues : [];
        return { enumItems: ev.map((x: any) => ({ value: x?.value, text: x?.label })) };
      }
      if (dt === "boolean") {
        const ev = Array.isArray(cfg?.enumValues) ? cfg.enumValues : [];
        const findLabel = (val: number) => {
          const hit = ev.find((x: any) => String(x?.value) === String(val));
          return hit?.label;
        };
        return { boolZeroText: findLabel(0) ?? cfg?.zeroText ?? "关", boolOneText: findLabel(1) ?? cfg?.oneText ?? "开" };
      }
      return {};
    }

    /** 将后端输出参数项映射为本地 OutputParam */
    function mapBackendParamToOutput(p: any, idx: number): OutputParam {
      const base: OutputParam = {
        order: idx + 1,
        identifier: p?.param_code ?? "",
        name: p?.name ?? "",
        dataType: p?.data_type ?? "int",
        unit: p?.unit_symbol ?? null,
        precision: p?.precision,
        enumItems: parseEnumItems(p?.enum_items),
        dataRequired: true,
      };
      const extra = parseOutputConfig(p);
      return { ...base, ...extra };
    }

    /** 将详情数据映射为方法行并设置到页面状态 */
    function echoDetailToState(detail: any): void {
      const list: any[] = Array.isArray(detail)
        ? detail
        : Array.isArray(detail?.data)
          ? detail.data
          : Array.isArray(detail?.methods)
            ? detail.methods
            : detail
              ? [detail]
              : [];
      const mapped: MethodRow[] = list.map((m: any, idx: number) => {
        const inputs = m?.inputParams?.params ?? [];
        const outputs = m?.outputParams?.params ?? [];

        const inputParams: InputParam[] = inputs.map(mapBackendParamToInput);
        const outputParams: OutputParam[] = outputs.map(mapBackendParamToOutput);

        const firstOutput = outputParams[0];
        const row: MethodRow = {
          order: idx + 1,
          identifier: m?.methodCode ?? "",
          name: m?.name ?? "",
          isAsync: (m?.methodType ?? "sync") === "sync" ? "sync" : "async",
          outputType: firstOutput?.dataType ?? "int",
          outputIdentifier: firstOutput?.identifier ?? "",
          outputName: firstOutput?.name ?? "",
          description: m?.description ?? "",
          unit: firstOutput?.unit ?? null,
          min: firstOutput?.min,
          max: firstOutput?.max,
          precision: firstOutput?.precision,
          enumItems: firstOutput?.enumItems ?? [],
          inputRequired: true,
          outputRequired: true,
          inputParams,
          outputParams,
          maxLength: firstOutput?.maxLength,
          boolZeroText: firstOutput?.boolZeroText,
          boolOneText: firstOutput?.boolOneText,
          dataRequired: !!firstOutput || inputParams.length > 0,
          id: m?.id,
        };
        return row;
      });

      const nextRowCount = Math.max(mapped.length, DEFAULT_INITIAL_ROW_COUNT);
      const nextRows = Array.from({ length: nextRowCount }, (_, index) => mapped[index] ?? buildEmptyRow(index + 1));
      rows.splice(0, rows.length, ...nextRows);
    }
    /** 主表滚动容器 */
    const mainTableScrollRef = ref<HTMLDivElement | null>(null);

    /** 主表滚动至底部自动新增一行 */
    function handleMainTableScroll(): void {
      const el = mainTableScrollRef.value;
      if (!el) {
        return;
      }
      const isBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
      if (isBottom) {
        rows.push(buildEmptyRow(rows.length + 1));
      }
    }
    const handleSave = async (): Promise<void> => {
      saving.value = true;
      try {
        await save(rows);
      } finally {
        saving.value = false;
      }
    };
    /** 保存当前表格配置 */
    async function save(rows: MethodRow[]): Promise<void> {
      const validRows = rows.filter((r) => r.identifier && r.name);
      const inputError = validRows.some((r) => !r.inputParams?.length);
      const outputError = validRows.some(
        (r) => !r.outputParams?.length || (r.outputParams || []).some((op) => !op.identifier || !op.name || !op.dataRequired),
      );
      // if (inputError) {
      //   message.warning("请配置输入参数");
      //   return;
      // }
      // if (outputError) {
      //   message.warning("请配置输出参数（标识、名称或数据类型配置）");
      //   return;
      // }

      const data = {
        prodId: props.id,
        methods: validRows.map((r) => {
          // 过滤输入参数：只保留参数标识和参数名称同时存在的记录
          const validInputParams = (r.inputParams || []).filter((p) => {
            const identifier = p.identifier ? String(p.identifier).trim() : "";
            const name = p.name ? String(p.name).trim() : "";
            return identifier !== "" && name !== "";
          });

          // 过滤输出参数：只保留参数标识和参数名称同时存在的记录
          const validOutputParams = (r.outputParams || []).filter((op) => {
            const identifier = op.identifier ? String(op.identifier).trim() : "";
            const name = op.name ? String(op.name).trim() : "";
            return identifier !== "" && name !== "";
          });

          return {
            prodId: props.id,
            name: r.name,
            id: r.id,
            description: r.description,
            methodType: r.isAsync,
            methodCode: r.identifier,
            inputParams: {
              params: validInputParams.map((p) => ({
                name: p.name,
                param_code: p.identifier,
                data_type: p.dataType,
                required: p.required !== "OPTIONAL",
                unit_symbol: p.unit,
                precision: p.precision,
                data_config:
                  p.dataType === "enum"
                    ? { type: "enum", enumValues: p.enumItems?.map((i) => ({ value: i.value, label: i.text })) }
                    : p.dataType === "boolean"
                      ? {
                          type: "enum",
                          enumValues: [
                            { value: 0, label: p.boolZeroText },
                            { value: 1, label: p.boolOneText },
                          ],
                        }
                      : p.dataType === "string"
                        ? { type: "strLen", strLen: p.maxLength }
                        : { type: "range", min: p.min, max: p.max, step: p.precision },
              })),
            },
            outputParams: {
              params: validOutputParams.map((op) => ({
                name: op.name,
                param_code: op.identifier,
                data_type: op.dataType,
                unit_symbol: op.unit,
                precision: op.precision,
                enum_items: op.enumItems || [],
                data_config:
                  op.dataType === "enum"
                    ? { type: "enum", enumValues: op.enumItems?.map((i) => ({ value: i.value, label: i.text })) }
                    : op.dataType === "boolean"
                      ? {
                          type: "enum",
                          enumValues: [
                            { value: 0, label: op.boolZeroText },
                            { value: 1, label: op.boolOneText },
                          ],
                        }
                      : op.dataType === "string"
                        ? { type: "strLen", strLen: op.maxLength }
                        : { type: "range", min: op.min, max: op.max, step: op.precision },
              })),
            },
          };
        }),
      };
      await handleAdd(data);
    }

    const handleAdd = async (data: Record<string, unknown | undefined>): Promise<void> => {
      try {
        const res = await cubeDeviceCenterService.addProductMethod(data);
        message.success("保存成功");
      } catch {
        // Message.error('保存失败')
      }
    };
    const getDataType = async (): Promise<void> => {
      const res = (await cubeDeviceCenterService.getIotDataType()) as { itemLabel: string; itemValue: string }[];
      DataTypeOptions.value = res.map((item) => ({
        label: item.itemLabel,
        value: item.itemValue,
      }));
    };
    const getPropUnit = async (): Promise<void> => {
      const res = (await cubeDeviceCenterService.getPropUnit()) as { itemLabel: string; id: string }[];
      UnitOptions.value = res.map((item) => ({
        label: item.itemLabel,
        value: item.itemLabel,
      }));
    };
    /** 拉取详情并设置页面状态 */
    const getProductMethods = async (): Promise<void> => {
      loading.value = true;
      const data = await cubeDeviceCenterService.getProductMethod(props.id);
      loading.value = false;
      echoDetailToState(data);
    };
    onMounted(() => {
      getDataType();
      getPropUnit();
      getProductMethods();
    });
    return (): JSX.Element => (
      <div style={{ background: "#fff", padding: "16px", paddingTop: "0px", borderRadius: "6px" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
          <Button type="primary" loading={saving.value} onClick={handleSave}>
            保存
          </Button>
        </div>
        <InputParamsModal>
          <div style={{ width: "100%" }}>
            <div style={{ marginBottom: "12px", marginTop: "-16px", display: "flex", justifyContent: "right" }}>
              <Button
                type="primary"
                onClick={() =>
                  inputParamsState.items.push({
                    order: inputParamsState.items.length + 1,
                    identifier: "",
                    name: "",
                    required: "OPTIONAL",
                    dataType: "int",
                    dataRequired: false,
                  })
                }
              >
                新增
              </Button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  <th style={{ textAlign: "left", padding: "8px" }}>序号</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>参数标识</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>参数名称</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>填写约束</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>单位</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>数据类型</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>操作</th>
                </tr>
              </thead>
              <tbody class={styles.tbodyItem}>
                {inputParamsState.items.map((p, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: "8px", minWidth: "50px" }}>{idx + 1}</td>
                    <td style={{ padding: "8px", minWidth: "180px" }}>
                      <div style={{ position: "relative" }}>
                        <Input
                          style={{ paddingRight: "56px" }}
                          placeholder="参数标识"
                          allowClear={false}
                          showCount={false}
                          maxLength={20}
                          v-model:value={p.identifier}
                        />
                      </div>
                    </td>
                    <td style={{ padding: "8px", minWidth: "180px" }}>
                      <div style={{ position: "relative" }}>
                        <Input
                          style={{ paddingRight: "56px" }}
                          placeholder="参数名称"
                          allowClear={false}
                          showCount={false}
                          maxLength={20}
                          v-model:value={p.name}
                        />
                      </div>
                    </td>
                    <td style={{ padding: "8px", minWidth: "140px" }}>
                      <Select
                        allowClear={false}
                        value={p.required}
                        options={[
                          { label: "必填", value: "REQUIRED" },
                          { label: "不必填", value: "OPTIONAL" },
                        ]}
                        onChange={(v: "REQUIRED" | "OPTIONAL") => (p.required = v)}
                        placeholder="填写约束"
                      />
                    </td>
                    <td style={{ padding: "8px", minWidth: "140px" }}>
                      <Select
                        allowClear={false}
                        value={p.unit}
                        options={UnitOptions}
                        onChange={(v: string) => (p.unit = v)}
                        placeholder="填写单位"
                      />
                    </td>
                    <td style={{ padding: "8px", minWidth: "260px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Select
                          allowClear={false}
                          value={p.dataType}
                          options={DataTypeOptions}
                          onChange={(v: string) => (p.dataType = v)}
                          placeholder="请选择数据类型"
                        />
                        <Button
                          type="primary"
                          onClick={() => {
                            currentRow.value = p;
                            if (p.dataType === "enum") {
                              enumState.items = (p.enumItems || [{ value: "", text: "" }]).map((e, i) => ({
                                order: i + 1,
                                value: e.value,
                                text: e.text,
                              }));
                              enumModalApi.open();
                            } else {
                              typeConfigState.type = p.dataType;
                              typeConfigState.min = p.min;
                              typeConfigState.max = p.max;
                              typeConfigState.precision = p.precision;
                              typeConfigState.maxLength = p.maxLength;
                              typeConfigState.boolZeroText = p.boolZeroText || "";
                              typeConfigState.boolOneText = p.boolOneText || "";
                              typeConfigModalApi.open();
                            }
                          }}
                        >
                          配置
                        </Button>
                      </div>
                    </td>

                    <td style={{ padding: "8px", minWidth: "120px" }}>
                      <Button danger onClick={() => (inputParamsState.items = inputParamsState.items.filter((x) => x !== p))}>
                        删除
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </InputParamsModal>
        <OutputParamsModal>
          <div style={{ width: "100%" }}>
            <div style={{ marginBottom: "12px", marginTop: "-16px", display: "flex", justifyContent: "right" }}>
              <Button
                type="primary"
                onClick={() =>
                  outputParamsState.items.push({
                    order: outputParamsState.items.length + 1,
                    identifier: "",
                    name: "",
                    dataType: "int",
                    dataRequired: false,
                  })
                }
              >
                新增
              </Button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  <th style={{ textAlign: "left", padding: "8px" }}>序号</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>参数标识</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>参数名称</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>单位</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>数据类型</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>操作</th>
                </tr>
              </thead>
              <tbody class={styles.tbodyItem}>
                {outputParamsState.items.map((p, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: "8px", minWidth: "50px" }}>{idx + 1}</td>
                    <td style={{ padding: "8px", minWidth: "180px" }}>
                      <div style={{ position: "relative" }}>
                        <Input
                          style={{ paddingRight: "56px" }}
                          placeholder="参数标识"
                          showCount={false}
                          allowClear={false}
                          v-model:value={p.identifier}
                        />
                      </div>
                    </td>
                    <td style={{ padding: "8px", minWidth: "180px" }}>
                      <div style={{ position: "relative" }}>
                        <Input
                          style={{ paddingRight: "56px" }}
                          placeholder="参数名称"
                          showCount={false}
                          allowClear={false}
                          v-model:value={p.name}
                        />
                      </div>
                    </td>
                    <td style={{ padding: "8px", minWidth: "140px" }}>
                      <Select
                        allowClear={false}
                        value={p.unit}
                        options={UnitOptions}
                        onChange={(v: string) => (p.unit = v)}
                        placeholder="填写单位"
                      />
                    </td>
                    <td style={{ padding: "8px", minWidth: "260px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Select
                          allowClear={false}
                          value={p.dataType}
                          options={DataTypeOptions}
                          onChange={(v: string) => (p.dataType = v)}
                          placeholder="请选择数据类型"
                        />
                        <Button
                          type="primary"
                          onClick={() => {
                            currentRow.value = p;
                            if (p.dataType === "enum") {
                              enumState.items = (p.enumItems || [{ value: "", text: "" }]).map((e, i) => ({
                                order: i + 1,
                                value: e.value,
                                text: e.text,
                              }));
                              enumModalApi.open();
                            } else {
                              typeConfigState.type = p.dataType;
                              typeConfigState.min = p.min;
                              typeConfigState.max = p.max;
                              typeConfigState.precision = p.precision;
                              typeConfigState.maxLength = p.maxLength;
                              typeConfigState.boolZeroText = p.boolZeroText || "";
                              typeConfigState.boolOneText = p.boolOneText || "";
                              typeConfigModalApi.open();
                            }
                          }}
                        >
                          配置
                        </Button>
                      </div>
                    </td>

                    <td style={{ padding: "8px", minWidth: "120px" }}>
                      <Button danger onClick={() => (outputParamsState.items = outputParamsState.items.filter((x) => x !== p))}>
                        删除
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </OutputParamsModal>
        <div
          ref={mainTableScrollRef}
          onScroll={handleMainTableScroll}
          style={{ maxHeight: "450px", overflowY: "auto", overflowX: "auto", border: "1px solid #f0f0f0", borderRadius: "4px" }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 1, background: "#fafafa", boxShadow: "0 1px 0 #f0f0f0" }}>
              <tr style={{ background: "#fafafa" }}>
                <th style={{ textAlign: "left", padding: "8px" }}>序号</th>
                <th style={{ textAlign: "left", padding: "8px" }}>
                  标识 <span style={{ color: "#f5222d" }}>*</span>
                </th>
                <th style={{ textAlign: "left", padding: "8px" }}>
                  名称 <span style={{ color: "#f5222d" }}>*</span>
                </th>
                <th style={{ textAlign: "left", padding: "8px" }}>是否异步</th>
                <th style={{ textAlign: "left", padding: "8px" }}>输入参数</th>
                <th style={{ textAlign: "left", padding: "8px" }}>输出参数</th>
                <th style={{ textAlign: "left", padding: "8px" }}>说明</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.order}>
                  <td style={{ padding: "8px" }}>{row.order}</td>
                  <td style={{ padding: "8px", minWidth: "180px" }}>
                    <Input maxlength={100} placeholder="请输入标识" showCount={false} v-model:value={row.identifier} />
                  </td>
                  <td style={{ padding: "8px", minWidth: "180px" }}>
                    <Input placeholder="请输入名称" v-model:value={row.name} />
                  </td>
                  <td style={{ padding: "8px", minWidth: "120px" }}>
                    <Select
                      allowClear={false}
                      value={row.isAsync}
                      options={[
                        { label: "否", value: "sync" },
                        { label: "是", value: "async" },
                      ]}
                      onChange={(v: "async" | "sync") => (row.isAsync = v)}
                      placeholder="是否异步"
                    />
                  </td>
                  <td style={{ padding: "8px", minWidth: "120px" }}>
                    <Button type="primary" onClick={() => openInputParamsConfig(row)}>
                      配置
                    </Button>
                    {row.inputRequired && <CheckCircleFilled style={{ color: "#52c41a", marginLeft: "8px" }} />}
                  </td>
                  <td style={{ padding: "8px", minWidth: "120px" }}>
                    <Button type="primary" onClick={() => openOutputParamsConfig(row)}>
                      配置
                    </Button>
                    {row.outputRequired && <CheckCircleFilled style={{ color: "#52c41a", marginLeft: "8px" }} />}
                  </td>

                  <td style={{ padding: "8px", minWidth: "220px" }}>
                    <Input placeholder="请输入说明" v-model:value={row.description} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <EnumModal>
          <div style={{ width: "560px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontWeight: 500 }}>序号 </span>
              <span style={{ fontWeight: 500 }}>Value </span>
              <span style={{ fontWeight: 500 }}>Text</span>
              <Button type="primary" onClick={() => enumState.items.push({ order: enumState.items.length + 1, value: "", text: "" })}>
                新增枚举项
              </Button>
            </div>
            {enumState.items.length === 0 ? (
              <div style={{ height: "160px", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
                暂无数据
              </div>
            ) : (
              <div class={styles.enumItems}>
                {enumState.items.map((e, idx) => (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr 100px", gap: "8px", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>{e.order}</div>
                    <Input placeholder="Value" v-model:value={e.value} />
                    <Input placeholder="Text" v-model:value={e.text} />
                    <Button danger onClick={() => (enumState.items = enumState.items.filter((x) => x !== e))}>
                      删除
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </EnumModal>
        <TypeConfigModal>
          <div style={{ width: "420px" }}>
            <Form>
              {(typeConfigState.type === "int" ||
                typeConfigState.type === "float" ||
                typeConfigState.type === "double" ||
                typeConfigState.type === "long") && (
                <>
                  <FormItem label="取值范围" required>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <InputNumber
                        style={{ flex: 1 }}
                        min={MIN_NUMERIC_RANGE_VALUE}
                        placeholder="最小值"
                        v-model:value={typeConfigState.min as number}
                      />
                      <InputNumber
                        style={{ flex: 1 }}
                        min={MIN_NUMERIC_RANGE_VALUE}
                        placeholder="最大值"
                        v-model:value={typeConfigState.max as number}
                      />
                    </div>
                  </FormItem>
                </>
              )}
              {typeConfigState.type === "string" && (
                <FormItem label="字符长度" required>
                  <InputNumber placeholder="最大长度" v-model:value={typeConfigState.maxLength as number} />
                </FormItem>
              )}
              {(typeConfigState.type === "float" || typeConfigState.type === "double") && (
                <FormItem label="精度" required>
                  <InputNumber placeholder="精度" v-model:value={typeConfigState.precision as number} />
                </FormItem>
              )}
              {typeConfigState.type === "boolean" && (
                <>
                  <FormItem label="布尔值" required>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Input style={{ flex: 1 }} placeholder="如：关" v-model:value={typeConfigState.boolZeroText} />
                      <Input style={{ flex: 1 }} placeholder="如：开" v-model:value={typeConfigState.boolOneText} />
                    </div>
                  </FormItem>
                </>
              )}
            </Form>
          </div>
        </TypeConfigModal>
      </div>
    );
  },
});

export default MethodsTable;
