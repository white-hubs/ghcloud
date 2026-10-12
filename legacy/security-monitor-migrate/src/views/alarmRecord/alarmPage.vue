<template>
  <g-table 
    ref="tableData" 
    :title="pageTitle" 
    :search="search" 
    :api="api" 
    :btns="btns" 
    :isShowMore="false" 
    :columns="columns"
    editMode="page" 
    :beforeGet="beforeGet"
    tableCode="ALARM_RECORD"
  >
    <template #btn="{ record }">
      <a-button type="link" @click="transfer(record)" v-if="
          record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED' ||
          record.alarmStatus === 'ALARM_SUSPEND' ||
          record.alarmStatus === 'ALARM_UN_CONFIRMED'
        ">
        指派
      </a-button>
      <!--  -->
      <a-button type="link" @click="suspend(record)" v-if="record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'">
        挂起
      </a-button>
      <a-button type="link" @click="handle(record)" v-if="
          record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED' ||
          record.alarmStatus === 'ALARM_SUSPEND' ||
          record.alarmStatus === 'ALARM_UN_CONFIRMED'
        ">
        处理
      </a-button>
    </template>
  </g-table>
  <modal-table title="选择人员" url="tenantUserList" :columns="modal.columns" :search="modal.search" :searchLength="3"
    :width="1300" @modal-save="chengUser" v-model:value="modal.visible"></modal-table>
  <handel-suspend ref="handelSuspendModal" :confirmLoading="confirmSuspendLoading" :width="560"
    @modal-save="saveSuspend"></handel-suspend>
  <HandleResult ref="handelResultModal" :confirmLoading="confirmHandleLoading" :width="560" @modal-save="saveHandel">
  </HandleResult>
</template>
<script lang="jsx">
import {
  computed,
  defineComponent,
  getCurrentInstance,
  onBeforeMount,
  onMounted,
  reactive,
  ref,
  toRefs,
  nextTick,
} from "vue";
import {
  alarmOvertimeEnumerate,
  alarmHandleEnumerate,
  alarmHandlerResultEnumerate,

} from "@/utils/enumerate";
import moment from "moment";
import { usePageName } from "@ghcloud/cube-utils"

const color = {
  一级: 'rgb(255, 59, 52)',
  二级: 'rgb(255, 110, 52)',
  三级: 'rgb(255, 194, 52)',
  四级: 'rgb(24, 144, 255)'
}
const status = {
  超时: '#D9001B',
  正常: '#70B603'
}
const handStatus = {
  已挂起: '#02A7F0',
  待接收: '#D9001B',
  处理中: '#F59A23',
  已关闭: '#7F7F7F',
  已处理: '#70B603'
}
const workStatus = {
  REST: '休息',
  WORKING: '在岗',
  LEAVE_POST: '离岗',
  AWAY_BUSINESS: '出差',
  ASK_LEAVE: '请假'
}
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();

    const handelSuspendModal = ref(null);
    const handelResultModal = ref(null);
    const tableData = ref(null);
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
            value: "onDuty",
            component: "g-select",
            options: [
              { label: "是", value: true },
              { label: "否", value: false },
            ],
          },
        ]
        : [];
    };
    const formateTime = (time) => {
      const h = parseInt(time / 3600)
      const minute = parseInt(time / 60 % 60)
      const second = Math.ceil(time % 60)

      const hours = h < 10 ? '0' + h : h
      const formatSecond = second > 59 ? 59 : second
      return `${hours > 0 ? `${hours}时` : ''}${minute < 10 ? '0' + minute : minute}分${formatSecond < 10 ? '0' + formatSecond : formatSecond}秒`
    }

    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      btnStatus: "",
      confirmHandleLoading: false,
      confirmSuspendLoading: false,

      api: {
        list: "getAlarmRecords",
        path: "/alarmDetail",
        pathParams: [{ value: "businessKey" }],
      },
      search: [
        {
          component: "span",
          value: "applicationCode",
          defaultValue: "SECURITY_MONITORING",
          width: "198px",
        },
        {
          label: "报警级别",
          value: "alarmLevelId",
          component: "g-select",
          url: "getAlarmLevels",
          field: { name: "label", id: "value" },
          placeholder: "请选择报警级别",
          width: "130px",
        },
        {
          label: "处理状态",
          value: "alarmStatus",
          component: "g-select",
          options: alarmHandleEnumerate,
          placeholder: "请选择处理状态",
          width: "130px",
        },
        {
          label: "超时状态",
          value: "alarmHandlerTimeoutStatus",
          component: "g-select",
          options: alarmOvertimeEnumerate,
          placeholder: "请选择超时状态",
          width: "130px",
        },
        {
          label: "处理结果",
          value: "alarmHandlerResult",
          component: "g-select",
          options: alarmHandlerResultEnumerate,
          placeholder: "请选择超时状态",
          width: "130px",
        },
        {
          label: "报警时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
          width: "200px",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "请输入设备名称/报警规则",
          width: "198px",
        },
      ],
      btns: ["detail"],
      columns: [
        {
          dataIndex: "alarmEventName",
          title: "报警事件",
        },
        {
          dataIndex: "alarmLevelName",
          title: "报警级别",
          align: "center",
          slots: {
            customRender: "alarmLevelName",
          },
          customRender: ({ text, record, index }) => {
            return <span style={{ color: color[text] }}>{text || '--'}</span>
          }
        },

        {
          dataIndex: "areaName",
          title: "报警区域",
          slots: {
            customRender: "areaName",
          },
          customRender: ({ text, record, index }) => {
            return text ? text : "--";
          },
        },
        {
          dataIndex: 'alarmTargetAddress',
          title: '详细位置',
          slots: {
            customRender: "alarmTargetAddress",
          },
          customRender: ({ text, record, index }) => {
            return text ? text : "--";
          },
        },
        {
          dataIndex: "alarmTime",
          title: "报警时间",
          width: 200,
          slots: {
            customRender: "alarmTime",
          },
          customRender: ({ text }) => {
            return text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          },
        },
        {
          dataIndex: "alarmTargetName",
          title: "报警设备",
          width: 200,
        },

        {
          dataIndex: "timeoutProcessTimesName",
          title: "处理时限",
          align: "center",
          slots: {
            customRender: "timeoutProcessTimesName",
          },
          customRender: ({ text, record, index }) => {
            return text ? text : "--";
          },
        },
        {
          dataIndex: "alarmHandlerTimeoutStatusName",
          title: "超时状态",
          align: "center",
          slots: {
            customRender: "alarmHandlerTimeoutStatusName",
          },
          customRender: ({ text, record, index }) => {
            return <span style={{ color: status[text] }}>{text ? text : "--"}</span>
          },
        },
        {
          dataIndex: "alarmStatusName",
          title: "处理状态",
          align: "center",
          slots: {
            customRender: "alarmStatusName",
          },
          customRender: ({ text, record }) => {
            return (
              <span style={{ color: handStatus[text] }}>{text}</span>
            );
          },
        },
        {
          dataIndex: "estimateHandlerTime",
          title: "预计处理时间",
          slots: {
            customrender: "estimateHandlerTime",
          },
          customRender: ({ text }) => {
            return (
              <a-popover
                content={text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--"}
              >
                {text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--"}
              </a-popover>
            );
          },
        },
        {
          dataIndex: "alarmHandlerName",
          title: "处理人",
          align: "center",
          slots: {
            customRender: "alarmHandlerName",
          },
          customRender: ({ text }) => {
            return text ? text : "--";
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          width: 200,
          slots: {
            customRender: "action",
          },
        },
      ],
      selectedRow: {},
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
          {
            title: "职位",
            dataIndex: "positions",
            key: "positions",
            slots: {
              customRender: "positions",
            },
            customRender: ({ text }) => {
              if (!text) return '--';
              if (!text.length) return '--';
              const positions = text.map((item) => item.name);
              return positions.join("、");
            },
          },
          {
            title: "工作状态",
            dataIndex: "workStatus",
            key: "workStatus",
            slots: {
              customRender: "workStatus",
            },
            customRender: ({ text }) => {
              return text ? workStatus[text] : '--';
            },
          },
          // ...usePersonalColumns(),
        ],
        search: [],
      },
    });
    const handelStatusColor = computed(() => (key) => {
      let obj = alarmHandleEnumerate.find((item) => item.value === key);
      if (obj) {
        return obj.color;
      } else {
        return "";
      }
    });
    const changeData = (record) => {
      tableData.value.searchRecord();
    };
    const beforeGet = (params) => {
      return {
        ...params,
        applicationCode: "SECURITY_MONITORING",
      };
    };
    onMounted(() => {
    });
    const showTable = ref(false);
    const searchCacheHandle = () => {
      // 获取路由参数
      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());
      let query = {};
      // debugger
      if (params.searchValue && params.searchValue !== "undefined") {
        query = JSON.parse(params.searchValue);
        setTimeout(() => {
          tableData.value.form.alarmHandlerTimeoutStatus =
            query.alarmHandlerTimeoutStatus;
          tableData.value.form.alarmLevelId = query.alarmLevelId;
          tableData.value.form.alarmStatus = query.alarmStatus;
          tableData.value.form.keyword = query.keyword;
          tableData.value.form.date = query.date;
          tableData.value.form.applicationCode = query.applicationCode;
          tableData.value.form.alarmHandlerResult = query.alarmHandlerResult;
          tableData.value.getData();
        }, 500);
      }
    };
    /* 挂起 */
    const suspend = (record) => {
      state.selectedRow = record;
      handelSuspendModal.value.visible = true;
    };
    /**处理 */
    const handle = (record) => {
      state.selectedRow = record;
      handelResultModal.value.visible = true;
    };
    /* 移交 */
    const getp = (data, pid = null, res = []) => {
      data.forEach((element) => {
        res.push(element);
        if (element.children && element.children.length !== 0) {
          getp(element.children, element.id, res);
        }
      });
      return res;
    };
    let Organizations = ref([]);
    const transfer = (record) => {
      proxy.$api.positionList().then((resData) => {
        proxy.$api.getOrganizations({ enabled: true }).then((res) => {
          state.modal.search = [
            {
              label: "职位",
              value: "positionId",
              component: "g-select",
              options: resData.map((pos) => {
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
              options: getp(res).map((data) => {
                data.label = data.name;
                data.value = data.id;
                return data;
              }),
            },
            {
              label: "工作状态",
              value: "workStatus",
              component: "g-select",
              options: Object.keys(workStatus).map(item => {
                return {
                  label: workStatus[item],
                  value: item,
                }
              }),
              field: { value: "value", label: "label" },
            },
            {
              label: "",
              value: "keyword",
              placeholder: "请输入人员名称",
            },
          ];
          state.selectedRow = record;
          state.modal.visible = true;
        });
      });
    };
    /* 保存移交 */
    const chengUser = (selectedKeys, selectedItems) => {
      if (selectedKeys.length) {
        let assignUsers = [];
        const feature = window.config.feature;
        const usePersonal = feature ? Boolean(feature.usePersonal) : false;
        if (usePersonal) {
          assignUsers.push({
            userId: selectedItems[0].userId,
            userName: selectedItems[0].name,
            departmentId: selectedItems[0].organizationId,
            departmentName: selectedItems[0].organizationName,
          });
        } else {
          assignUsers.push({
            userId: selectedItems[0].id,
            userName: selectedItems[0].name,
            departmentId:
              selectedItems[0].organizations.length > 0
                ? selectedItems[0].organizations[0].id
                : "",
            departmentName:
              selectedItems[0].organizations.length > 0
                ? selectedItems[0].organizations[0].name
                : "",
          });
        }
        proxy.$api
          .alarmHandelAssign({
            id: state.selectedRow.id,
            assignUsers: assignUsers,
          })
          .then((res) => {
            proxy.$message.success("提交成功");
            state.modal.visible = false;
            tableData.value.getData();
          });
      }
    };
    /* 保存挂起 */
    const saveSuspend = async (form) => {
      try {
        state.confirmSuspendLoading = true
        await proxy.$api.alarmHandelSuspend({ id: state.selectedRow.id, ...form })
        proxy.$message.success("提交成功");
        handelSuspendModal.value.cancel();
        tableData.value.getData();
      } finally {
        state.confirmSuspendLoading = false
      }

    };
    /**保存处理 */
    const saveHandel = async (form) => {
      try {
        state.confirmHandleLoading = true
        await proxy.$api.alarmHandelResult({ id: state.selectedRow.id, ...form })
        proxy.$message.success("提交成功");
        handelResultModal.value.cancel();
        tableData.value.getData();
      } finally {
        state.confirmHandleLoading = false
      }
    };
    return {
      showTable,
      ...toRefs(state),
      handelStatusColor,
      transfer,
      handle,
      suspend,
      chengUser,
      handelSuspendModal,
      saveSuspend,
      tableData,
      beforeGet,
      changeData,
      saveHandel,
      handelResultModal,
      alarmStatusList: alarmHandleEnumerate,
    };
  },
});
</script>

<style></style>
