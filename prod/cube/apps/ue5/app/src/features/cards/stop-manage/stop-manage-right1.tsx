import { defineComponent } from "vue";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import { chargingOverview, paymentMethod, tollInterval } from "@/infrastructure/utils/requestData/parkingSpaceManage";
import chargingModule from "@/shared-ui/panel/chargingModule";
import pillar from "@/shared-ui/panel/charts/pillar/pillar";
import RoundPie from "@/shared-ui/panel/charts/roundPie/roundPie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import pieList from "@/shared-ui/panel/pieList";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./stop-manage-right1.module.less";

export const StopManageRight1 = defineComponent({
  name: "StopManageRight1",
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
    let range = ref();
    let total = ref(0);
    let timer: any = reactive(null);
    let colorList = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A", "#CBE2FF"];
    let roundPieData = reactive({
      arr: [],
    });

    const barData = reactive({
      xData: ["1月", "2月", "3月", "4月", "5月", "6月"],
      yData: [120, 200, 150, 80, 70, 110],
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
      total.value = res.total;
    };
    // 支付方式占比
    const tollIntervalInfo = async () => {
      let res = await tollInterval({ dimension: pay.value.timeType });
      barData.xData = res.xdata;
      barData.yData = res.series[0].value;
    };
    const init = () => {
      getChargingOverviewInfo();
      paymentProportion();
      tollIntervalInfo();
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
            <DateInlineForm
              modelValue={collectFees.value}
              onUpdate:modelValue={(v) => {
                collectFees.value = v;
              }}
              onSearch={getChargingOverviewInfo}
            ></DateInlineForm>
            <div class="chargingModuleBox">
              {collectFeesList.arr.map((item, index) => (
                <chargingModule collectFeesData={item} key={index}></chargingModule>
              ))}
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="支付方式占比">
            <DateInlineForm
              modelValue={pay.value}
              onUpdate:modelValue={(v) => {
                pay.value = v;
              }}
              onSearch={paymentProportion}
            ></DateInlineForm>
            <OperateDays style="margin-top: 10px;" value={total.value} title="实收总金额"></OperateDays>
            <div class="equipmentAlarm">
              <RoundPie data={roundPieData.arr}>
                {" "}
                <div>
                  {" "}
                  <img width="25" height="25" src={getAssetsImage("money1.png")} alt></img>
                </div>
              </RoundPie>
              <pieList roundPieData={roundPieData.arr}></pieList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="收费区间分布">
            <DateInlineForm
              modelValue={range.value}
              onUpdate:modelValue={(v) => {
                range.value = v;
              }}
              onSearch={tollIntervalInfo}
            ></DateInlineForm>
            <pillar x-data={barData.xData} y-data={barData.yData} blg-color={"rgba(170, 140, 34, 0.20)"} bar-color={"#FFC700"}></pillar>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default StopManageRight1;
