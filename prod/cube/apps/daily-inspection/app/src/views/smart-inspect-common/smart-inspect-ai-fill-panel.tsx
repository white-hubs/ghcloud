import { defineComponent, reactive, type PropType } from "vue";

import { Button, Textarea, message } from "@ghcloud/cube-ui";

import type { SmartInspectTargetCategory } from "./types";

import styles from "./smart-inspect-page.module.less";

type FormMode = "plan" | "task";

interface AiDraftPayload {
  formValues: Record<string, unknown>;
  targetCategories: SmartInspectTargetCategory[];
}

const getDraftCategories = (text: string): SmartInspectTargetCategory[] => {
  const categories: SmartInspectTargetCategory[] = [];
  if (/区域|园区|楼栋|楼层|地下室/.test(text)) categories.push("AREA");
  if (/设备|消防|闸机|烟感|硬件/.test(text)) categories.push("DEVICE");
  if (/资产|车辆|发电机/.test(text)) categories.push("PROPERTY");
  if (/档位|防护等级/.test(text)) categories.push("STALL");
  if (/现场点|配电室|点位/.test(text)) categories.push("SITE_POINT");
  if (/风险源|隐患|重点监控/.test(text)) categories.push("RISK_SOURCE");
  if (/小散工程|施工/.test(text)) categories.push("SMALL_ENGINEERING");
  if (/无人机|航线|飞行|空中/.test(text)) categories.push("DRONE");
  if (/机器狗|机器人|地面路线|管廊/.test(text)) categories.push("ROBOT_DOG");
  return [...new Set(categories.length ? categories : ["AREA"])];
};

const getDraftName = (mode: FormMode, text: string, categories: SmartInspectTargetCategory[]): string => {
  const suffix = mode === "plan" ? "计划" : "任务";
  if (categories.includes("DRONE") && categories.includes("ROBOT_DOG")) return `无人机机器狗联合巡检${suffix}`;
  if (categories.includes("DRONE")) return `无人机巡检${suffix}`;
  if (categories.includes("ROBOT_DOG")) return `机器狗巡检${suffix}`;
  if (/消防/.test(text)) return `消防安全巡检${suffix}`;
  if (/设备/.test(text)) return `设备安全巡检${suffix}`;
  return `日常巡检${suffix}`;
};

export const SmartInspectAiFillPanel = defineComponent({
  props: {
    mode: {
      type: String as PropType<FormMode>,
      default: "plan",
    },
  },
  emits: ["applyDraft"],
  setup: (props, { emit }) => {
    const state = reactive({
      text: "",
    });

    const handleGenerate = (): void => {
      const text = state.text.trim();
      if (!text) {
        message.warning("请先描述巡检需求");
        return;
      }
      const targetCategories = getDraftCategories(text);
      const payload: AiDraftPayload = {
        targetCategories,
        formValues: {
          name: getDraftName(props.mode, text, targetCategories),
          remark: text,
        },
      };
      emit("applyDraft", payload);
      message.success("AI 智能填写已生成");
    };

    return (): JSX.Element => (
      <div class={styles["ai-panel"]}>
        <div class={styles["ai-panel-header"]}>
          <div class={styles["ai-panel-title"]}>
            <span class={styles["ai-panel-badge"]}>AI</span>
            AI 智能填写
          </div>
          <div class={styles["ai-panel-subtitle"]}>描述您的巡检需求，AI 将自动填写表单</div>
        </div>
        <Textarea
          v-model:value={state.text}
          rows={4}
          maxlength={500}
          placeholder="例如：创建一个针对华威园区地下室的紧急设备巡检任务，由安全部张工执行，今天下午6点前完成..."
        />
        <div class={styles["ai-panel-footer"]}>
          <Button
            onClick={() => {
              state.text = "";
            }}
          >
            清空
          </Button>
          <Button type="primary" onClick={handleGenerate}>
            AI 生成
          </Button>
        </div>
      </div>
    );
  },
});
