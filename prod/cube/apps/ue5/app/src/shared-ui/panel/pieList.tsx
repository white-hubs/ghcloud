import { computed, defineComponent, isRef } from "vue";

import CountTo from "./count-to/count-to";

import "./pieList.module.less";

export const PieList = defineComponent({
  name: "PieList",
  props: {
    roundPieData: { type: Array, required: true },
    class: { type: String, required: false },
  },
  emits: ["handelClickItemize"],
  setup(props, { emit }) {
    const roundPieDataList = computed(() => {
      const raw = isRef(props.roundPieData) ? props.roundPieData.value : props.roundPieData;
      return Array.isArray(raw) ? raw : [];
    });

    const character = (value: string): string => (value.includes("(") ? "(" : "");

    const handelClick = (item: unknown): void => {
      emit("handelClickItemize", item);
    };

    return (): JSX.Element => (
      <div class={["policeList", props.class]}>
        {roundPieDataList.value.map((item: Record<string, unknown>) => {
          const label = String(item.label ?? item.name ?? "");
          const hasParen = label.includes("(");

          return (
            <div class="thePolice" key={String(item.color)} onClick={() => handelClick(item)}>
              <div title={label}>
                <span style={{ background: String(item.color) }} class="thePoliceColor" />
                {hasParen ? (
                  <>
                    <span class="thePoliceLeft">{label.split("(")[0]}</span>
                    <span style="line-height: 20px">
                      {character(label)}
                      {label.split("(")[1]}
                    </span>
                  </>
                ) : (
                  <span class="thePoliceLeft">{label}</span>
                )}
              </div>
              <span class="pie-list-metrics">
                <span class="pie-list-value">
                  {typeof item.value === "number" ? (
                    <CountTo startVal={0} endVal={item.value} duration={1000} separator="" />
                  ) : (
                    <span>{String(item.value ?? "")}</span>
                  )}
                  {item.unit ? <span class="pie-list-unit">{String(item.unit)}</span> : null}
                </span>
                {item.ratio ? <span class="ratio pie-list-ratio">{String(item.ratio)}</span> : null}
              </span>
            </div>
          );
        })}
      </div>
    );
  },
});

export default PieList;
