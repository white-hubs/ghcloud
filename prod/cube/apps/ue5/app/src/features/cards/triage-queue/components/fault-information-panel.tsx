import { defineComponent } from "vue";
import { ref } from "vue";

import scrollParmas from "@/features/panel-shell/tables/roll-table/scroll-params";
import { Vue3SeamlessScroll } from "@/features/panel-shell/tables/seamless-scroll";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";

import styles from "./fault-information-panel.module.less";

export const FaultInformationPanel = defineComponent({
  name: "FaultInformationPanel",
  setup(_props, ctx) {
    const { step, waitTime } = scrollParmas();

    /**
     * 故障信息
     */
    const faultInformationData = ref([
      { time: "05-20 15:22", typeName: "监控设备", deviceName: "1号监控", faultTypeName: "设备死机" },
      { time: "05-12 10:22", typeName: "叫号机", deviceName: "2号叫号机", faultTypeName: "设备死机" },
      { time: "04-15 11:22", typeName: "签到机", deviceName: "1号签到机", faultTypeName: "设备死机" },
      { time: "04-16 09:22", typeName: "叫号机", deviceName: "2号叫号机", faultTypeName: "设备死机" },
    ]);

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="故障信息">
          <div class="fault-information-table">
            <div class="table-header">
              <span> 故障时间</span>
              <span> 设备名称</span>
              <span> 设备类型</span>
              <span> 故障类型</span>
            </div>
            <div class="table-body">
              <vue3-seamless-scroll list={faultInformationData.value} step={step} hover singleHeight={36} waitTime={waitTime}>
                {faultInformationData.map((item, index) => (
                  <div class="item" key={index} style={{ backgroundColor: index % 2 === 0 ? "rgba(171,177,189,0.12)" : "" }}>
                    <div class="time">
                      {" "}
                      <p> {item.time}</p>
                    </div>
                    <span> {item.deviceName}</span>
                    <span> {item.typeName}</span>
                    <span> {item.faultTypeName}</span>
                  </div>
                ))}
              </vue3-seamless-scroll>
            </div>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default FaultInformationPanel;
