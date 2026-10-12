import axios from "axios";
import { computed, defineComponent, onMounted, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import LineChart from "@/shared-ui/panel/lineChart";
import NoData from "@/shared-ui/panel/noData";

import "./delivery-v2-shared.module.less";

export const StarOrderTrend = defineComponent({
  name: "StarOrderTrend",
  setup() {
    const xData = ref<string[]>([]);
    const yData = ref<any[]>([]);
    const hasChartData = computed(
      () => xData.value.length > 0 && yData.value.some((item) => Array.isArray(item.data) && item.data.length > 0),
    );

    const getOrderStatistic = () => {
      axios
        .get("http://112.19.169.2:9090/statistics/getOrderTrend?type=1", {
          headers: {
            Authorization:
              "Bearer qNYzvO0yTvv9cFozOS21nEgl7cnEkCYwwZ0G6cFJnt2GBn7Uql8/UzrIujDBUh8uO1PLIlHhETb55v3OcdGqLh4Pyd5lBf46iujAMJnP44Ddj3Ybw3TmRwTarzYlUyYpAEIJNnUcAu/eP99VRA4byV5nkqUjUw68JWbPsElqXLp+222JGDKTVQj0pxpkIUGN",
          },
        })
        .then((res) => {
          const list = Array.isArray(res?.data?.data) ? res.data.data : [];
          xData.value = list.map((item) => item.time);
          yData.value = [
            {
              name: "月结正常订单",
              lineColor: "#19F8F7",
              linearGradientColor: ["#19F8F7"],
              data: list.map((item) => item.monthPayCount),
            },
            {
              name: "非月结正常订单",
              lineColor: "#2989FF",
              linearGradientColor: ["#2989FF"],
              data: list.map((item) => item.unMonthPayCount),
            },
            {
              name: "退款订单",
              lineColor: "#FF6E23",
              linearGradientColor: ["#FF6E23"],
              data: list.map((item) => item.refundCount),
            },
          ];
        })
        .catch(() => {
          xData.value = [];
          yData.value = [];
        });
    };

    onMounted(() => {
      getOrderStatistic();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["delivery-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {hasChartData.value ? (
          <div class={["delivery-v2-chart", isZoom ? "is-zoom" : ""]}>
            <LineChart
              x-data={xData.value}
              series={yData.value}
              titles={yData.value.map((item) => item.name)}
              gridTop="14"
              gridBottom="10"
              scrollable={false}
            />
          </div>
        ) : (
          <div class={["delivery-v2-empty", isZoom ? "is-zoom" : ""]}>
            <NoData />
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="delivery-v2-root">
        <SubPanelTemplate
          title="订单趋势统计"
          class="visual-v2-sub-panel v2-panel-card delivery-v2-panel"
          zoomable
          zoom-title="订单趋势统计详情"
          zoom-width={900}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="delivery-order-trend" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default StarOrderTrend;
