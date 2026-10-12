import { WarningOutlined } from "@ant-design/icons-vue";
import { defineComponent } from "vue";
import { onMounted, ref } from "vue";

import { healthProblemsLatest } from "@/infrastructure/api/equipment";

import styles from "./scan-chart.module.less";

export const ScanChart = defineComponent({
  name: "ScanChart",
  props: {
    deviceId: { type: String, required: true, default: "" },
  },
  setup(props, ctx) {
    interface Props {
      deviceId: string;
    }
    interface FaultResult {
      createTime: string;
      healthValue: number;
      problemItemNumber: number;
      problems: string[];
      testItemNumber: number;
    }
    const deviceFaultResut = ref<FaultResult>({
      createTime: "",
      healthValue: 0,
      problemItemNumber: 0,
      problems: [],
      testItemNumber: 0,
    });
    onMounted(() => {
      deviceHealthFault();
    });
    const deviceHealthFault = async () => {
      const res = await healthProblemsLatest(props.deviceId);
      deviceFaultResut.value = res;
    };
    const resetFault = () => {
      deviceFaultResut.value = {
        createTime: "",
        healthValue: 0,
        problemItemNumber: 0,
        problems: [],
        testItemNumber: 0,
      };
      deviceHealthFault();
    };

    return (): JSX.Element => (
      <>
        <div class="device-detection flex-start">
          <div class="scan">
            <div class="radar"></div>
            <div class="button" onClick={resetFault}>
              {" "}
              重新检测
            </div>
          </div>
          <div class="fault-info">
            <div class="fault-list">
              <div class="list-header">
                共检测
                <span class="total"> {deviceFaultResut.testItemNumber}</span>
                项，有
                <span class="fault"> {deviceFaultResut.problemItemNumber}</span>
                项有问题！
              </div>
              {deviceFaultResut.problems.map((item) => (
                <div class="list-item">
                  <WarningOutlined />
                  <span> {item}</span>
                </div>
              ))}
            </div>
            <div class="fault-time">
              <span>
                检测时间：
                {deviceFaultResut.createTime}
              </span>
            </div>
          </div>
        </div>
      </>
    );
  },
});

export default ScanChart;
