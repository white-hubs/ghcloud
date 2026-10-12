import { CloseOutlined, FullscreenExitOutlined } from "@ant-design/icons-vue";
import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import { stallDetailId, stallDetailVisualization } from "@/infrastructure/api/mdata";
import { useDragPosition } from "@/visualization-core/hooks/use-drag-position";

import styles from "./stall-model.module.less";

export const StallModel = defineComponent({
  name: "StallModel",
  props: {
    id: {
      type: [String],
      default: "",
    },
    code: {
      type: [String],
      default: "",
    },
    isequ: {
      type: Boolean,
      default: false,
    },
    PanelName: {
      type: Object,
      default: false,
    },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const tabsList = ref(["基本信息"]);
    const stallData = ref({
      files: [{ id: "", path: "" }],
      code: "",
      masterName: "",
      typeName: "",
      location: "",
      practicalArea: "",
      leaseType: "",
      remark: "",
      name: "",
      masterPhone: "",
      areaNames: "",
      builtUpArea: "",
      enabled: "",
      deptNames: "",
    });
    const infoData = ref({
      name: "档位信息",
    });
    const modalRef = ref<HTMLElement | null>(null);
    const { startDrag } = useDragPosition(modalRef);
    const backModal = () => {
      emit("close", false);
    };
    const closeModal = () => {
      emit("close", true);
    };
    const getStallDetail = async () => {
      if (props.id) {
        stallData.value = await stallDetailId(props.id);
      } else if (props.code) {
        stallData.value = await stallDetailVisualization(props.code);
      }
    };
    onMounted(() => {
      getStallDetail();
    });

    return (): JSX.Element => (
      <>
        <Teleport to="body">
          <div class="alarmDetail-wrap">
            <div class="alarmDetail-modal" ref="modalRef">
              <div class="alarmDetail-modal-header" onMousedown={startDrag}>
                <div class="header-title"> {infoData.name}</div>
                <div class="flex-between">
                  <div class="header-close" onClick={backModal}>
                    {" "}
                    <fullscreen-exit-outlined />
                  </div>
                  <div class="header-close" onClick={closeModal}>
                    {" "}
                    <CloseOutlined />
                  </div>
                </div>
              </div>
              <div class="alarmDetail-modal-content flex-column">
                <div class="content-tabs">
                  {tabsList.map((item) => (
                    <div key={item} class="active">
                      {" "}
                      <div> {item}</div>
                    </div>
                  ))}
                </div>
                <div class="conent-body">
                  <div style="width: 40%">
                    <div class="info-name">
                      设备编码:
                      <span> {stallData.code || "--"}</span>
                    </div>
                    <div class="info-name">
                      档主名称:
                      <span> {stallData.masterName || "--"}</span>
                    </div>
                    <div class="info-name">
                      档位类型:
                      <span> {stallData.typeName || "--"}</span>
                    </div>
                    <div class="info-name">
                      具体位置:
                      <span> {stallData.location || "--"}</span>
                    </div>
                    <div class="info-name">
                      实用面积:
                      <span>{stallData.practicalArea}㎡</span>
                    </div>
                    <div class="info-name">
                      出租属性:
                      <span> {stallData.leaseType ? "可租" : "不可租"}</span>
                    </div>
                    <div class="info-name" title={stallData.remark || ""}>
                      备注说明:
                      <span> {stallData.remark || "--"}</span>
                    </div>
                  </div>
                  <div style="width: 40%">
                    <div class="info-name" title={stallData.name || ""}>
                      档位名称:
                      <span> {stallData.name || "--"}</span>
                    </div>
                    <div class="info-name">
                      档主联系方式:
                      <span> {stallData.masterPhone || "--"}</span>
                    </div>
                    <div class="info-name">
                      所在区域:
                      <span> {stallData.areaNames.toString() || "--"}</span>
                    </div>
                    <div class="info-name">
                      建筑面积:
                      <span>{stallData.builtUpArea || "--"}㎡</span>
                    </div>
                    <div class="info-name">
                      所属部门:
                      <span> {stallData.deptNames.toString()}</span>
                    </div>
                    <div class="info-name">
                      档位状态:
                      <span> {stallData.enabled ? "启用" : "禁用"}</span>
                    </div>
                    <div class="info-name">
                      附件:
                      {stallData.files.map((item) => (
                        <a-image key={item.id} src={item.path} alt />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Teleport>
      </>
    );
  },
});

export default StallModel;
