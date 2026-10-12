import { computed, defineComponent } from "vue";
import { reactive, ref, watch } from "vue";

import Modal from "@/features/equipment/modal-table/modal";
import { renderPopoverText } from "@/features/equipment/modal-table/render-popover-text";
import { arrangePage } from "@/infrastructure/api/attendance";
import { getUserByWorkStatusPage } from "@/infrastructure/api/ouaa";
import NoData from "@/shared-ui/panel/noData";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "@/features/equipment/modal-table/modal-equipmentAll-table.module.less";

import styles from "./modal-user-table.module.less";

export const ModalUserTable = defineComponent({
  name: "ModalUserTable",
  props: {
    parameter: { type: null, required: false, default: {} },
    showModal: { type: Boolean, required: true, default: false },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const { currentTheme } = useVisualTheme();
    const modalWrapClassName = computed(
      () => `modal-table-alarm modal-table-device equipment-data-list-modal device-records-theme-${currentTheme.value}`,
    );
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
    });

    const dataSource = ref([]);
    const show = ref(false);

    const table_header = ["姓名", "手机号", "部门", "职位"];
    const onShowSizeChange = (current, size) => {
      datainfo.pageNumber = current;
      datainfo.pageSize = size;
      getData();
    };
    const getData = async () => {
      try {
        loading.value = true;
        const res = await arrangePage({ ...datainfo, ...props.parameter });
        dataSource.value = res.records;
        datainfo.total = res.total;
      } catch (error) {}
      loading.value = false;
    };

    const closeModal = () => {
      Object.assign(datainfo, {
        keyword: "",
        pageSize: 10,
        pageNumber: 1,
        total: 0,
      });
      emit("close");
    };
    watch(
      () => props.showModal,
      () => {
        if (props.showModal) {
          dataSource.value = [];
          getData();
        }
      },
    );

    return (): JSX.Element => (
      <>
        <Modal title="人员列表" show={props.showModal} onClose={closeModal} wrapClassName={modalWrapClassName.value}>
          <div class="modal-layout">
            <div style="margin-top: 15px">
              <div class="table_header">
                {table_header.map((item) => (
                  <div> {item}</div>
                ))}
              </div>
              <a-spin spinning={loading.value}>
                <div class="table_content">
                  {dataSource.length === 0 && (
                    <div class="no-content">
                      {" "}
                      <NoData />
                    </div>
                  )}
                  {dataSource.map((item) => (
                    <div>
                      <div class="content">
                        <div>{renderPopoverText(item.name)}</div>
                        <div>{renderPopoverText(item.mobile)}</div>
                        <div>{renderPopoverText(item.organizations ? item.organizations.map((e) => e.name).join("/") : "--")}</div>
                        <div>{renderPopoverText(item.positions ? item.positions.map((e) => e.name).join("/") : "--")}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </a-spin>
            </div>
            <div style="height: 30px">
              {" "}
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
              />
            </div>
          </div>
        </Modal>
      </>
    );
  },
});

export default ModalUserTable;
