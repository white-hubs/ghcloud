<template>
  <g-layout title="报警详情">
    <template #content-table>
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="baseInfo" tab="报警详情">
          <detail-form
            :formList="formList"
            :api="api"
            :afterGet="afterGet"
            @detile="detile"
          >
            <template #edit-item="{ record }">
              <video-linkage
                v-if="businessKeyId"
                :alarmStatus="record.alarmStatus"
                :id="businessKeyId"
              ></video-linkage>
              <div class="item-title">
                {{
                  record.alarmStatus == "ALARM_SUSPEND"
                    ? "报警挂起"
                    : record.alarmStatus == "ALARM_HANDLER"
                    ? "处理结果"
                    : ""
                }}
              </div>
              <div class="handel-content" v-if="showResoult(record.alarmStatus)">
                <a-row :gutter="[32, 16]">
                  <a-col :span="24">
                    处理结果：{{ record?.handler?.alarmHandlerResultName || "--" }}
                  </a-col>
                  <a-col :span="24">
                    处理说明:

                    {{ record?.handler?.alarmHandlerResultRemark || "--" }}
                  </a-col>
                  <a-col :span="24">
                    <span>现场图片：</span>
                    <a-image-preview-group v-if="record?.handler?.fileVOS?.length">
                      <a-image
                        v-for="item in record?.handler?.fileVOS"
                        :key="item.id"
                        :src="item.path"
                        :width="100"
                      ></a-image>
                    </a-image-preview-group>
                    <span v-else>--</span>
                  </a-col>
                  <a-col :span="24">
                    处理时间：{{
                      record?.handler?.createTime
                        ? moment(record?.handler?.createTime).format(
                            "YYYY-MM-DD HH:mm:ss"
                          )
                        : "--"
                    }}
                  </a-col>
                  <a-col :span="24">
                    <div style="display: flex">
                      <div>处理人员:</div>
                      <a-tooltip
                        placement="topLeft"
                        :title="record?.handler?.createUserName"
                      >
                        <div
                          style="
                            overflow: hidden;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            width: 200px;
                          "
                        >
                          {{ record?.handler?.createUserName }}
                        </div>
                      </a-tooltip>
                    </div>
                  </a-col>
                  <a-col :span="24">
                  </a-col>
                </a-row>
              </div>
              <div class="handel-content" v-if="record.alarmStatus == 'ALARM_SUSPEND'">
                <a-row :gutter="[32, 16]">
                  <a-col :span="24">
                    预计处理时间：{{
                      record?.suspend?.estimatedProcessTime == null
                        ? "--"
                        : record?.suspend?.estimatedProcessTime == ""
                        ? "--"
                        : moment(record?.suspend?.estimatedProcessTime).format(
                            "YYYY-MM-DD HH:mm:ss"
                          )
                    }}
                  </a-col>
                  <a-col :span="24">
                    挂起原因:
                    {{ record?.suspend?.remark || "--" }}
                  </a-col>
                  <a-col :span="24">
                    <span>现场图片：</span>
                    <a-image-preview-group v-if="record?.suspend?.fileVOS.length">
                      <a-image
                        v-for="item in record?.suspend?.fileVOS"
                        :key="item.id"
                        :src="item.path"
                        :width="100"
                      ></a-image>
                    </a-image-preview-group>
                    <span v-else>--</span>
                  </a-col>
                  <a-col :span="24">
                    挂起时间：
                    {{
                      record?.suspend?.createTime
                        ? moment(record?.suspend?.createTime).format(
                            "YYYY-MM-DD HH:mm:ss"
                          )
                        : "--"
                    }}
                  </a-col>
                  <a-col :span="24">
                    <div style="display: flex">
                      <div>操作挂起人员:</div>

                      <a-tooltip
                        placement="topLeft"
                        :title="record?.suspend?.createUserName"
                      >
                        <div
                          style="
                            overflow: hidden;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            width: 200px;
                          "
                        >
                          {{ record?.suspend?.createUserName }}
                        </div>
                      </a-tooltip>
                    </div>
                  </a-col>
                </a-row>
              </div>
            </template>
          </detail-form>
        </a-tab-pane>
        <a-tab-pane key="linkageAction" tab="联动动作">
          <equipment-linkage :id="businessKeyId" :headquarters="true"></equipment-linkage>
          <linkage-record :id="businessKeyId"></linkage-record>
        </a-tab-pane>
        <a-tab-pane key="handelRecord" tab="处理记录">
          <handel-process></handel-process>
        </a-tab-pane>
      </a-tabs>
    </template>
    <template #footer-page>
      <!-- <a-button @click="suspend" v-if="dataInfo.alarmStatus == 'ALARM_PROGRESS_CONFIRMED'">
        挂起
      </a-button>
      <a-button @click="transfer" v-if="
          dataInfo.alarmStatus == 'ALARM_UN_CONFIRMED' ||
          dataInfo.alarmStatus == 'ALARM_PROGRESS_CONFIRMED'
        ">
        指派
      </a-button> -->
      <a-button @click="goBack">返回</a-button>
    </template>
  </g-layout>
  <handel-suspend
    ref="handelSuspendModal"
    :width="560"
    @modal-save="saveSuspend"
  ></handel-suspend>
  <modal-table
    title="选择人员"
    url="tenantUserList"
    :columns="modal.columns"
    :search="modal.search"
    :searchLength="3"
    :width="1300"
    @modal-save="chengUser"
    v-model:value="modal.visible"
  ></modal-table>
</template>

<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  ref,
  onBeforeUnmount,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import moment from "moment";
import handelSuspend from "./components/handelSuspend.vue";
import videoLinkage from "./components/videoLinkage.vue";
import equipmentLinkage from "./components/equipmentLinkage.vue";
import linkageRecord from "./components/linkageRecord.vue";
import handelProcess from "./components/handelProcess.vue";
import detailForm from './detail-form.vue'
export default defineComponent({
  components: {
    detailForm,
    handelSuspend,
    videoLinkage,
    equipmentLinkage,
    linkageRecord,
    handelProcess,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const handelSuspendModal = ref(null);
    const { id, businessKey, alarmStatus } = route.query;

    onBeforeUnmount(() => {
      sessionStorage.removeItem("markettoken");
      sessionStorage.removeItem("marketurl");
      sessionStorage.removeItem("marketenant");
    });
    const usePersonalColumns = () => {
      const feature = window.config.feature;
      const usePersonal = feature ? Boolean(feature.usePersonal) : false;
      const personalColumns = [
        {
          title: "性别",
          dataIndex: "gender",
          key: "gender",
          slots: {
            customRender: "gender",
          },
          customRender: ({ text }) => {
            return text || "--";
          },
        },
        {
          title: "岗位",
          dataIndex: "postNames",
          key: "postNames",
          customRender: ({ text }) => {
            return text == "" ? "--" : text;
          },
        },
      ];
      const ouaaColumns = [
        {
          title: "性别",
          dataIndex: "gender",
          key: "gender",
          slots: {
            customRender: "gender",
          },
          customRender: ({ text }) => {
            const genderValues = {
              MALE: '男',
              FEMALE: '女',
              NONE: '保密'
            }
            return text ? genderValues[text] : '--';
          },
        },
      ];
      return usePersonal ? personalColumns : ouaaColumns;
    };
    const state = reactive({
      modal: {
        visible: false,
        url: "",
        columns: [
          {
            title: "名称",
            dataIndex: "name",
            key: "name",
          },
          {
            title: "联系电话",
            dataIndex: "mobile",
            key: "mobile",
          },
          ...usePersonalColumns(),
          {
            title: "是否在岗",
            dataIndex: "onDuty",
            key: "onDuty",
            customRender: ({ text }) => {
              return text ? "是" : "否";
            },
          },
        ],
        search: [],
      },
      activeKey: "baseInfo",
      alarmDetail: {},
      handelStatusDetail: {},
      formList: [
        {
          title: "报警信息",
          form: [
            {
              label: "报警时间",
              value: "alarmTime",
            },
           
            {
              label: "报警中设备",
              value: "alarmTargetName",
            },
            {
              label: "报警级别",
              value: "alarmLevelName",
            },
            {
              label: "报警规则",
              value: "alarmEventName",
            },
            {
              label: "报警区域",
              value: "areaName",
            },
            {
              label: "处理时限",
              value: "timeoutProcessTimesName",
            },
            {
              label: "处理人",
              value: "alarmHandlerName",
            },
            {
              label: "报警通知人",
              value: "alarmNotifyUsername",
            },
            {
              label: "超时状态",
              value: "alarmHandlerTimeoutStatusName",
            },
            {
              label: "处理状态",
              value: "alarmStatusName",
            },
          ],
        },
      ],
      api: {
        detail: "alarmRecordDetail",
      },
    });
    onMounted(() => {
      // 58197260

      getAlarmEventOperates();
    });
    const afterGet = (res) => {
      let alarmTime = res.alarmTime
        ? moment(res.alarmTime).format("YYYY-MM-DD HH:mm:ss")
        : "--";
      state.alarmDetail = res;
      return { ...res, alarmTime };
    };
    const showResoult = (status) => {
      return status == "ALARM_HANDLER" ? true : false;
    };
    // 获取处理结果
    const getAlarmEventOperates = () => {
      proxy.$api.alarmEventOperates({ id: id }).then((res) => {
        let result = res.find((item) => item.alarmStatusEvent == "PROCESSED");
        if (result) {
          let videoList = result.operationParam.fileVOS.filter(
            (item) => item.type == "mp4" || item.type == "AVI" || item.type == "MKV"
          );
          let imageList = result.operationParam.fileVOS.filter(
            (item) => item.type !== "mp4" && item.type !== "AVI" && item.type !== "MKV"
          );
          state.handelStatusDetail = { ...result, videoList, imageList };
        }
      });
    };
    const goBack = () => {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());
      const target = params.searchValue
        ? `/portal/genericEquipmentMonitor/alarmRecordSafety?searchValue=${params.searchValue}`
        : `/portal/genericEquipmentMonitor/alarmRecordSafety`;
      if (params.searchValue) {
        history.pushState(history.state, "", target);
      } else {
        history.back()
      }
    };
    let businessKeyId = ref("");
    let dataInfo = ref("");
    const detile = (res) => {
      businessKeyId.value = res.businessKey;
      dataInfo.value = res;
    };
    const transfer = () => {
      proxy.$api.positionList().then((resdata) => {
        proxy.$api.getOrganizations().then((res) => {
          state.modal.search = [
            {
              label: "岗位",
              value: "postId",
              component: "g-select",
              options: resdata.map((pos) => {
                return {
                  label: pos.name,
                  value: pos.id,
                };
              }),
              field: { value: "value", label: "label" },
            },
            {
              label: "部门",
              value: "organizationId",
              component: "g-select",
              options: res.map((data) => {
                data.label = data.name;
                data.value = data.id;
                return data;
              }),
            },
            {
              label: "是否在岗",
              value: "onDuty",
              component: "g-select",
              options: [
                { label: "是", value: true },
                { label: "否", value: false },
              ],
            },
            {
              label: "",
              value: "keyword",
              placeholder: "请输入人员名称",
            },
          ];

          state.modal.visible = true;
        });
      });
    };
    const chengUser = (selectedKeys, selectedItems) => {
      if (selectedKeys.length) {
        const feature = window.config.feature;
        const usePersonal = feature ? Boolean(feature.usePersonal) : false;
        proxy.$api
          .alarmHandelAssign({
            id: id,
            assignUsers: [
              {
                userId: usePersonal ? selectedItems[0].userId : selectedItems[0].id,
                userName: selectedItems[0].name,
                departmentId: usePersonal
                  ? selectedItems[0].organizationId
                  : selectedItems[0].organizations[0]?.id,
                departmentName: usePersonal
                  ? selectedItems[0].organizationName
                  : selectedItems[0].organizations[0]?.id,
              },
            ],
          })
          .then((res) => {
            proxy.$message.success("提交成功");
            state.modal.visible = false;
            tableData.value.getData();
          });
      }
    };
    const saveSuspend = (form) => {
      proxy.$api.alarmHandelSuspend({ id: id, ...form }).then((res) => {
        proxy.$message.success("提交成功");
        handelSuspendModal.value.cancel();
        tableData.value.getData();
      });
    };
    const suspend = (record) => {
      handelSuspendModal.value.visible = true;
    };
    return {
      suspend,
      saveSuspend,
      handelSuspendModal,
      chengUser,
      transfer,
      ...toRefs(state),
      goBack,
      afterGet,
      showResoult,
      moment: moment,
      businessKeyId,
      detile,
      dataInfo,
    };
  },
});
</script>

<style lang="less" scoped>
.item-title {
  width: 100%;
  height: auto !important;
  text-align: left;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #000000d9;
  border-top: 1px solid #e8e8e88c;
  padding-top: 16px !important;
  font-family: "PingFang SC-Medium";
}

.handel-content {
  padding: 0 32px;
  margin-bottom: 16px;
}

:deep(.ant-image) {
  margin-bottom: 0 !important;
}
</style>
