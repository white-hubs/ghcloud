import { CloseOutlined, RightOutlined } from "@ant-design/icons-vue";
import { defineComponent } from "vue";
import { computed, onMounted, reactive, ref } from "vue";

import { associatedVideos } from "@/infrastructure/api/device";
import { getDeviceInfo } from "@/infrastructure/api/equipment";

import styles from "./index.module.less";

export const Index = defineComponent({
  name: "Index",
  props: {
    title: {
      type: [String],
      default: "南区13号档位",
    },
    id: {
      type: [String],
      default: "1649953388495978497",
    },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const modalData = reactive(props);
    const infodata = reactive({});
    const readData = ref([]);
    const readAndWritData = ref([]);
    const cameraList = ref([]);
    const closeModal = () => {
      getDeviceInfo(modalData.id).then((res) => {});

      emit("close");
    };

    const getData = () => {
      getDeviceInfo(modalData.id).then((res) => {
        Object.assign(infodata, res.detail);
        readData.value = res.deviceAttributes.filter((item) => item.permission === "READ");
        readAndWritData.value = res.deviceAttributes.filter((item) => item.permission === "READ_WRITE");
      });
      associatedVideos(modalData.id as any).then((res) => {
        cameraList.value = res;
      });
    };
    onMounted(() => {
      getData();
    });

    return (): JSX.Element => (
      <>
        <div class="alarmDetail-wrap">
          <div class="alarmDetail-modal">
            <div class="alarmDetail-modal-header">
              <div class="header-title">
                <IconFont type="icon-offline" style={{ fontSize: "24px", color: "rgba(41, 137, 255, 1)" }} />
                <span> {modalData.title}</span>
                <a-tag color="#529ea6"> 已出租</a-tag>
              </div>
              <div class="header-close" onClick={closeModal}>
                {" "}
                <CloseOutlined />
              </div>
            </div>
            <div class="alarmDetail-modal-content flex-column">
              <div style="margin: 0 auto; color: #fff">
                <div class="area"> 300m³</div>
                <div class="area_address"> 空间面积</div>
              </div>
              <div class="conent-body">
                <div class="currentinfo"> 当前租赁信息</div>
                <div style="border: 1px solid #529ea6"></div>
                <div class="lease_info">
                  <div class="item">
                    档主姓名/手机号
                    <span> 郑少绵</span>
                  </div>
                  <div class="item">
                    租金
                    <span> 31546.2</span>
                  </div>
                </div>
                <div
                  style="
              display: flex;
              justify-content: space-between;
              padding: 0 30px;
              margin-top: 15px;
            "
                >
                  <div class="item">
                    租赁起止时间
                    <span> 2020-08-24~2023-08-23</span>
                  </div>
                  <div class="item">
                    管理费
                    <span> 1648.5</span>
                  </div>
                </div>
                <div class="currentinfo" style="margin-top: 15px">
                  {" "}
                  租赁历史信息
                </div>
                <div style="border: 1px solid #529ea6"></div>
                <div style="display: flex; flex-flow: row wrap">
                  {history.map((item, index) => (
                    <div class="history_lease">
                      <div style={index % 2 == 0 ? "border-right: 1px solid hsla(0,0%,100%,.7);" : ""}>
                        <div style="color: #fff"> {item.time}</div>
                        <div class="history_lease_name"> {item.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div class="currentinfo" style="margin-top: 15px">
                  {" "}
                  从业人员信息
                </div>
                <div style="border: 1px solid #529ea6"></div>
                <div style="display: flex; flex-flow: row wrap">
                  {workuesr.map((item, index) => (
                    <div class="history_lease">
                      <div style={index % 2 == 0 ? "border-right: 1px solid hsla(0,0%,100%,.7);" : ""}>
                        <div style="color: #fff"> {item.time}</div>
                        <div class="history_lease_name"> {item.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div class="currentinfo" style="margin-top: 15px">
                  {" "}
                  消防巡查
                </div>
                <div style="border: 1px solid #529ea6"></div>
                <div class="patrol_num">
                  <div class="patrol_con">
                    <div> 累计巡查除数</div>
                    <div style="color: #81a523"> 30</div>
                  </div>
                  <div class="patrol_con">
                    <div> 累计巡查合格率</div>
                    <div style="color: #81a523"> 45.1%</div>
                  </div>
                </div>
                <div style="display: flex; flex-flow: row wrap">
                  {check.map((item, index) => (
                    <div class="history_lease">
                      <div style={index % 2 == 0 ? "border-right: 1px solid hsla(0,0%,100%,.7);" : ""}>
                        <div style="color: #fff"> {item.time}</div>
                        <div class="history_lease_name"> {item.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  },
});

export default Index;
