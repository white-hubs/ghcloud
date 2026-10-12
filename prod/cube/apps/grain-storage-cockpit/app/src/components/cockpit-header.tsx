import { defineComponent, type DefineComponent, type PropType } from "vue";

import { ArrowLeftOutlined, BankOutlined, Button, Select, Tag } from "@ghcloud/cube-ui";

import type { CockpitFilters } from "@/types/cockpit";

interface LegendItem {
  label: string;
  color: string;
}

type CockpitSelectProps = {
  size?: "small" | "middle" | "large";
  showSearch?: boolean;
  value?: string;
  options?: Array<{ label: string; value: string }>;
  onChange?: (value: unknown) => void;
};

// cube-ui 的 Select 运行时 props 均为可选，但旧版声明将其写成必填；在应用边界收窄到本页实际使用的契约。
const CockpitSelect = Select as unknown as DefineComponent<CockpitSelectProps>;

export const CockpitHeader = defineComponent({
  name: "CockpitHeader",
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    clock: { type: String, required: true },
    updateTime: { type: String, required: true },
    filters: { type: Object as PropType<CockpitFilters>, default: undefined },
    legends: { type: Array as PropType<LegendItem[]>, default: () => [] },
    showBack: { type: Boolean, default: false },
  },
  emits: {
    back: (): boolean => true,
    filterChange: (_value: CockpitFilters): boolean => true,
  },
  setup: (props, { emit }) => {
    const updateFilter = (key: keyof CockpitFilters, value: unknown): void => {
      if (!props.filters) return;
      emit("filterChange", { ...props.filters, [key]: String(value) });
    };

    return (): JSX.Element => (
      <header class="cockpit-header">
        <div class="cockpit-header__brand">
          {props.showBack ? (
            <Button class="cockpit-header__back" onClick={() => emit("back")}>
              <ArrowLeftOutlined />
              返回省级驾驶舱
            </Button>
          ) : null}
          <div class="cockpit-header__logo">
            <BankOutlined />
          </div>
          <div class="cockpit-header__titles">
            <div class="cockpit-header__title-row">
              <h1>{props.title}</h1>
              <Tag class="cockpit-demo-tag">演示数据</Tag>
            </div>
            <p>{props.subtitle}</p>
          </div>
        </div>

        <div class="cockpit-header__tools">
          {props.filters ? (
            <div class="cockpit-header__filters">
              <CockpitSelect
                size="small"
                showSearch
                value={props.filters.depot}
                options={[
                  { label: "全部库区", value: "全部" },
                  { label: "霞凝直属库", value: "霞凝直属库" },
                ]}
                onChange={(value: unknown) => updateFilter("depot", value)}
              />
              <CockpitSelect
                size="small"
                showSearch
                value={props.filters.grain}
                options={["全部", "小麦", "稻谷", "玉米", "成品粮"].map((value) => ({
                  label: value === "全部" ? "全部品种" : value,
                  value,
                }))}
                onChange={(value: unknown) => updateFilter("grain", value)}
              />
              <CockpitSelect
                size="small"
                showSearch
                value={props.filters.level}
                options={[
                  { label: "全部等级", value: "全部" },
                  { label: "重大风险", value: "红" },
                  { label: "较大风险", value: "橙" },
                  { label: "一般风险", value: "黄" },
                  { label: "关注", value: "蓝" },
                ]}
                onChange={(value: unknown) => updateFilter("level", value)}
              />
            </div>
          ) : (
            <div class="cockpit-header__legends">
              {props.legends.map((item) => (
                <span class="cockpit-legend" key={item.label}>
                  <i style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
              ))}
            </div>
          )}
          <div class="cockpit-header__separator" />
          <div class="cockpit-header__clock">
            <strong>{props.clock}</strong>
            <span>数据更新 {props.updateTime}</span>
          </div>
        </div>
      </header>
    );
  },
});
