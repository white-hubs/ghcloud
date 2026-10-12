import { message } from "ant-design-vue";
import moment from "moment";
import { defineComponent, onMounted, reactive, type PropType } from "vue";

import { getDeviceInfo } from "@/infrastructure/api/equipment";
import { getIotDeviceListByEvent, manualControlIotDevice, getIotDeviceProRecords } from "@/infrastructure/api/linkage";

import "./plan.module.less";

const actionResult: Record<string, string> = {
  ARRIVAL: "下发成功",
  ISSUING: "下发中",
  SUCCESS: "执行成功",
  FAIL: "执行失败",
  EXPIRED: "执行超时",
};

export const AlarmPlan = defineComponent({
  name: "AlarmPlan",
  props: {
    id: { type: [String, Number] as PropType<string | number | null>, default: null },
    businessKey: { type: [String, Number] as PropType<string | number | null>, default: null },
  },
  setup(props) {
    const state = reactive<{
      linkageData: any[];
      recordData: any[];
      deviceInfoList: any[];
    }>({
      linkageData: [],
      recordData: [],
      deviceInfoList: [],
    });

    const getDeviceLinkageList = async (): Promise<void> => {
      const data = await getIotDeviceListByEvent({
        eventId: props.businessKey,
      });
      if (data) {
        state.linkageData = data;
        data.forEach((e: any) => {
          void getDeviceInfo(e.deviceId).then((res) => {
            state.deviceInfoList.push(res);
          });
        });
      }
    };

    const implement = async (record: any): Promise<void> => {
      const data = await manualControlIotDevice({
        eventIotDeviceId: record.id,
      });
      if (data) {
        message.success("下发指令成功！");
      }
    };

    const getDeviceLinkageRecord = async (): Promise<void> => {
      const data = await getIotDeviceProRecords({
        eventId: props.businessKey,
      });
      if (data) {
        state.recordData = data;
      }
    };

    onMounted(() => {
      void getDeviceLinkageList();
      void getDeviceLinkageRecord();
    });

    return (): JSX.Element => (
      <div class="alarmDetail-plan">
        <div class="plan-table">
          <div class="title">设备联动</div>
          <div class="table-container">
            <div class="table-header">
              <div>设备名称</div>
              <div>设备属性</div>
              <div>执行动作</div>
              <div>执行时机</div>
              <div>操作</div>
            </div>
            <div class="table-body">
              {state.linkageData.map((item) => (
                <div class="table-body-item" key={item.id}>
                  <div>{item.deviceName}</div>
                  <div>{item.propName}</div>
                  <div>{item.translatedValue}</div>
                  <div>{item.executeMode == "AUTOMATIC" ? "自动" : "手动"}</div>
                  <div>
                    <a-button type="link" onClick={() => void implement(item)}>
                      执行
                    </a-button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div class="plan-table">
          <div class="title">联动日志</div>
          <div class="table-container">
            <div class="table-header">
              <div>执行时间</div>
              <div>触发人员</div>
              <div>设备名称</div>
              <div>设备属性</div>
              <div>执行动作</div>
              <div>执行结果</div>
            </div>
            <div class="table-body">
              {state.recordData.map((item) => (
                <div class="table-body-item" key={item.id}>
                  <div>{moment(item.executeTime).format("YYYY-MM-DD HH:mm:ss")}</div>
                  <div>{item.operatorName}</div>
                  <div>{item.deviceName}</div>
                  <div>{item.propName}</div>
                  <div>{item.translatedValue}</div>
                  <div
                    style={{
                      color: item.executeStatus === "SUCCESS" ? "#1EC138" : item.executeStatus === "FAIL" ? "#FF3D3D" : "#FF9737",
                    }}
                  >
                    {actionResult[item.executeStatus] || item.executeStatus}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
});

export default AlarmPlan;
