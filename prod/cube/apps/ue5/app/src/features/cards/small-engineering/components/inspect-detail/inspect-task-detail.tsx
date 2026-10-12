import { CloseOutlined } from "@ant-design/icons-vue";
import dayjs from "dayjs";
import { defineComponent } from "vue";
import { onMounted, reactive, watch, onUnmounted, ref } from "vue";

import { inspectTaskDetail, inspectTaskDetailRate } from "@/infrastructure/api/maintain";

import styles from "./inspect-task-detail.module.less";

export const InspectTaskDetail = defineComponent({
  name: "InspectTaskDetail",
  props: {
    title: { type: String, required: false },
    parameter: { type: Object, required: true },
  },
  emits: ["close"],
  setup(props, { emit }) {
    interface Props {
      title?: string;
      parameter: Record<string, any>;
    }
    const datainfo = reactive<Record<string, any>>({
      id: props.parameter.id,
      marketTenant: props.parameter.marketTenant,
      marketName: props.parameter.marketName || props.parameter.name,
      authInfo: null,
    });
    const loadingDataSource = ref(false);
    const table_header = ["巡检对象名称", "巡检对象类", "状态", "巡检项", "巡检结果", "执行人"];
    const formState = ref({
      name: "",
      planName: "",
      publisherName: "",
      typeName: "",
      level: "",
      receiveNames: "",
      updateTime: "",
      validEndTime: "",
      status: "",
    });
    const recordTaskResultList = ref([]);
    const taskStatus = {
      SPLIT: "待拆解",
      ACCEPT: "待接收",
      EXECUTING: "进行中",
      OVER: "已完成",
      EXPIRE: "已过期",
      STOP: "已终止",
      CONFIRM: "待确认",
      OVERTIME: "超时完成",
    };
    const resultType = {
      ABNORMAL: "异常",
      NORMAL: "正常",
    };
    const targetCategoryType = {
      DEVICE: "设备",
      STALL: "档位",
      PROPERTY: " 资产",
      SITE_POINT: "现场点",
      RISK_SOURCE: "风险源",
      SMALL_ENGINEERING: "小散工程",
    };
    watch(
      () => props.parameter,
      async () => {
        datainfo.marketTenant = props.parameter.marketTenant;
        datainfo.id = props.parameter.id;
        datainfo.businessType = props.parameter.businessType;
        Object.assign(datainfo, props.parameter);
      },
      { deep: true, immediate: true },
    );
    const closeModal = () => {
      emit("close");
    };
    const getData = async () => {
      const params = {
        id: props.parameter.id,
        businessType: props.parameter.businessType,
      };
      loadingDataSource.value = true;
      formState.value = await inspectTaskDetail(params);
      const res = await inspectTaskDetailRate(params);
      recordTaskResultList.value = res.recordTaskResultList.map((item) => {
        return {
          ...item,
          status: taskStatus[item.status],
          result: resultType[item.result] || "--",
          targetCategory: targetCategoryType[item.targetCategory] || "--",
        };
      });
      loadingDataSource.value = false;
    };
    onMounted(() => {
      const el = document.getElementById("inspectDetail");
      document.body.appendChild(el);
      getData();
    });

    return (): JSX.Element => (
      <>
        <div id="inspectDetail">
          <div class="alarmDetail-modal">
            <div class="alarmDetail-modal-header">
              <div class="header-title">
                <IconFont type="icon-offline" style={{ fontSize: "24px", color: "rgba(41, 137, 255, 1)" }} />
                <span> 巡检任务详情</span>
              </div>
              <div style="display: flex;">
                {" "}
                <div class="header-close">
                  {" "}
                  <CloseOutlined onClick={closeModal} />
                </div>
              </div>
            </div>
            <a-spin spinning={loadingDataSource.value}>
              <div class="alarmDetail-modal-content flex-column">
                <div class="conent-body" style="padding-bottom: 10px;overflow-y: auto;">
                  <div class="alarmDetail-info">
                    <div class="info-item">
                      <div class="info-item-title">
                        <div class="title-icon"></div>
                        <div class="title-text"> 基本信息</div>
                      </div>
                      <div class="info-item-form">
                        <div class="form-item">
                          <div class="form-item-label"> 任务名称:</div>
                          <div class="form-item-content"> {formState?.name || "--"}</div>
                        </div>
                        <div class="form-item">
                          <div class="form-item-label"> 所属计划:</div>
                          <div class="form-item-content"> {formState?.planName || "--"}</div>
                        </div>
                        <div class="form-item">
                          <div class="form-item-label"> 发布人:</div>
                          <div class="form-item-content"> {formState?.publisherName || "--"}</div>
                        </div>
                        <div class="form-item">
                          <div class="form-item-label"> 巡查类型:</div>
                          <div class="form-item-content"> {formState?.typeName || "--"}</div>
                        </div>
                        <div class="form-item">
                          <div class="form-item-label"> 巡检级别:</div>
                          <div class="form-item-content"> {formState.level === "GENERAL" ? "紧急" : "普通 "}</div>
                        </div>
                        <div class="form-item">
                          <div class="form-item-label"> 执行人:</div>
                          <div class="form-item-content"> {formState?.receiveNames || "--"}</div>
                        </div>
                        <div class="form-item">
                          <div class="form-item-label"> 发布时间:</div>
                          <div class="form-item-content">
                            {" "}
                            {formState.updateTime ? dayjs(formState.updateTime).format("YYYY-MM-DD HH:mm:ss") : "--"}
                          </div>
                        </div>
                        <div class="form-item">
                          <div class="form-item-label"> 截止时间:</div>
                          <div class="form-item-content">
                            {" "}
                            {formState.validEndTime ? dayjs(formState.validEndTime).format("YYYY-MM-DD HH:mm:ss") : "--"}
                          </div>
                        </div>
                        <div class="form-item">
                          <div class="form-item-label"> 任务状态:</div>
                          <div class="form-item-content"> {taskStatus[formState?.status] || "--"}</div>
                        </div>
                      </div>
                    </div>
                    <div class="info-item">
                      <div class="info-item-title">
                        <div class="title-icon"></div>
                        <div class="title-text"> 执行进度</div>
                      </div>
                      <div class="table_header">
                        {table_header.map((item) => (
                          <div> {item}</div>
                        ))}
                      </div>
                      <div class="table_content">
                        {recordTaskResultList.map((item, index) => (
                          <div>
                            <div class="content">
                              <div> {item.targetName || "--"}</div>
                              <div> {item.targetCategory || "--"}</div>
                              <div> {item.status || "--"}</div>
                              <div> {item.itemName || "--"}</div>
                              <div> {item.result || "--"}</div>
                              <div> {item.nickname || "--"}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </a-spin>
          </div>
        </div>
      </>
    );
  },
});

export default InspectTaskDetail;
