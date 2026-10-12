import dayjs, { type Dayjs } from "dayjs";
import { computed, defineComponent, reactive, ref, watch, type PropType, type VNode } from "vue";

import {
  CubeSelect,
  InspectLevelSelect,
  PersonLiableSelect,
  PlanNameInput,
  TaskCreateCycle,
  TaskTimeLimit,
} from "@ghcloud/cube-app-design";
import { Col, DatePicker, Form, FormItem, Row, Textarea, type FormInstance } from "@ghcloud/cube-ui";

import { cubeDailyInspectionService } from "@/api/server";
import { executeCycleOptions, weekCycleOptions } from "@/views/inspect-plan/inspect-plan-edit/components/constants";

import styles from "./smart-inspect-basic-form.module.less";

type FormMode = "plan" | "task";

interface SmartInspectFieldSchema {
  fieldName: string;
  label: string;
  span?: number;
  FormComponent?: (props: Record<string, unknown>) => JSX.Element;
  customRender?: (formState: Record<string, unknown>) => VNode | string;
}

const toArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") return value ? value.split(",").filter(Boolean) : [];
  return [];
};

const formatTime = (value: unknown): string | null => {
  if (!value) return null;
  return dayjs(value as string | number | Date).format("YYYY-MM-DD HH:mm:ss");
};

const formatLimitTime = (value: unknown): string => {
  if (!value) return "--";
  try {
    const parsed = JSON.parse(String(value)) as { day?: number; hour?: number; minute?: number };
    const parts = [
      parsed.day ? `${parsed.day}天` : "",
      parsed.hour ? `${parsed.hour}小时` : "",
      parsed.minute ? `${parsed.minute}分钟` : "",
    ].filter(Boolean);
    return parts.join("") || "--";
  } catch {
    return String(value);
  }
};

const getCycleText = (formState: Record<string, unknown>): string => {
  if (!formState.cycle) return "立即执行";
  const executeOption = executeCycleOptions.find((item) => item.value === formState.cycleType);
  if (!executeOption) return "立即执行";

  let cronJson: Record<string, unknown> | null = null;
  if (typeof formState.cronName === "string") {
    try {
      cronJson = JSON.parse(formState.cronName) as Record<string, unknown>;
    } catch {
      cronJson = null;
    }
  }
  const selectionSource = formState.selection || cronJson?.selection;
  const selection = Array.isArray(selectionSource)
    ? selectionSource.map(String)
    : String(selectionSource || "")
        .split(",")
        .filter(Boolean);
  const hour = String(formState.hour || "12:00");

  if (executeOption.value === "EVERY_WEEK") {
    const labels = weekCycleOptions
      .filter((item) => selection.includes(item.value))
      .map((item) => item.label)
      .join(",");
    return `${executeOption.label}：${labels || "--"}：${hour}`;
  }
  if (executeOption.value === "EVERY_MONTH") {
    return `${executeOption.label}：${selection.join(",") || "--"}号：${hour}`;
  }
  return `${executeOption.label}：${hour}`;
};

const getFieldPlaceholder = (fieldName: string, mode: FormMode): string => {
  const nameLabel = mode === "plan" ? "计划名称" : "任务名称";
  const placeholderMap: Record<string, string> = {
    name: `请输入${nameLabel}`,
    beginTime: "请选择计划开始时间",
    endTime: "请选择计划结束时间",
    level: "请选择巡检级别",
    typeId: "请选择巡检类型",
    receiveType: "请选择负责人",
    limitTimeJson: mode === "plan" ? "请填写任务时限" : "请填写任务有效期",
    cycle: "请选择周期巡检",
    remark: "请输入备注",
  };
  return placeholderMap[fieldName] || "";
};

export const SmartInspectBasicForm = defineComponent({
  props: {
    initFormState: {
      type: Object as PropType<Record<string, unknown>>,
      default: () => ({}),
    },
    mode: {
      type: String as PropType<FormMode>,
      default: "plan",
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  setup: (props, { expose }) => {
    const formRef = ref<FormInstance>();
    const state = reactive<{
      formState: Record<string, unknown>;
    }>({
      formState: {
        name: "",
        cycle: false,
        typeId: null,
        receiveType: "1",
        receiveIds: [],
        receiveDeptIds: null,
        receivePostIds: null,
        receiveRoleIds: null,
        limitTimeJson: "",
        level: "GENERAL",
        beginTime: "",
        endTime: "",
        cronId: null,
        cycleType: null,
        hour: "12:00",
        selection: null,
        remark: "",
      },
    });

    const disabledDate = (current: Dayjs): boolean => {
      return current && current < dayjs().endOf("day").add(-1, "day");
    };

    const range = (start: number, end: number): number[] => {
      const result: number[] = [];
      for (let i = start; i < end; i += 1) result.push(i);
      return result;
    };

    const disabledTime = (current: Dayjs): object => {
      if (!current) return {};
      if (dayjs(current).format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD")) {
        const now = dayjs();
        return {
          disabledHours: () => range(0, now.hour()),
          disabledMinutes: () => (current.hour() === now.hour() ? range(0, now.minute()) : []),
          disabledSeconds: () => (current.hour() === now.hour() && current.minute() === now.minute() ? range(0, now.second()) : []),
        };
      }
      return {};
    };

    const baseSchema = computed((): SmartInspectFieldSchema[] => {
      const schema: SmartInspectFieldSchema[] = [
        {
          fieldName: "name",
          label: props.mode === "plan" ? "计划名称" : "任务名称",
          FormComponent: (fieldProps) => (
            <PlanNameInput
              {...fieldProps}
              checkNameApi={async (params: unknown) => {
                const payload = params as { planName: string };
                return cubeDailyInspectionService.checkPlanNameRepeat({
                  planName: payload.planName,
                });
              }}
            />
          ),
          customRender: (formState) => String(formState.name || "--"),
        },
      ];

      if (props.mode === "plan") {
        schema.push(
          {
            fieldName: "beginTime",
            label: "计划开始时间",
            FormComponent: (fieldProps) => (
              <DatePicker
                {...fieldProps}
                disabledDate={disabledDate}
                disabledTime={disabledTime}
                showTime={{ format: "YYYY-MM-DD HH:mm:ss" }}
                valueFormat="YYYY-MM-DD HH:mm:ss"
              />
            ),
            customRender: (formState) => String(formState.beginTime || "--"),
          },
          {
            fieldName: "endTime",
            label: "计划结束时间",
            FormComponent: (fieldProps) => (
              <DatePicker {...fieldProps} showTime={{ format: "YYYY-MM-DD HH:mm:ss" }} valueFormat="YYYY-MM-DD HH:mm:ss" />
            ),
            customRender: (formState) => String(formState.endTime || "--"),
          },
        );
      }

      schema.push(
        {
          fieldName: "level",
          label: "巡检级别",
          FormComponent: (fieldProps) => <InspectLevelSelect {...fieldProps} />,
          customRender: (formState) => (formState.level === "GENERAL" ? "紧急" : "普通"),
        },
        {
          fieldName: "typeId",
          label: "巡检类型",
          FormComponent: (fieldProps) => (
            <CubeSelect
              {...fieldProps}
              optionsFetchApi={async () => {
                return cubeDailyInspectionService.getInspectTypeList();
              }}
            />
          ),
          customRender: (formState) => String(formState.typeName || "--"),
        },
      );

      schema.push({
        fieldName: "limitTimeJson",
        label: props.mode === "plan" ? "任务时限" : "任务有效期",
        FormComponent: (fieldProps) => <TaskTimeLimit {...fieldProps} />,
        customRender: (formState) => formatLimitTime(formState.limitTimeJson),
      });

      schema.push({
        fieldName: "receiveType",
        label: "负责人",
        span: 24,
        FormComponent: (fieldProps) => <PersonLiableSelect {...fieldProps} />,
        customRender: (formState) => String(formState.receiveNames || "--"),
      });

      if (props.mode === "plan") {
        schema.push({
          fieldName: "cycle",
          label: "周期巡检",
          span: 24,
          FormComponent: (fieldProps) => (
            <TaskCreateCycle
              {...fieldProps}
              cycleOptionsApi={async () => {
                return cubeDailyInspectionService.getInspectPeriodList();
              }}
            />
          ),
          customRender: getCycleText,
        });
      }

      schema.push({
        fieldName: "remark",
        label: "备注",
        span: 24,
        FormComponent: (fieldProps) => <Textarea {...fieldProps} />,
        customRender: (formState) => String(formState.remark || "--"),
      });

      return schema;
    });

    const rules = computed(() => {
      const ruleMap: Record<string, unknown[]> = {
        name: [
          { required: true, message: props.mode === "plan" ? "请输入计划名称" : "请输入任务名称" },
          { message: "名称不超过32个字", pattern: /^.{1,32}$/g },
        ],
        level: [{ required: true, message: "请选择巡检级别" }],
        typeId: [{ required: true, message: "请选择巡检类型", trigger: "blur" }],
        receiveType: [
          {
            validator: async (_rule: unknown, value: unknown): Promise<void> => {
              if (!value) return Promise.reject(new Error("请选择负责人"));
              if (value === "1" && !toArray(state.formState.receiveIds).length) {
                return Promise.reject(new Error("请选择负责人"));
              }
              if (value === "2" && !state.formState.receiveDeptIds && !state.formState.receivePostIds && !state.formState.receiveRoleIds) {
                return Promise.reject(new Error("请选择负责人部门"));
              }
              return Promise.resolve();
            },
          },
        ],
        cycle: [
          {
            validator: async (_rule: unknown, value: boolean): Promise<void> => {
              if (props.mode !== "plan" || !value) return Promise.resolve();
              if (!state.formState.cronId) return Promise.reject(new Error("请选择循环周期"));
              if (state.formState.cronId === "custom") {
                if (!state.formState.cycleType) return Promise.reject(new Error("请选择自定义执行周期"));
                if (!state.formState.selection) return Promise.reject(new Error("请选择自定义执行周期时间"));
                if (!state.formState.hour) return Promise.reject(new Error("请选择自定义执行周期小时"));
              }
              return Promise.resolve();
            },
          },
        ],
        limitTimeJson: [{ required: true, message: props.mode === "plan" ? "请填写任务时限" : "请填写任务有效期" }],
      };

      if (props.mode === "plan") {
        ruleMap.beginTime = [
          { required: true, message: "请选择计划开始时间" },
          {
            validator: async (_rule: unknown, value: unknown): Promise<void> => {
              if (value && state.formState.endTime && String(state.formState.endTime) < String(value)) {
                return Promise.reject(new Error("计划开始时间不能大于计划结束时间"));
              }
              return Promise.resolve();
            },
          },
        ];
        ruleMap.endTime = [
          {
            validator: async (_rule: unknown, value: unknown): Promise<void> => {
              if (!value) return Promise.resolve();
              if (state.formState.beginTime && String(state.formState.beginTime) > String(value)) {
                return Promise.reject(new Error("计划结束时间不能小于计划开始时间"));
              }
              return Promise.resolve();
            },
          },
        ];
      }

      return ruleMap;
    });

    const buildFieldProps = (fieldName: string): Record<string, unknown> => ({
      value: state.formState[fieldName],
      placeholder: getFieldPlaceholder(fieldName, props.mode),
      "onUpdate:value": (val: unknown): void => {
        state.formState[fieldName] = val;
      },
      receiveIds: state.formState.receiveIds,
      "onUpdate:receiveIds": (val: unknown): void => {
        state.formState.receiveIds = val;
      },
      receiveDeptIds: state.formState.receiveDeptIds,
      "onUpdate:receiveDeptIds": (val: unknown): void => {
        state.formState.receiveDeptIds = val;
      },
      receivePostIds: state.formState.receivePostIds,
      "onUpdate:receivePostIds": (val: unknown): void => {
        state.formState.receivePostIds = val;
      },
      receiveRoleIds: state.formState.receiveRoleIds,
      "onUpdate:receiveRoleIds": (val: unknown): void => {
        state.formState.receiveRoleIds = val;
      },
      cronId: state.formState.cronId,
      "onUpdate:cronId": (val: unknown): void => {
        state.formState.cronId = val;
      },
      cycleType: state.formState.cycleType,
      "onUpdate:cycleType": (val: unknown): void => {
        state.formState.cycleType = val;
      },
      selection: state.formState.selection,
      "onUpdate:selection": (val: unknown): void => {
        state.formState.selection = val;
      },
      hour: state.formState.hour,
      "onUpdate:hour": (val: unknown): void => {
        state.formState.hour = val;
      },
    });

    const handleSubmit = async (): Promise<Record<string, unknown>> => {
      await formRef.value?.validate();
      return {
        ...state.formState,
        receiveIds: toArray(state.formState.receiveIds),
      };
    };

    const setFormValues = (values: Record<string, unknown>): void => {
      state.formState = {
        ...state.formState,
        ...values,
      };
    };

    watch(
      () => props.initFormState,
      () => {
        const init = props.initFormState;
        if (!Object.keys(init).length) return;

        let cronJson: Record<string, unknown> = {};
        if (typeof init.cronName === "string") {
          try {
            const parsed = JSON.parse(init.cronName);
            if (typeof parsed === "object" && parsed !== null) {
              cronJson = parsed as Record<string, unknown>;
            }
          } catch {
            cronJson = {};
          }
        } else if (typeof init.cronName === "object" && init.cronName !== null) {
          cronJson = init.cronName as Record<string, unknown>;
        }

        const cronId = init.cronId || cronJson.type || null;
        state.formState = {
          ...state.formState,
          ...init,
          ...cronJson,
          beginTime: formatTime(init.validBeginTime || init.beginTime),
          endTime: formatTime(init.validEndTime || init.endTime),
          receiveIds: toArray(init.receiveIds),
          selection:
            typeof cronJson.selection === "string"
              ? String(cronJson.selection).split(",").filter(Boolean)
              : Array.isArray(cronJson.selection)
                ? cronJson.selection
                : init.selection,
          cronId,
          cycle: props.mode === "plan" ? Boolean(init.cycle ?? cronId) : false,
        };
      },
      { deep: true, immediate: true },
    );

    expose({
      handleSubmit,
      getFormState: () => state.formState,
      setFormValues,
    });

    const EditForm = (): JSX.Element => (
      <Form
        ref={formRef}
        class={styles.form}
        model={state.formState}
        rules={rules.value}
        layout="inline"
        labelCol={{ style: { width: "140px" } }}
      >
        <Row gutter={[12, 12]} style={{ width: "100%" }}>
          {baseSchema.value.map((item) => {
            const isFullRow = item.span === 24;
            const isPersonField = item.fieldName === "receiveType";
            const renderedField = item.FormComponent?.(buildFieldProps(item.fieldName));
            return (
              <Col key={item.fieldName} xxl={isFullRow ? 24 : 12} xl={isFullRow ? 24 : 12} lg={isFullRow ? 24 : 12} md={24} sm={24} xs={24}>
                <FormItem
                  label={item.label}
                  name={item.fieldName}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    flexWrap: "nowrap",
                  }}
                >
                  <div class={isPersonField ? styles["person-select-wrap"] : styles["field-control-wrap"]}>{renderedField}</div>
                </FormItem>
              </Col>
            );
          })}
        </Row>
      </Form>
    );

    const FieldComponent = (field: SmartInspectFieldSchema): JSX.Element => {
      const isFullRow = field.span === 24;
      return (
        <Col key={field.fieldName} xxl={isFullRow ? 24 : 12} xl={isFullRow ? 24 : 12} lg={isFullRow ? 24 : 12} md={24} sm={24} xs={24}>
          <div class={styles["readonly-item"]}>
            <span class={styles["readonly-label"]}>{field.label}：</span>
            <span class={styles["readonly-value"]}>
              {field.customRender ? field.customRender(state.formState) : String(state.formState[field.fieldName] || "--")}
            </span>
          </div>
        </Col>
      );
    };

    const InfoForm = (): JSX.Element => (
      <div class={styles["readonly-grid"]}>
        <Row gutter={[12, 12]}>{baseSchema.value.map((item) => FieldComponent(item))}</Row>
      </div>
    );

    return (): JSX.Element => <div class={styles.container}>{props.readonly ? <InfoForm /> : <EditForm />}</div>;
  },
});
