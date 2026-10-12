import dayjs, { Dayjs } from "dayjs";
import { defineComponent } from "vue";
import { onMounted, reactive, ref, watch } from "vue";

import Modal from "@/features/equipment/modal-table/modal";
import { cubeElectricVehicleService } from "@/infrastructure/api/service";
import noData from "@/shared-ui/panel/noData";

import styles from "./electric-vehicle-ledger-model.module.less";

export const ElectricVehicleLedgerModel = defineComponent({
  name: "ElectricVehicleLedgerModel",
  props: {
    showModal: { type: Boolean, required: true, default: false },
    parameter: { type: null, required: true },
  },
  emits: ["close"],
  setup(props, { emit }) {
    interface Props {
      showModal: boolean;
      parameter: any;
    }
    const selectForm = ref();
    const carTypeOptions = [
      {
        label: "全部",
        value: "",
      },
      {
        label: "电动单车",
        value: "BICYCLE",
      },
      {
        label: "电动三轮车",
        value: "TRICYCLE",
      },
      {
        label: "电动四轮车",
        value: "FOUR_WHEELED",
      },
    ];
    const keyword = ref("");
    const queryScoped = ref("");
    const datainfo = reactive<Record<string, any>>({
      period: "",
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });

    const dataSource = ref([]);

    const loadingDataSource = ref(false);
    const table_header = ["名称", "分类", "规格型号", "品牌", "车牌号", "所在区域"];
    const onShowSizeChange = (current, size) => {
      datainfo.pageNumber = current;
      datainfo.pageSize = size;
      getData();
    };
    const getData = async () => {
      loadingDataSource.value = true;
      if (props.parameter.dateRange) {
        datainfo.period =
          dayjs(props.parameter.dateRange[0]).format("YYYY-MM-DD 00:00:00") +
          "," +
          dayjs(props.parameter.dateRange[1]).format("YYYY-MM-DD 23:59:59");
      } else {
        datainfo.period = "";
      }
      const res = await cubeElectricVehicleService.genElectronMobilePage({
        pageNumber: datainfo.pageNumber,
        pageSize: datainfo.pageSize,
        keyword: keyword.value,
        period: datainfo.period,
        electronMobileType: queryScoped.value,
      });
      dataSource.value = res.records;
      datainfo.total = res.total;

      loadingDataSource.value = false;
    };

    const reset = () => {
      datainfo.pageNumber = 1;
      keyword.value = "";
      queryScoped.value = "";
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
        }
      },
    );

    return (): JSX.Element => (
      <>
        <Modal title="电瓶车建档统计" show={props.showModal} onClose={closeModal} wrapClassName="modal-table-alarm">
          <div class="modal-layout">
            <div class="table-top">
              <a-form ref="selectForm" model={datainfo} layout="inline">
                <a-form-item label="名称">
                  {" "}
                  <a-input
                    placeholder="请输入名称"
                    value={keyword.value}
                    onUpdate:value={(v) => {
                      keyword.value = v;
                    }}
                  />
                </a-form-item>
                <a-form-item label="电瓶车分类">
                  <a-select
                    onChange={getData}
                    style="width: 100px"
                    value={queryScoped.value}
                    onUpdate:value={(v) => {
                      queryScoped.value = v;
                    }}
                  >
                    {carTypeOptions.map((item) => (
                      <a-select-option value={item.value}> {item.label}</a-select-option>
                    ))}
                  </a-select>
                </a-form-item>
                <a-form-item>
                  <a-button type="primary" size="small" onClick={getData} loading={loadingDataSource.value}>
                    {" "}
                    查询
                  </a-button>
                  <a-button size="small" style="margin-left: 15px" onClick={reset}>
                    {" "}
                    重置
                  </a-button>
                </a-form-item>
              </a-form>
            </div>
            <div style="margin-top: 15px">
              <div class="table_header">
                {table_header.map((item) => (
                  <div> {item}</div>
                ))}
              </div>
              <a-spin spinning={loadingDataSource.value}>
                <div class="table_content">
                  {dataSource.length === 0 && (
                    <div class="no-content">
                      {" "}
                      <noData />
                    </div>
                  )}
                  {dataSource.map((item) => (
                    <div>
                      <div class="content">
                        <div> {item.name || "--"}</div>
                        <div> {carTypeOptions.find((e) => e.value === item.electronMobileType).label || "--"}</div>
                        <div> {item.norms || "--"}</div>
                        <div> {item.brand || "--"}</div>
                        <div> {item.plateNumber || "--"}</div>
                        <div> {item.areaName || "--"}</div>
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

export default ElectricVehicleLedgerModel;
