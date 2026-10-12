import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import pie from "./components/pie";
import quarantinetable from "./components/quarantine-table";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { classification } from "@/infrastructure/api/device";
import { spotCheck, suspicion } from "@/infrastructure/api/slide";
import { setTimeType } from "@/infrastructure/utils/common";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import barChart from "@/shared-ui/panel/charts/bar/barChart";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./floor-left.module.less";

export const FloorLeft = defineComponent({
  name: "FloorLeft",
  setup(_props, ctx) {
    const spotCheckTime = ref<ModelValueItf>({
      timeType: "THIS_WEEK",
      dateRange: [],
    });
    const suspicionTime = ref<ModelValueItf>({
      timeType: "THIS_WEEK",
      dateRange: [],
    });
    const Operatevalue = ref<number>();
    const timeList = [
      { label: "近7天", value: "THIS_WEEK" },
      { label: "近30天", value: "THIS_MONTH" },
      { label: "近1年", value: "THIS_YEAR" },
    ];
    const { globalState } = useStateStore();
    const foodSafety = reactive<any>({
      yData: [
        {
          color: "#D9E7FF",
          data: [],
          name: "不合格数量",
          showBackground: true,
          backgroundStyle: { color: "#6C8097" },
          labelFalge: true,
        },
      ],
      xData: [],
    });
    const deviceData = ref<any>();
    const register = ref(false);
    const clickregister = () => {
      register.value = true;
    };
    const changesuspicionTime = () => {
      getsuspicion();
    };
    const changespotCheckTime = () => {
      getspotCheck();
    };
    const piedata = ref([]);
    const getsuspicion = async () => {
      const data = await suspicion({ type: setTimeType(suspicionTime.value.timeType) });
      piedata.value = [
        {
          name: "",
          type: "pie",
          radius: [60, 80],
          center: ["50%", "50%"],
          data: [
            {
              value: data.suspicionNum,
              name: `有嫌疑（${data.suspicion}%）`,
              pop: data.qoqSuspicion,
              itemStyle: {
                color: "#FFAB10",
              },
            },
            {
              value: data.noDoubtNum,
              name: `无嫌疑（${data.noDoubt}%）`,
              pop: data.qoqNoDoubt,
              itemStyle: {
                color: "#58FAB6",
              },
            },
          ],
        },
      ];
    };
    const pratiqueFailednum = ref();
    const getspotCheck = async () => {
      const data = await spotCheck({
        type: setTimeType(spotCheckTime.value.timeType),
      });
      Operatevalue.value = data.supplyReports;
      pratiqueFailednum.value = data.pratiqueFailed;
      Object.assign(foodSafety.yData[0].data, [
        {
          value: data.pratiqueFailed,
          pop: data.qoqPratiqueFailed,
        },
        {
          value: data.clenbuterolFailed,
          pop: data.qoqClenbuterolFailed,
        },
        {
          value: data.watered,
          pop: data.qoqWatered,
        },
      ]);
      foodSafety.xData = ["检疫票", "瘦肉精", "含水量"];
    };
    const getdevice = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
      };
      let data = await classification(params);
      deviceData.value = data;
    };
    onMounted(() => {
      getdevice();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="食安信息">
            <template>
              {" "}
              <DateInlineForm
                timeList={timeList}
                modelValue={spotCheckTime.value}
                onUpdate:modelValue={(v) => {
                  spotCheckTime.value = v;
                }}
                onSearch={changespotCheckTime}
              ></DateInlineForm>
            </template>
            <OperateDays value={Operatevalue.value} title="来货报备批次数" onClick={clickregister}></OperateDays>
            <div class="chart">
              {" "}
              <barChart colorLsit={["#98ACCD", "#D9E7FF"]} data={foodSafety.yData} xData={foodSafety.xData}></barChart>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="批次作弊嫌疑率">
            <template>
              {" "}
              <DateInlineForm
                timeList={timeList}
                modelValue={suspicionTime.value}
                onUpdate:modelValue={(v) => {
                  suspicionTime.value = v;
                }}
                onSearch={changesuspicionTime}
              ></DateInlineForm>
            </template>
            <div class="chart">
              {" "}
              <pie data={piedata.value}></pie>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备数据">
            <div class="device-data-list">
              {deviceData.map((item, index) => (
                <div class="device-data-box" class={index % 2 == 0 ? "bgColor" : ""} key={item.name}>
                  <div class="device-left"> {item.type}</div>
                  <div class="device-centre">
                    <span>
                      总数:
                      {item.num}
                    </span>
                    <span>
                      <img src={getAssetsImage("overView51.png")} alt />
                      {item.onLineNum}
                    </span>
                    <span>
                      <img src={getAssetsImage("overView50.png")} alt />
                      {item.offLineNum}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SubPanelTemplate>
        </div>
        <quarantinetable
          show-modal={register.value}
          title="检疫票"
          total={Operatevalue.value}
          seven={pratiqueFailednum.value}
          type={spotCheckTime.value}
        ></quarantinetable>
      </>
    );
  },
});

export default FloorLeft;
