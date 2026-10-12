<template>
  <g-layout :title="isLineLossDetail ? '预警详情' : '报警详情'">
    <template #content-table>
      <a-tabs v-model:activeKey="activeKey" @change="handleTabChange">
        <a-tab-pane key="baseInfo" tab="报警详情">
          <AlarmDetail :id="id" ref="detailFormRef" @detail-loaded="onAlarmDetailLoaded" />
        </a-tab-pane>
        <a-tab-pane key="linkageAction" tab="联动动作" v-if="!alarmStatus && !isLineLossDetail">
          <equipment-linkage v-model:isExecute="execute" :id="businessKeyId" @change="handleLinkageChange"></equipment-linkage>
          <linkage-record v-model:execute="execute" :id="businessKeyId" :refresh="timestamp"></linkage-record>
        </a-tab-pane>
        <a-tab-pane key="handelRecord" tab="处理记录">
          <handel-process></handel-process>
        </a-tab-pane>
        <a-tab-pane key="nearbyEquipment" v-if="alarmStatus !== 'LINE_LOSS_MANAGEMENT_EMERGENCY_ALARM' && !isLineLossDetail" tab="附近设备">
          <NearbyEquipment :id="id" />
        </a-tab-pane>
      </a-tabs>
    </template>
    <template #footer-page>
      <template v-if="!isLineLossDetail">
        <a-button
          v-if="
            permissions
              ? JSON.parse(permissions).includes('FOLLOW_UP') &&
                ['ALARM_PROGRESS_CONFIRMED', 'ALARM_SUSPEND'].includes(dataInfo.alarmStatus)
              : ['ALARM_PROGRESS_CONFIRMED', 'ALARM_SUSPEND'].includes(dataInfo.alarmStatus)
          "
          @click="handleFollowUpRecords"
        >
          跟进记录
        </a-button>
        <a-popconfirm title="再次推送该报警？" @confirm="handleRepeatPush">
          <a-button v-if="permissions ? JSON.parse(permissions).includes('PUSH_AGAIN') : true">再次推送</a-button>
        </a-popconfirm>
      </template>
      <a-button
        @click="suspend"
        v-if="
          permissions
            ? JSON.parse(permissions).includes('PENDING') && dataInfo.alarmStatus == 'ALARM_PROGRESS_CONFIRMED'
            : dataInfo.alarmStatus == 'ALARM_PROGRESS_CONFIRMED'
        "
      >
        挂起
      </a-button>
      <a-button
        @click="transfer"
        v-if="
          permissions
            ? JSON.parse(permissions).includes('ASSIGN') &&
              (dataInfo.alarmStatus == 'ALARM_UN_CONFIRMED' || dataInfo.alarmStatus == 'ALARM_PROGRESS_CONFIRMED')
            : dataInfo.alarmStatus == 'ALARM_UN_CONFIRMED' || dataInfo.alarmStatus == 'ALARM_PROGRESS_CONFIRMED'
        "
      >
        指派
      </a-button>
      <a-button
        @click="openHandle"
        v-if="
          dataInfo?.alarmStatus === 'ALARM_PROGRESS_CONFIRMED' ||
          dataInfo?.alarmStatus === 'ALARM_SUSPEND' ||
          dataInfo?.alarmStatus === 'ALARM_UN_CONFIRMED'
        "
      >
        处理
      </a-button>
      <a-button @click="goBack">返回</a-button>
    </template>
  </g-layout>
  <handel-suspend ref="handelSuspendModal" :width="560" @modal-save="saveSuspend"></handel-suspend>
  <HandleResult
    ref="handelResultModal"
    :confirmLoading="confirmHandleLoading"
    :applicationCode="handleResultApplicationCode"
    :width="560"
    @modal-save="saveHandel"
  />
  <follow-up-records
    ref="followUpRecordsRef"
    :confirmLoading="followUpLoading"
    :width="560"
    @modal-save="saveFollowUpRecords"
  ></follow-up-records>
  <a-modal centered width="800px" v-model:visible="userInfoModal.visible" title="用户详情" :footer="null">
    <div class="user-info">
      <a-form layout="inline">
        <a-form-item label="姓名">
          {{ userInfoModal.userInfo.name }}
        </a-form-item>
        <a-form-item label="联系电话">
          {{ userInfoModal.userInfo.mobile }}
        </a-form-item>
        <a-form-item label="性别">
          {{ genderObj[userInfoModal.userInfo.gender] ?? "--" }}
        </a-form-item>
        <a-form-item label="所属部门">
          {{ userInfoModal.userInfo.organizations[0] ? userInfoModal.userInfo.organizations[0].name : "--" }}
        </a-form-item>
        <a-form-item label="职位">
          {{ userInfoModal.userInfo.positions[0] ? userInfoModal.userInfo.positions[0].name : "--" }}
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
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
import moment from "moment";
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import alarmData from "./components/alarm-data.vue";
import AlarmDetail from "./components/alarm-detail.vue";
import alarmMonitor from "./components/alarm-monitor.vue";
import equipmentLinkage from "./components/equipmentLinkage.vue";
import FollowUpRecords from "./components/follow-up-records.vue";
import handelProcess from "./components/handelProcess.vue";
import handelSuspend from "./components/handelSuspend.vue";
import HandleResult from "./components/handleResult.vue";
import linkageRecord from "./components/linkageRecord.vue";
import NearbyEquipment from "./components/nearby-equipment.vue";
import videoLinkage from "./components/videoLinkage.vue";
import { cubeOuaaService, cubeAlarmCenterService } from "@/api/service";
import collapse from "@/components/collapse.vue";
import { LINE_LOSS_ALARM_TYPE_CODE } from "@/utils/enumerate";

export default defineComponent({
  components: {
    handelSuspend,
    HandleResult,
    videoLinkage,
    equipmentLinkage,
    linkageRecord,
    alarmData,
    handelProcess,
    collapse,
    FollowUpRecords,
    alarmMonitor,
    NearbyEquipment,
    AlarmDetail,
  },
  setup() {
    const genderObj = {
      NONE: "保密",
      MALE: "男",
      FEMALE: "女",
    };
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const handelSuspendModal = ref(null);
    const handelResultModal = ref(null);
    const detailFormRef = ref(null);
    const followUpRecordsRef = ref(null);
    const { id, businessKey, alarmStatus, permissions, activeTab } = route.query;
    const businessKeyId = ref("");
    const dataInfo = ref("");
    const detailAlarmTypeCode = ref(null);
    const onAlarmDetailLoaded = (payload) => {
      detailAlarmTypeCode.value = payload?.alarmTypeCode ?? "";
      dataInfo.value = payload;
      businessKeyId.value = payload?.businessKey ?? "";
    };
    const isLineLossDetail = computed(() => detailAlarmTypeCode.value === LINE_LOSS_ALARM_TYPE_CODE);
    const handleResultApplicationCode = computed(() => {
      const fromDetail = dataInfo.value?.applicationCode;
      if (fromDetail) {
        return fromDetail;
      }
      try {
        const raw = sessionStorage.getItem("GH-currentApplication");
        return raw ? (JSON.parse(raw).code ?? "") : "";
      } catch {
        return "";
      }
    });
    const usePersonalColumns = () => {
      const feature = window.config.feature;
      const usePersonal = feature ? Boolean(feature.usePersonal) : false;
      const personalColumns = [
        {
          title: "性别",
          followUpLoading: false,
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
              MALE: "男",
              FEMALE: "女",
              NONE: "保密",
            };
            return text ? genderValues[text] : "--";
          },
        },
      ];
      return usePersonal ? personalColumns : ouaaColumns;
    };

    const usePersonalSearch = () => {
      const feature = window.config.feature;
      const usePersonal = feature ? Boolean(feature.usePersonal) : false;
      return usePersonal
        ? [
            {
              label: "是否在岗",
              value: "workStatus",
              component: "g-select",
              options: [
                { label: "是", value: "WORKING" },
                { label: "否", value: "REST" },
              ],
            },
          ]
        : [];
    };
    const saveFollowUpRecords = async (formState) => {
      try {
        state.followUpLoading = true;
        const params = {
          id,
          ...formState,
          files: formState.files.map((item) => item.id),
        };
        await cubeAlarmCenterService.createAlarmFollow(params);
        followUpRecordsRef.value.cancel();
        detailFormRef.value.getData();
        getAlarmEventOperates();
        proxy.$message.success("提交成功");
      } catch (error) {
        const { errorMessage } = error.toJSON();
        proxy.$message.error(errorMessage || "请求失败");
      } finally {
        state.followUpLoading = false;
      }
    };
    const handleFollowUpRecords = () => {
      followUpRecordsRef.value.visible = true;
    };
    const formateTime = (time) => {
      const h = parseInt(time / 3600);
      const minute = parseInt((time / 60) % 60);
      const second = Math.ceil(time % 60);

      const hours = h < 10 ? "0" + h : h;
      const formatSecond = second > 59 ? 59 : second;
      return `${hours > 0 ? `${hours}时` : ""}${minute < 10 ? "0" + minute : minute}分${formatSecond < 10 ? "0" + formatSecond : formatSecond}秒`;
    };
    const state = reactive({
      execute: false,
      timestamp: null,
      confirmHandleLoading: false,
      userInfoModal: {
        visible: false,
        userInfo: {
          gender: "",
          name: "",
          mobile: "",
          organizations: [
            {
              name: "",
            },
          ],
          positions: [
            {
              name: "",
            },
          ],
        },
      },
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
            dataIndex: "workStatus",
            key: "workStatus",
            customRender: ({ text }) => {
              return text == "WORKING" ? "是" : "否";
            },
          },
        ],
        search: [],
      },
      activeKey: activeTab ?? "baseInfo",
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
              label: "报警设备",
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
              slot: true,
              detailFun: (value) => {
                return "";
              },
            },
            {
              label: "报警通知人",
              value: "alarmNotifyUsername",
              slot: true,
              detailFun: (value) => {
                return "";
              },
            },
            {
              label: "超时状态",
              value: "alarmHandlerTimeoutStatusName",
            },
            {
              label: "处理状态",
              value: "alarmStatusName",
            },
            {
              label: "详细位置",
              value: "alarmTargetAddress",
            },
            {
              label: "任务耗时",
              value: "processingTime",
              detailFun: (value) => {
                if (!value) return "--";
                return formateTime(value);
              },
            },
          ],
        },
      ],
      api: {
        detail: "alarmRecordDetail",
      },
    });
    onMounted(() => {
      getAlarmEventOperates();
    });
    const afterGet = (res) => {
      let alarmTime = res.alarmTime ? moment(res.alarmTime).format("YYYY-MM-DD HH:mm:ss") : "--";
      state.alarmDetail = res;
      return { ...res, alarmTime };
    };
    const showResult = (status) => {
      return status === "ALARM_HANDLER" ? true : false;
    };
    // 获取处理结果
    const getAlarmEventOperates = () => {
      proxy.$api.alarmEventOperates({ id: id }).then((res) => {
        let result = res.find((item) => item.alarmStatusEvent == "PROCESSED");
        if (result) {
          let videoList = result.operationParam.fileVOS.filter((item) => item.type == "mp4" || item.type == "AVI" || item.type == "MKV");
          let imageList = result.operationParam.fileVOS.filter((item) => item.type !== "mp4" && item.type !== "AVI" && item.type !== "MKV");
          state.handelStatusDetail = { ...result, videoList, imageList };
        }
      });
    };
    const goBack = () => {
      // const urlSearchParams = new URLSearchParams(window.location.search);
      // const params = Object.fromEntries(urlSearchParams.entries());
      // const target = params.searchValue ? `/portal/genericEquipmentMonitor/alarmRecord?searchValue=${params.searchValue}` : `/portal/genericEquipmentMonitor/alarmRecord`
      // if (params.searchValue) {
      //   history.pushState(history.state, "", target)
      // } else {
      //   history.back()
      // }
      history.back();
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
            ...usePersonalSearch(),
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
                departmentId: usePersonal ? selectedItems[0].organizationId : selectedItems[0].organizations[0]?.id,
                departmentName: usePersonal ? selectedItems[0].organizationName : selectedItems[0].organizations[0]?.id,
              },
            ],
          })
          .then((res) => {
            proxy.$message.success("提交成功");
            state.modal.visible = false;
            detailFormRef.value.getData();
            getAlarmEventOperates();
          });
      }
    };
    const saveSuspend = (form) => {
      proxy.$api.alarmHandelSuspend({ id: id, ...form }).then((res) => {
        proxy.$message.success("提交成功");
        handelSuspendModal.value.cancel();
        detailFormRef.value.getData();
        getAlarmEventOperates();
      });
    };
    const handleRepeatPush = async () => {
      await proxy.$api.repeatPushAlarm(businessKey);
      proxy.$message.success("操作成功");
    };
    const suspend = (record) => {
      handelSuspendModal.value.visible = true;
    };
    const openHandle = () => {
      if (handelResultModal.value) {
        handelResultModal.value.visible = true;
      }
    };
    const saveHandel = async (form) => {
      try {
        state.confirmHandleLoading = true;
        await proxy.$api.alarmHandelResult({ id, ...form });
        proxy.$message.success("提交成功");
        handelResultModal.value.cancel();
        detailFormRef.value.getData();
        getAlarmEventOperates();
      } finally {
        state.confirmHandleLoading = false;
      }
    };
    const handleLinkageChange = () => {
      state.timestamp = Date.now();
    };
    const handleTabChange = (key) => {
      // 获取当前URL
      const url = new URL(window.location.href);

      // 获取URL的查询参数
      const params = new URLSearchParams(url.search);

      // 添加新的参数
      params.set("activeTab", key);

      // 更新URL的查询参数
      url.search = params.toString();

      // 更新浏览器的URL（不刷新页面）
      window.history.pushState({}, "", url.toString());
    };
    return {
      suspend,
      saveSuspend,
      detailFormRef,
      handleFollowUpRecords,
      saveFollowUpRecords,
      handleRepeatPush,
      followUpRecordsRef,
      handelSuspendModal,
      handelResultModal,
      openHandle,
      saveHandel,
      handleResultApplicationCode,
      genderObj,
      chengUser,
      transfer,
      ...toRefs(state),
      goBack,
      afterGet,
      showResult,
      moment: moment,
      businessKeyId,
      dataInfo,
      permissions,
      isLineLossDetail,
      onAlarmDetailLoaded,
      id,
      handleTabChange,
      handleLinkageChange,
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

.user-info {
  :deep(.ant-form-inline .ant-form-item) {
    width: 33%;
    margin-right: 0;
    margin-bottom: 16px;
  }
}

.handel-content {
  padding: 0 32px;
  margin-bottom: 16px;
}

:deep(.ant-image) {
  margin-bottom: 0 !important;
}

:deep(.ant-tabs-tabpane) {
  overflow-x: hidden;
}
:deep(.ant-tabs-tab) {
  margin: 0 !important;
}

:deep(.ant-tabs-tabpane-active) {
  padding: 10px 0;
  overflow-y: auto;
}

:deep(.detail-form) {
  height: unset !important;
  overflow: unset !important;
  width: 100%;
}

:deep(.ant-tabs-top-bar) {
  margin-bottom: 0;
}
</style>
