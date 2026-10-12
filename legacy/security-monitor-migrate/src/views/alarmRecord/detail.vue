<template>
  <g-layout title="报警详情">
    <template #content-table>
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="baseInfo" tab="报警详情">
          <g-detail-form :formList="formList" :api="api" :afterGet="afterGet" @detile="detile">
            <template #alarmNotifyUsername="{ record }">
              <collapse :value="record.alarmNotifyUsername">
                <a @click="handleClickUser(item.userId)" v-for="item in record.alarmNotifyUsers" :key="item.id"> {{
                  item.userName
                  }} <span v-if="item != record.alarmNotifyUsers[record.alarmNotifyUsers.length - 1]">,</span> </a>
              </collapse>
            </template>
            <template #alarmHandlerName="{ record }">
              <a @click="handleClickUser(record.alarmHandlerBy)" v-if="record.alarmHandlerName"> {{
                record.alarmHandlerName }} </a>
              <span v-else>--</span>
            </template>
            <template #edit-item="{ record }">
              <alarm-data v-if="businessKeyId" :alarmInfo="dataInfo"></alarm-data>
              <video-linkage v-if="businessKeyId" :alarmStatus="record.alarmStatus" :id="businessKeyId"></video-linkage>
              <alarm-monitor v-if="businessKeyId && record.alarmStatus !== 'ALARM_HANDLER'"
                :alarmStatus="record.alarmStatus" :id="businessKeyId"></alarm-monitor>
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
                    处理结果：{{
                    record?.handler?.alarmHandlerResultName || "--"
                    }}
                  </a-col>
                  <a-col :span="24">
                    报警原因：{{
                    record?.handler?.recordHandlerReason?.alarmReason || "--"
                    }}
                  </a-col>
                  <a-col :span="24">
                    处理说明:

                    {{ record?.handler?.alarmHandlerResultRemark || "--" }}
                  </a-col>
                  <a-col :span="24">
                    <span>现场图片：</span>
                    <a-image-preview-group v-if="record?.handler?.fileVOS?.length">
                      <a-image v-for="item in record?.handler?.fileVOS" :key="item.id" :src="item.path"
                        :width="100"></a-image>
                    </a-image-preview-group>
                    <span v-else>--</span>
                  </a-col>
                  <a-col :span="24">
                    处理时间：{{
                    record?.handler?.createTime
                    ? moment(record?.handler?.createTime).format(
                    "YYYY-MM-DD HH:mm:ss",
                    )
                    : "--"
                    }}
                  </a-col>
                  <a-col :span="24">
                    <div style="display: flex">
                      <div>处理人员:</div>

                      <a-tooltip placement="topLeft" :title="record?.handler?.createUserName">
                        <a @click="handleClickUser(record?.handler?.userId)" style="
                            overflow: hidden;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            width: 200px;
                          ">
                          {{ record?.handler?.createUserName }}
                        </a>
                      </a-tooltip>
                    </div>
                  </a-col>
                </a-row>
              </div>
              <div class="handel-content" v-if="record.alarmStatus == 'ALARM_SUSPEND'">
                <a-row :gutter="[32, 16]">
                  <a-col :span="24">
                    预计处理时间：{{
                    moment(record?.suspend?.estimatedProcessTime).format(
                    "YYYY-MM-DD HH:mm:ss",
                    ) || "--"
                    }}
                  </a-col>
                  <a-col :span="24">
                    挂起原因:
                    {{ record?.suspend?.remark || "--" }}
                  </a-col>
                  <a-col :span="24">
                    <span>现场图片：</span>
                    <a-image-preview-group v-if="record?.suspend?.fileVOS.length">
                      <a-image v-for="item in record?.suspend?.fileVOS" :key="item.id" :src="item.path"
                        :width="100"></a-image>
                    </a-image-preview-group>
                    <span v-else>--</span>
                  </a-col>
                  <a-col :span="24">
                    挂起时间：
                    {{
                    record?.suspend?.createTime
                    ? moment(record?.suspend?.createTime).format(
                    "YYYY-MM-DD HH:mm:ss",
                    )
                    : "--"
                    }}
                  </a-col>
                  <a-col :span="24">
                    <div style="display: flex">
                      <div>操作挂起人员:</div>

                      <a-tooltip placement="topLeft" :title="record?.suspend?.createUserName">
                        <a @click="handleClickUser(record?.suspend?.userId)" style="
                            overflow: hidden;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            width: 200px;
                          ">
                          {{ record?.suspend?.createUserName }}
                        </a>
                      </a-tooltip>
                    </div>
                  </a-col>
                </a-row>
              </div>
            </template>
          </g-detail-form>
        </a-tab-pane>
        <a-tab-pane key="linkageAction" tab="联动动作">
          <equipment-linkage v-model:isExecute="execute" :id="businessKeyId"></equipment-linkage>
          <linkage-record v-model:execute="execute" :id="businessKeyId"></linkage-record>
        </a-tab-pane>
        <a-tab-pane key="handelRecord" tab="处理记录">
          <handel-process></handel-process>
        </a-tab-pane>
      </a-tabs>
    </template>
    <template #footer-page>
      <a-popconfirm title="再次推送该报警？" @confirm="handleRepeatPush">
        <a-button>再次推送</a-button>
      </a-popconfirm>
      <a-button @click="suspend" v-if="dataInfo.alarmStatus == 'ALARM_PROGRESS_CONFIRMED'">
        挂起
      </a-button>
      <a-button @click="transfer" v-if="
          dataInfo.alarmStatus == 'ALARM_UN_CONFIRMED' ||
          dataInfo.alarmStatus == 'ALARM_PROGRESS_CONFIRMED'
        ">
        指派
      </a-button>
      <a-button @click="goBack">返回</a-button>
    </template>
  </g-layout>
  <handel-suspend ref="handelSuspendModal" :width="560" @modal-save="saveSuspend"></handel-suspend>
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
          {{genderObj[userInfoModal.userInfo.gender] ?? "--" }}
        </a-form-item>
        <a-form-item label="所属部门">
          {{ userInfoModal.userInfo.organizations[0].name}}
        </a-form-item>
        <a-form-item label="职位">
          {{ userInfoModal.userInfo.positions[0].name}}
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
  <modal-table title="选择人员" url="tenantUserList" :columns="modal.columns" :search="modal.search" :searchLength="3"
    :width="1300" @modal-save="chengUser" v-model:value="modal.visible"></modal-table>
</template>

<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  ref,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import moment from "moment";
import videoLinkage from "./components/videoLinkage.vue";
import equipmentLinkage from "./components/equipmentLinkage.vue";
import linkageRecord from "./components/linkageRecord.vue";
import handelProcess from "./components/handelProcess.vue";
import alarmData from "./components/alarm-data.vue";
import collapse from "@/components/collapse.vue";
import alarmMonitor from "./components/alarm-monitor.vue";
import { message } from "ant-design-vue";
import { cubeOuaaService } from '@/api/service'

export default defineComponent({
  components: {
    videoLinkage,
    equipmentLinkage,
    linkageRecord,
    handelProcess,
    alarmData,
    collapse,
    alarmMonitor
  },
  setup() {
    const genderObj = {
      NONE: '保密',
      MALE: '男',
      FEMALE: '女'
    }
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const handelSuspendModal = ref(null);
    const { id, businessKey, alarmStatus } = route.query;
    const usePersonalColumns = () => {
      const feature = window.config.feature;
      const usePersonal = feature ? Boolean(feature.usePersonal) : false;
      const personalColumns = [{
        title: "性别",
        dataIndex: "gender",
        key: "gender",
        slots: {
          customRender: "gender",
        },
        customRender: ({ text }) => {
          return text || "--";
        },
      }, {
        title: "岗位",
        dataIndex: "postNames",
        key: "postNames",
        customRender: ({ text }) => {
          return text == "" ? "--" : text;
        },
      },
      {
        title: "是否在岗",
        dataIndex: "onDuty",
        key: "onDuty",
        customRender: ({ text }) => {
          return text ? "是" : "否";
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
        }
      ]
      return usePersonal ? personalColumns : ouaaColumns
    }
    const usePersonalSearch = () => {
      const feature = window.config.feature;
      const usePersonal = feature ? Boolean(feature.usePersonal) : false;
      return usePersonal ? [{
        label: "是否在岗",
        value: "onDuty",
        component: "g-select",
        options: [
          { label: "是", value: true },
          { label: "否", value: false },
        ],
      }] : []
    }
    const formateTime = (time) => {
      const h = parseInt(time / 3600)
      const minute = parseInt(time / 60 % 60)
      const second = Math.ceil(time % 60)

      const hours = h < 10 ? '0' + h : h
      const formatSecond = second > 59 ? 59 : second
      return `${hours > 0 ? `${hours}时` : ''}${minute < 10 ? '0' + minute : minute}分${formatSecond < 10 ? '0' + formatSecond : formatSecond}秒`
    }
    const handleRepeatPush = async () => {
      await proxy.$api.repeatPushAlarm(businessKey)
      proxy.$message.success('操作成功')
    }
    const handleClickUser = async (userId) => {
      if (!userId) {
        proxy.$message.error('人员ID异常')
        return
      }
      const result = await cubeOuaaService.getPersonInfo(userId)
      state.userInfoModal.userInfo = result
      state.userInfoModal.visible = true
    }

    const state = reactive({
      execute: false,
      userInfoModal: {
        visible: false,
        userInfo: {
          gender: '',
          name: '',
          mobile: '',
          organizations: [{
            name: ''
          }],
          positions: [{
            name: ''
          }],
        }
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
          ...usePersonalColumns()
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
                return ''
              }
            },
            {
              label: "报警通知人",
              value: "alarmNotifyUsername",
              slot: true,
              detailFun: (value) => {
                return ''
              }
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
                if (!value) return '--'
                return formateTime(value)
              }
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
    const afterGet = res => {
      let alarmTime = res.alarmTime
        ? moment(res.alarmTime).format("YYYY-MM-DD HH:mm:ss")
        : "--";
      state.alarmDetail = res;
      return { ...res, alarmTime };
    };
    const showResoult = status => {
      return status == "ALARM_HANDLER" ? true : false;
    };
    // 获取处理结果
    const getAlarmEventOperates = () => {
      proxy.$api.alarmEventOperates({ id: id }).then(res => {
        let result = res.find(item => item.alarmStatusEvent == "PROCESSED");
        if (result) {
          let videoList = result.operationParam.fileVOS.filter(
            item =>
              item.type == "mp4" || item.type == "AVI" || item.type == "MKV",
          );
          let imageList = result.operationParam.fileVOS.filter(
            item =>
              item.type !== "mp4" && item.type !== "AVI" && item.type !== "MKV",
          );
          state.handelStatusDetail = { ...result, videoList, imageList };
        }
      });
    };
    const goBack = () => {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());
      if (params.searchValue) {
        history.pushState(history.state, "", `/portal/securityMonitoring/alarmPage?searchValue=${params.searchValue}`)
      } else {
        history.back()
      }
    };
    let businessKeyId = ref("");
    let dataInfo = ref("");
    const detile = res => {
      businessKeyId.value = res.businessKey;
      dataInfo.value = res;
    };
    /* 移交 */
    const getp = (data, pid = null, res = []) => {
      data.forEach((element) => {
        res.push(element)
        if (element.children && element.children.length !== 0) {
          getp(element.children, element.id, res)
        }

      })
      return res
    }
    const transfer = () => {
      proxy.$api.positionList().then(resdata => {
        proxy.$api.getOrganizations().then(res => {

          state.modal.search = [
            {
              label: "岗位",
              value: "postId",
              component: "g-select",
              options: resdata.map(pos => {
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
              options: getp(res).map(data => {
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
        let assignUsers = []
        const feature = window.config.feature;
        const usePersonal = feature ? Boolean(feature.usePersonal) : false;
        if (usePersonal) {
          assignUsers.push({
            userId: selectedItems[0].userId,
            userName: selectedItems[0].name,
            departmentId: selectedItems[0].organizationId,
            departmentName: selectedItems[0].organizationName,
          })
        } else {
          assignUsers.push({
            userId: selectedItems[0].id,
            userName: selectedItems[0].name,
            departmentId: selectedItems[0].organizations.length > 0 ? selectedItems[0].organizations[0].id : '',
            departmentName: selectedItems[0].organizations.length > 0 ? selectedItems[0].organizations[0].name : ''
          })
        }
        proxy.$api
          .alarmHandelAssign({
            id: id,
            assignUsers: assignUsers
          })
          .then(res => {
            proxy.$message.success("提交成功");
            state.modal.visible = false;
          });
      }
    };
    const saveSuspend = form => {
      proxy.$api.alarmHandelSuspend({ id: id, ...form }).then(res => {
        proxy.$message.success("提交成功");
        handelSuspendModal.value.cancel();
      });
    };
    const suspend = record => {
      handelSuspendModal.value.visible = true;
    };
    return {
      suspend,
      handleClickUser,
      saveSuspend,
      genderObj,
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
      handleRepeatPush,
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

:deep(.ant-tabs-tabpane-active) {
  padding: 10px 0;
  overflow-y: auto;
  overflow-x: hidden;
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
