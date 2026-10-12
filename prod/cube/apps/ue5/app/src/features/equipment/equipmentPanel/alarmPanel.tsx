import { defineComponent } from "vue";
import { ref, reactive } from "vue";

import DevicePanelTemplat from "./devicePanelTemplat";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import H5Video from "@/shared-ui/panel/H5Video";

import styles from "./alarmPanel.module.less";

export const AlarmPanel = defineComponent({
  name: "AlarmPanel",
  setup(_props, ctx) {
    interface CameraInfo {
      name: string;
      token: string;
      session?: string;
      serverIp?: string;
      code?: string;
    }
    const activeKey = ref<string>("1");
    const cameraInfo: CameraInfo[] = [
      {
        name: "一号门摄像机5号",
        token: "1429",
        session: "2586892e-9894-4d29-a9f8-49996c149f64",
        serverIp: "112.19.169.2:2500",
        code: "YQ-1F-JK-XZ041",
      },
      {
        name: "水产5栋4号",
        token: "1046",
        session: "2586892e-9894-4d29-a9f8-49996c149f64",
        serverIp: "112.19.169.2:2500",
        code: "YQ-1F-JK-XZ092",
      },
    ];
    const options = ref([
      {
        label: "隐患排查",
        value: "yhpc",
      },
      {
        label: "故障报修",
        value: "gzbx",
      },
      {
        label: "委外维修",
        value: "wwwx",
      },
      {
        label: "更新改造",
        value: "gxgz",
      },
    ]);
    const form = reactive({
      value: "",
      description: "",
    });

    return (): JSX.Element => (
      <device-panel-templat title="设备报警">
        <div class="content">
          <a-tabs
            activeKey={activeKey}
            onUpdate:activeKey={(v) => {
              activeKey.value = v;
            }}
          >
            <a-tab-pane key="1" tab="基础信息">
              <div class="basics-info">
                <div class="info-item">
                  设备名称：
                  <span> 1F配电箱</span>
                </div>
                <div class="info-item">
                  报警类型：
                  <span> A项电流超高</span>
                </div>
                <div class="info-item">
                  报警级别：
                  <span class="danger"> 一级报警</span>
                </div>
                <div class="info-item">
                  所属区域：
                  <span> 海鲜广场/1F</span>
                </div>
                <div class="info-item">
                  设备类型：
                  <span> 配电箱</span>
                </div>
                <div class="info-item">
                  设备图片：
                  <a-image src={getAssetsImage("time1.png")}></a-image>
                </div>
              </div>
              <div class="scene flex-between">
                <div class="camera-box">
                  {" "}
                  <h5-video cameraItem={cameraInfo[0]} idStr={cameraInfo[0].token + "_id4321"}></h5-video>
                </div>
                <div class="camera-box">
                  {" "}
                  <h5-video cameraItem={cameraInfo[1]} idStr={cameraInfo[1].token + "_id4321"}></h5-video>
                </div>
              </div>
            </a-tab-pane>
            <a-tab-pane key="2" tab="工单信息">
              <a-form>
                <a-form-item label="工单类型：">
                  {" "}
                  <a-select
                    value={form.value}
                    onUpdate:value={(v) => {
                      form.value = v;
                    }}
                    options={options}
                  ></a-select>
                </a-form-item>
                <a-form-item label="原因描述：">
                  {" "}
                  <a-textarea
                    value={form.description}
                    onUpdate:value={(v) => {
                      form.description = v;
                    }}
                    showCount
                    maxlength={100}
                    placeholder="最多输入100字"
                  />
                </a-form-item>
              </a-form>
              <div class="footer">
                <a-space size={16}>
                  <a-button> 取消</a-button>
                  <a-button type="primary"> 提交</a-button>
                </a-space>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>
      </device-panel-templat>
    );
  },
});

export default AlarmPanel;
