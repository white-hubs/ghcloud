import { defineComponent } from "vue";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import { chargingOverview, paymentMethod, chargingTrends } from "@/infrastructure/utils/requestData/parkingSpaceManage";
import changeBar from "@/shared-ui/panel/changeBar";
import chargingModule from "@/shared-ui/panel/chargingModule";
import RoundPie from "@/shared-ui/panel/charts/roundPie/roundPie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import pieList from "@/shared-ui/panel/pieList";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./stop-manage-right.module.less";

export const StopManageRight = defineComponent({
  name: "StopManageRight",
  setup(_props, ctx) {
    const { globalState } = useStateStore();

    watch(
      () => globalState.business.currentAreaId,
      () => {
        clearInterval(timer);
        timer = setInterval(
          () => {
            init();
          },
          (window as any).config.pageLoopRequestTime,
        );
        init();
      },
    );
    let collectFees = ref();
    let pay = ref();
    let trend = ref();
    let timer: any = reactive(null);
    let total = ref(0);
    let colorList = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A", "#CBE2FF"];
    const moneyUnit = ref<string>("元");
    let roundPieData = reactive({
      arr: [],
    });
    let xData = reactive({
      arr: [],
    });

    const series = reactive({
      arr: [
        {
          data: [0, 0, 0, 0, 0, 0, 0, 0],
          linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
        },
      ],
    });
    let collectFeesList: any = reactive({
      arr: [],
    });

    // 收费总览
    const getChargingOverviewInfo = async () => {
      collectFeesList.arr = await chargingOverview({ dimension: collectFees.value.timeType });
    };
    // 支付方式占比
    const paymentProportion = async () => {
      let res = await paymentMethod({ dimension: pay.value.timeType });
      roundPieData.arr = res.arr.map((item, index) => {
        item.color = colorList[index];
        return item;
      });
      if (res.total > 100000) {
        total.value = res.total / 10000;
        moneyUnit.value = "万元";
      } else {
        total.value = res.total;
        moneyUnit.value = "元";
      }
    };
    // 收费趋势
    const chargingTrendsInfo = async () => {
      let res = await chargingTrends({ dimension: trend.value.timeType });
      xData.arr = res.xdata;
      series.arr[0].data = res.series[0].value;
    };
    const init = () => {
      getChargingOverviewInfo();
      paymentProportion();
      chargingTrendsInfo();
    };

    onMounted(() => {
      timer = setInterval(
        () => {
          init();
        },
        (window as any).config.pageLoopRequestTime,
      );
    });
    onBeforeUnmount(() => {
      clearInterval(timer);
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="收费总览">
            <template>
              {" "}
              <DateInlineForm
                modelValue={collectFees.value}
                onUpdate:modelValue={(v) => {
                  collectFees.value = v;
                }}
                onSearch={getChargingOverviewInfo}
              ></DateInlineForm>
            </template>
            <div class="chargingModuleBox" style="min-height: 150px">
              {collectFeesList.arr.map((item, index) => (
                <chargingModule collectFeesData={item} key={index}></chargingModule>
              ))}
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="支付方式占比">
            <template>
              {" "}
              <DateInlineForm
                modelValue={pay.value}
                onUpdate:modelValue={(v) => {
                  pay.value = v;
                }}
                onSearch={paymentProportion}
              ></DateInlineForm>
            </template>
            <OperateDays style="margin-top: 10px" value={total.value} title="实收总金额" unit={moneyUnit.value} decimals={2}></OperateDays>
            <div class="equipmentAlarm">
              <RoundPie data={roundPieData.arr}>
                {" "}
                <div>
                  {" "}
                  <img width="25" height="25" src={getAssetsImage("money1.png")} alt />
                </div>
              </RoundPie>
              <pieList roundPieData={roundPieData.arr}></pieList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="收费趋势" class="collect">
            <template>
              {" "}
              <DateInlineForm
                modelValue={trend.value}
                onUpdate:modelValue={(v) => {
                  trend.value = v;
                }}
                onSearch={chargingTrendsInfo}
              ></DateInlineForm>
            </template>
            <div class="chart">
              {" "}
              <LineChart x-data={xData.arr} series={series.arr} title={"元"}></LineChart>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default StopManageRight;
