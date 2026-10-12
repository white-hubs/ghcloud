import axios from "axios";
import { defineComponent, onMounted, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import NoData from "@/shared-ui/panel/noData";

import "./delivery-v2-shared.module.less";

export const StarRealtimeEvaluation = defineComponent({
  name: "StarRealtimeEvaluation",
  setup() {
    const column = [
      {
        title: "评价时间",
        dataIndex: "evaluationTime",
      },
      {
        title: "评价人",
        dataIndex: "mobile",
        slots: {
          customRender: "mobile",
        },
        customRender: (text) => {
          return text.substr(0, 3) + "****" + text.substr(7);
        },
      },
      {
        title: "类型",
        dataIndex: "evaluationType",
        slots: {
          customRender: "evaluationType",
        },
        customRender: (text) => {
          return text === "0" ? "收件人" : "寄件人";
        },
      },
      {
        title: "评价分数",
        dataIndex: "evaluationAvg",
      },
    ];
    const tableData = ref([]);

    const getScoreList = () => {
      axios
        .post(
          "http://112.19.169.2:9090/evaluation/order/page",
          { curPage: 1, pageSize: 20 },
          {
            headers: {
              Authorization:
                "Bearer qNYzvO0yTvv9cFozOS21nEgl7cnEkCYwwZ0G6cFJnt2GBn7Uql8/UzrIujDBUh8uO1PLIlHhETb55v3OcdGqLh4Pyd5lBf46iujAMJnP44Ddj3Ybw3TmRwTarzYlUyYpAEIJNnUcAu/eP99VRA4byV5nkqUjUw68JWbPsElqXLp+222JGDKTVQj0pxpkIUGN",
            },
          },
        )
        .then((res) => {
          tableData.value = Array.isArray(res?.data?.data?.records) ? res.data.data.records : [];
        })
        .catch(() => {
          tableData.value = [];
        });
    };

    onMounted(() => {
      getScoreList();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["delivery-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {tableData.value.length === 0 ? (
          <div class={["delivery-v2-empty", isZoom ? "is-zoom" : ""]}>
            <NoData />
          </div>
        ) : (
          <div class={["delivery-v2-table", "visual-v2-roll-table", isZoom ? "is-zoom" : ""]}>
            <RollTable column={column} data={tableData.value} showLength={isZoom ? 10 : 5} />
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="delivery-v2-root">
        <SubPanelTemplate
          title="实时评价"
          class="visual-v2-sub-panel v2-panel-card delivery-v2-panel"
          zoomable
          zoom-title="实时评价详情"
          zoom-width={900}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="delivery-evaluation" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default StarRealtimeEvaluation;
