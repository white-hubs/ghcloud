import { defineComponent, type PropType } from "vue";

import type { ColdStoreMonitorCard, ColdStoreMonitorExceptionStatistics } from "@ghcloud/cube-service-interface/cold-storage";
import { Button } from "@ghcloud/cube-ui";

import { monitorFootText, monitorMetrics } from "../../monitoring-data";

import "./index.less";

export const MonitoringList = defineComponent({
  name: "MonitoringList",
  props: {
    stores: {
      type: Array as PropType<ColdStoreMonitorCard[]>,
      required: true,
    },
    statistics: {
      type: Object as PropType<ColdStoreMonitorExceptionStatistics>,
      required: true,
    },
    FilterForm: {
      type: Function as PropType<() => JSX.Element>,
      required: true,
    },
  },
  emits: ["selectStatus", "openStore"],
  setup: (props, { emit }) => {
    const FilterForm = props.FilterForm;
    const alertItems = () =>
      [
        ["氨浓度异常", props.statistics.ammoniaExceptionCount ?? 0, "red", "AMMONIA_EXCEPTION"],
        ["制冷异常", props.statistics.refrigerationExceptionCount ?? 0, "orange", "REFRIGERATION_EXCEPTION"],
        ["库门异常", props.statistics.doorExceptionCount ?? 0, "orange", "DOOR_EXCEPTION"],
        ["温湿度异常", props.statistics.temperatureHumidityExceptionCount ?? 0, "gray", "TEMPERATURE_HUMIDITY_EXCEPTION"],
      ] as const;

    return () => (
      <div class="cs-page">
        <div class="cs-alert-row">
          {alertItems().map(([label, value, tone, status]) => (
            <Button type="text" class={`cs-alert-card tone-${tone}`} onClick={() => emit("selectStatus", status)}>
              <span>{label}</span>
              <b>{value}</b>
            </Button>
          ))}
        </div>
        <div class="cs-toolbar">
          <div class="monitoring-filter-form">
            <FilterForm />
          </div>
        </div>
        <div class="store-grid">
          {props.stores.map((store) => (
            <section class="store-card" key={store.id}>
              <div class="store-card-hd">
                <b>{store.name || store.code || "--"}</b>
              </div>
              <div class="metric-grid">
                {monitorMetrics(store.metrics).map((metric) => (
                  <div class={`metric-cell tone-${metric.tone ?? "blue"}`} key={metric.label}>
                    <span>{metric.label}</span>
                    <b>{metric.value}</b>
                  </div>
                ))}
              </div>
              <div class="store-card-ft">
                <span>{monitorFootText(store)}</span>
                <Button type="link" onClick={() => emit("openStore", store)}>
                  查看详情
                </Button>
              </div>
            </section>
          ))}
        </div>
      </div>
    );
  },
});
