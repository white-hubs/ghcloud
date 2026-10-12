import { CloseOutlined, FullscreenExitOutlined } from "@ant-design/icons-vue";
import { Popover } from "ant-design-vue";
import dayjs from "dayjs";
import { defineComponent } from "vue";
import { ref, reactive, onMounted, h } from "vue";

import { organizationsList } from "@/infrastructure/api/ouaa";
import { getCodePropertyDetailed, getPropertyDetailed, getPropertyHistoryList } from "@/infrastructure/api/property";
import { getAssetsImage } from "@/infrastructure/utils/getImage";

import styles from "./property-model.module.less";

export const PropertyModel = defineComponent({
  name: "PropertyModel",
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
    const tabsList = ref(["基本信息", "资产履历"]);
    const activeTabs = ref("基本信息");
    const dataSource = ref([]);
    const deptOptions = ref([]);
    const handleTypeOptions = [
      { label: "资产入库", value: "DEPOSITORY" },
      { label: "资产派发", value: "DISTRIBUTION" },
      { label: "资产调拨", value: "OUTBOUND" },
      { label: "资产报废", value: "WEED_OUT" },
    ];
    const pagination = ref({
      pageSize: 5,
      pageNumber: 1,
      total: 0,
    });
    const formState = reactive<{
      departmentId: string | undefined;
      handleTime: string;
      handleType: string | undefined;
    }>({
      departmentId: undefined,
      handleTime: "",
      handleType: undefined,
    });
    const columns = [
      {
        title: "序号",
        align: "center",
        customRender: ({ index }) => `${index + 1}`,
      },
      {
        title: "处理日期",
        dataIndex: "handleTime",
        ellipsis: true,
        customRender: ({ text }) => {
          text = text ? dayjs(text).format("YYYY-MM-DD") : "--";
          return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
        },
      },
      {
        title: "处理方式",
        dataIndex: "handleTypeName",
        ellipsis: true,
        customRender: ({ text }) => {
          return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
        },
      },
      {
        title: "处理人",
        dataIndex: "createByName",
        ellipsis: true,
        customRender: ({ text }) => {
          return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
        },
      },
      {
        title: "处理内容",
        dataIndex: "remarks",
        ellipsis: true,
        customRender: ({ text }) => {
          return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
        },
      },
    ];
    const propertyData = ref({
      serialNumber: "",
      typeName: "",
      usageTime: "",
      number: "",
      maintenanceDepName: "",
      name: "",
      area: [{ name: "" }],
      startTime: "",
      unit: "",
      receiveUserName: "",
    });
    const infoData = ref({
      name: "资产信息",
    });
    const backModal = () => {
      emit("close", false);
    };
    const closeModal = () => {
      emit("close", true);
    };
    const getPropertyDetail = async () => {
      if (props.id) {
        propertyData.value = await getPropertyDetailed(props.id);
        getTableData();
      } else if (props.code) {
        propertyData.value = await getCodePropertyDetailed(props.code);
      }
    };
    const pageChange = (pageNumber: number, pageSize: number) => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      getTableData();
    };
    const getDepList = async () => {
      deptOptions.value = await organizationsList();
    };
    const getTableData = async () => {
      const params = {
        pageNumber: pagination.value.pageNumber,
        pageSize: pagination.value.pageSize,
        id: props.id,
        ...formState,
      };
      const { records, total } = await getPropertyHistoryList(params);
      dataSource.value = records;
      pagination.value.total = total;
    };
    const reset = () => {
      formState.departmentId = undefined;
      formState.handleType = undefined;
      formState.handleTime = "";
      queryForm();
    };
    const queryForm = () => {
      pagination.value.pageNumber = 1;
      getTableData();
    };
    onMounted(() => {
      getDepList();
      getPropertyDetail();
    });

    return (): JSX.Element => (
      <>
        <div class="alarmDetail-wrap">
          <div class="alarmDetail-modal">
            <div class="alarmDetail-modal-header">
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
                  <div
                    key={item}
                    class={item === activeTabs ? "active" : ""}
                    onClick={() => {
                      activeTabs.value = item;
                    }}
                  >
                    {" "}
                    <div> {item}</div>
                  </div>
                ))}
              </div>
              <div class="conent-body">
                {activeTabs === "基本信息" && (
                  <div class="info-content">
                    <div class="info-img">
                      <a-image width="100%" height="100%" src={getAssetsImage("overView45.png")}></a-image>
                    </div>
                    <div style="width: 28%">
                      <div class="info-name">
                        资产编码:
                        <span> {propertyData.serialNumber || "--"}</span>
                      </div>
                      <div class="info-name">
                        资产类别:
                        <span> {propertyData.typeName || "--"}</span>
                      </div>
                      <div class="info-name">
                        使用期限:
                        <span> {propertyData.usageTime + "月" || "--"}</span>
                      </div>
                      <div class="info-name">
                        数量:
                        <span> {propertyData.number || "--"}</span>
                      </div>
                      <div class="info-name">
                        维护部门:
                        <span> {propertyData.maintenanceDepName}</span>
                      </div>
                    </div>
                    <div style="width: 50%">
                      <div class="info-name">
                        资产名称:
                        <span> {propertyData.name || "--"}</span>
                      </div>
                      <div class="info-name">
                        所在区域:
                        <span> {propertyData.area.map((e) => e.name).toString() || "--"}</span>
                      </div>
                      <div class="info-name">
                        入库日期:
                        <span> {propertyData.startTime ? dayjs(propertyData.startTime).format("YYYY-MM-DD") : "--"}</span>
                      </div>
                      <div class="info-name">
                        计量单位:
                        <span> {propertyData.unit || "--"}</span>
                      </div>
                      <div class="info-name">
                        管理员:
                        <span> {propertyData.receiveUserName}</span>
                      </div>
                    </div>
                  </div>
                )}
                {activeTabs === "资产履历" && (
                  <div>
                    <a-form layout="inline" model={formState}>
                      <a-form-item label="处理日期">
                        {" "}
                        <a-date-picker
                          style="width: 80px"
                          value={formState.handleTime}
                          onUpdate:value={(v) => {
                            formState.handleTime = v;
                          }}
                          value-format="YYYY-MM-DD"
                        />
                      </a-form-item>
                      <a-form-item label="处理人部门">
                        <a-select
                          value={formState.departmentId}
                          onUpdate:value={(v) => {
                            formState.departmentId = v;
                          }}
                          placeholder="请选择"
                          style="width: 80px"
                        >
                          {deptOptions.map((item) => (
                            <a-select-option key={item.id} value={item.id}>
                              {" "}
                              {item.name}
                            </a-select-option>
                          ))}
                        </a-select>
                      </a-form-item>
                      <a-form-item label="处理方式">
                        <a-select
                          value={formState.handleType}
                          onUpdate:value={(v) => {
                            formState.handleType = v;
                          }}
                          placeholder="请选择"
                          style="width: 80px"
                        >
                          {handleTypeOptions.map((item) => (
                            <a-select-option key={item.value} value={item.value}>
                              {" "}
                              {item.label}
                            </a-select-option>
                          ))}
                        </a-select>
                      </a-form-item>
                      <a-form-item>
                        {" "}
                        <a-button type="primary" onClick={queryForm}>
                          {" "}
                          查询
                        </a-button>
                      </a-form-item>
                      <a-form-item>
                        {" "}
                        <a-button type="primary" onClick={reset}>
                          {" "}
                          重置
                        </a-button>
                      </a-form-item>
                    </a-form>
                    <a-table style="margin-top: 6px" dataSource={dataSource.value} columns={columns} pagination={false} />
                    <div class="page">
                      {" "}
                      <a-pagination
                        current={pagination.pageNumber}
                        onUpdate:current={(v) => {
                          pagination.pageNumber = v;
                        }}
                        pageSize={pagination.pageSize}
                        onUpdate:pageSize={(v) => {
                          pagination.pageSize = v;
                        }}
                        total={pagination.total}
                        default-current={1}
                        show-total={(total: number) => `共 ${total} 条数据`}
                        onChange={pageChange}
                        show-size-changer={false}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  },
});

export default PropertyModel;
