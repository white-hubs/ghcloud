import { defineComponent } from "vue";
import { ref, reactive, toRefs, onMounted, onBeforeUnmount } from "vue";

import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { equipmentTotal } from "@/infrastructure/api/equipment";
import { TenantType } from "@/infrastructure/api/models/ouaa";
import { getTenantDetails } from "@/infrastructure/api/ouaa";
import elevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import useCommon from "@/visualization-core/hooks/useCommon";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const timer: any = ref(null);
    const pieData = ref([
      {
        name: "正常",
        value: 0,
        color: "#2AE8BD",
      },
      {
        name: "离线",
        value: 0,
        color: "#2989FF",
      },
      {
        name: "故障",
        value: 0,
        color: "#FFC700",
      },
      {
        name: "告警",
        value: 0,
        color: "#F14545",
      },
    ]);
    const tenantData = reactive<TenantType>({
      address: "",
      areaCovered: 0,
      building: 0,
      code: "",
      files: [],
      id: "",
      location: "",
      logo: {
        id: "",
        name: "",
        path: "",
        size: "",
        suffix: "",
      },
      name: "",
      remark: "",
    });
    const deviceGenreNums = ref([]);
    let deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    let colorList = ["#2AE8BD", "#99C7FF", "#FFC700", "#F14545"];
    const { getEquipmentNumber } = useCommon();
    let alarmTotal = ref<number>(0);
    // 设备实时数据
    const deviceDataInfo = async () => {
      let res: any = await equipmentTotal({});
      if (!res.deviceNum) {
        return;
      }
      deviceGenreNums.value = res.deviceGenreNums;
      pieData.value.length = 0;
      alarmTotal.value = 0;
      res.deviceStatusNums.forEach((item, index) => {
        alarmTotal.value += item.num;
        let obj = {
          name: deviceStatusType[item.name],
          color: colorList[index],
          value: item.num,
        };
        pieData.value.push(obj);
      });
    };
    // 获取企业介绍
    const getTenantInfo = async () => {
      let res = await getTenantDetails(CubeMfRootGlobalState.getInstance().mfRootState.authInfo.tenant);
      Object.assign(tenantData, res);
    };

    const init = () => {
      deviceDataInfo();
    };
    onMounted(() => {
      deviceDataInfo();
      getTenantInfo();
      // timer.value = setInterval(() => {
      //     init();
      // }, (window as any).config.pageLoopRequestTime);
    });
    onBeforeUnmount(() => {
      clearInterval(timer.value);
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="院区介绍">
            <div class="hospitalInfo">
              {tenantData.logo && <img src={tenantData.logo.path} alt></img>}
              <div class="hospitalInfo-text">
                <div class="hospitalInfo-title"> {tenantData.name}</div>
                <div class="scroll_box">
                  {" "}
                  <div class="scroll-text"> {tenantData.remark}</div>
                </div>
              </div>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备总览">
            <div class="chart">
              <elevator-analysis-pie pieData={pieData.value} radius={"85"}>
                <div style="color: #fff;text-align: center;font-size: 16px;"> {alarmTotal.value}</div>
                <div style="color: #fff;text-align: center;font-size: 14px;"> 总量</div>
              </elevator-analysis-pie>
            </div>
            <div class="deviceList">
              {pieData.map((item) => (
                <div class="deviceBox" key={item.color}>
                  <div class="deviceBox_left">
                    <span class="deviceBox_color" style={{ backgroundColor: item.color }}></span>
                    <span class="deviceBox_name"> {item.name}</span>
                  </div>
                  <div class="deviceBox_right"> {item.value}</div>
                </div>
              ))}
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备类型">
            <div class="deviceTypeList">
              {deviceGenreNums.map((item) => (
                <div class="deviceTypeBox" key={item.genre}>
                  <div class="deviceTypeBox_left">
                    {item.icon && <i class={["iconfont", item.icon, "iconStyle"]}></i>}
                    <i class={["iconfont", "icon-bianyaqi1", "iconStyle"]}></i>
                    <span> {item.genreName}</span>
                  </div>
                  <div class="deviceTypeBox_right">
                    <count-to style="font-size: 16px;" startVal={0} endVal={item.num} separator duration={4000} class="scroll-number" />
                    <span> 台</span>
                  </div>
                </div>
              ))}
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left;
