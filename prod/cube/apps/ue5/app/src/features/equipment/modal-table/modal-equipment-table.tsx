import { message } from "ant-design-vue";
import { defineComponent } from "vue";
import { onMounted, reactive, ref, watch } from "vue";
import { onBeforeUnmount } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import Modal from "./modal";
import Equ from "@/features/equipment/equipmentdetails/index";
import { beginPanelZoomNestedHandoff, endPanelZoomNestedHandoff } from "@/features/panel-shell/charts/panel-zoom-session";
import { satalarmlevels } from "@/infrastructure/api/alarm";
import { getDeviceListBuyScene } from "@/infrastructure/api/device";
import NoData from "@/shared-ui/panel/noData";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./modal-equipment-table.module.less";

export const ModalEquipmentTable = defineComponent({
  name: "ModalEquipmentTable",
  props: {
    parameter: { type: null, required: false, default: {} },
    showModal: { type: Boolean, required: true, default: false },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const { globalState } = useStateStore();
    const ueClient = UeClient.getInstance();

    interface Props {
      parameter?: any;
      showModal: boolean;
    }
    const loading = ref(false);
    const selectForm = ref();
    const datainfo = reactive({
      keyword: "",
      pageSize: 10,
      pageNumber: 1,
      total: 0,
      sceneType: globalState.business.currentMenu,
      areaId: globalState.business.currentAreaId,
    });

    const dataSource = ref([]);
    const equid = ref("");
    const show = ref(false);
    let detailHandoffHeld = false;

    const detail = (item) => {
      equid.value = item.deviceId;
      if (!detailHandoffHeld) {
        beginPanelZoomNestedHandoff();
        detailHandoffHeld = true;
      }
      show.value = true;
    };

    const closeEquDetail = () => {
      show.value = false;
      if (!detailHandoffHeld) return;
      detailHandoffHeld = false;
      endPanelZoomNestedHandoff();
    };
    /**
     * 设备定位
     */
    const position = async (item) => {
      // 记录当前的视角
      await ueClient.saveNowViewPoint();
      // 全局查找属性匹配的目标
      ueClient.send("getActorById", { id: item.code }, function (res) {
        if (res.id) {
          closeModal();
          ueClient.send("focusActor", { id: res.id });
          ueClient.send("showShell", { id: res.id });
        } else {
          message.error("模型中未找到对应设备");
        }
      });
    };

    const level = ref([]);
    const table_header = ["设备编码", "设备名称", "设备品类", "部门名称", "所属区域", "操作"];

    const onShowSizeChange = (current, size) => {
      datainfo.pageNumber = current;
      datainfo.pageSize = size;
      getData();
    };
    const getTableData = async () => {
      level.value = await satalarmlevels();
    };
    const getData = async () => {
      try {
        loading.value = true;
        // let data = await cubeDeviceCenterService.getDeviceInstancePageAll({...datainfo,...props.parameter});
        let data = await getDeviceListBuyScene({ ...datainfo, ...props.parameter });
        dataSource.value = data.records.map((d) => ({
          code: d.code,
          name: d.name,
          productName: d.prodCategory.name,
          departmentName: d.department ? d.department.val : "--",
          areaName: d.area?.pathName,
          deviceId: d.id,
        }));
        datainfo.total = data.total;
      } catch (error) {
      } finally {
        loading.value = false;
      }
    };
    const query = () => {
      getData();
    };
    const reset = () => {
      Object.assign(datainfo, {
        ...props.parameter,
        keyword: "",
        pageSize: 10,
        pageNumber: 1,
        total: 0,
      });
      getData();
    };
    const closeModal = () => {
      emit("close");
    };
    watch(
      () => props.showModal,
      () => {
        if (props.showModal) {
          datainfo.pageNumber = 1;
          getData();
        } else if (detailHandoffHeld) {
          show.value = false;
          detailHandoffHeld = false;
          endPanelZoomNestedHandoff();
        }
      },
    );
    onMounted(() => {
      window.addEventListener("keydown", handleEsc);
      getTableData();
      getData();
    });
    // esc按键返回事件
    const handleEsc = (event) => {
      if (event.key !== "Escape") return;
      if (document.querySelector(".alarmDetail-modal")) {
        closeEquDetail();
        return;
      }
    };
    onBeforeUnmount(() => {
      window.removeEventListener("keydown", handleEsc);
      if (detailHandoffHeld) {
        detailHandoffHeld = false;
        endPanelZoomNestedHandoff();
      }
    });

    return (): JSX.Element => (
      <>
        <Modal title="设备列表" show={props.showModal && !show.value} onClose={closeModal} wrapClassName="modal-table-device">
          <div class="device-records-content">
            <div class="table-top">
              <a-form ref="selectForm" model={datainfo} layout="inline" class="device-filter-form">
                <a-form-item label="设备名称">
                  <a-input
                    class="device-filter-input"
                    value={datainfo.keyword}
                    onUpdate:value={(v) => {
                      datainfo.keyword = v;
                    }}
                    placeholder="请输入设备名称/设备编码"
                    allowClear
                  ></a-input>
                </a-form-item>
                <a-form-item class="device-filter-actions">
                  <a-button type="primary" size="middle" onClick={query} loading={loading.value}>
                    查询
                  </a-button>
                  <a-button size="middle" onClick={reset}>
                    重置
                  </a-button>
                </a-form-item>
              </a-form>
            </div>
            <div style="margin-top: 12px">
              <div class="table_header">
                {table_header.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>
              <a-spin spinning={loading.value}>
                <div class="table_content">
                  {dataSource.value.length === 0 && (
                    <div class="no-content">
                      <NoData />
                    </div>
                  )}
                  {dataSource.value.map((item) => (
                    <div key={item.deviceId}>
                      <div class="content">
                        <div>{item.code}</div>
                        <div>{item.name}</div>
                        <div>{item.productName}</div>
                        <div>{item.departmentName}</div>
                        <div>{item.areaName}</div>
                        <div>
                          <a
                            onClick={(e: MouseEvent) => {
                              e.preventDefault();
                              e.stopPropagation();
                              detail(item);
                            }}
                          >
                            详情
                          </a>
                          <a
                            onClick={(e: MouseEvent) => {
                              e.preventDefault();
                              e.stopPropagation();
                              void position(item);
                            }}
                          >
                            定位
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </a-spin>
            </div>
            <div style="height: 30px">
              <a-pagination
                style="float: right; margin-top: 15px"
                current={datainfo.pageNumber}
                onUpdate:current={(v) => {
                  datainfo.pageNumber = v;
                }}
                page-size={datainfo.pageSize}
                onUpdate:page-size={(v) => {
                  datainfo.pageSize = v;
                }}
                onChange={onShowSizeChange}
                total={datainfo.total}
                show-total={(total) => `总数 ${total}`}
              />
            </div>
          </div>
        </Modal>
        {show.value && (
          <Equ
            id={equid.value}
            onClose={() => {
              closeEquDetail();
            }}
            isequ={true}
          />
        )}
      </>
    );
  },
});

export default ModalEquipmentTable;
