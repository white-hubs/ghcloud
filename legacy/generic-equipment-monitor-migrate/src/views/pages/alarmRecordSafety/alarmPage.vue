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
    :searchCache="true"
  >
    <!-- <template #pre-item="{ record }">
      <a-form-item>
        <a-radio-group
          v-model:value="btnStatus"
          button-style="solid"
          @change="changeData(record)"
        >
          <a-radio-button
            v-for="item in alarmStatusList"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </a-radio-button>
        </a-radio-group>
      </a-form-item>
    </template> -->
    <template #btn="{ record }">
      <a-button type="link" @click="suspend(record)"> 详情 </a-button>
    </template>
  </g-table>
  <modal-table
    title="选择人员"
    v-model:value="modal.visible"
    url="tenantUserList"
    :params="{ enabled: true }"
    :columns="modal.columns"
    :search="modal.search"
    :searchLength="3"
    :width="1300"
    @modal-save="chengUser"
  ></modal-table>
  <handel-suspend
    ref="handelSuspendModal"
    :width="560"
    @modal-save="saveSuspend"
  ></handel-suspend>
  <HandleResult
    ref="handelResultModal"
    :width="560"
    @modal-save="saveHandel"
  ></HandleResult>
</template>
<script lang="jsx">
import { alarmHandleEnumerate, alarmOvertimeEnumerate } from "@/utils/enumerate";
import moment from "moment";
import {
  computed,
  onMounted,
  defineComponent,
  getCurrentInstance,
  onBeforeMount,
  reactive,
  ref,
  toRefs,
  onBeforeUnmount,
} from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import handelSuspend from "./components/handelSuspend.vue";
import HandleResult from "./components/handleResult.vue";
import axios from "axios";
import { usePageName } from "@ghcloud/cube-utils"

export default defineComponent({
  components: { handelSuspend, HandleResult },
  setup() {
    const store = useStore();
    const applicationCode = ref(null);
    const { proxy } = getCurrentInstance();
    const handelSuspendModal = ref(null);
    const handelResultModal = ref(null);
    const route = useRoute();

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
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      btnStatus: "",
      api: {
        list: "getAlarmSafetyRecords",
        path: "/alarmSafetyDetail",
        pathParams: [{ value: "businessKey" }, { value: "alarmStatus" }],
      },
      search: [],
      btns: [],
      columns: [
        {
          dataIndex: "alarmEventName",
          title: "报警事件",
        },
        {
          dataIndex: "marketName",
          title: "报警市场",
        },
        {
          dataIndex: "areaName",
          title: "报警区域",
        },
        {
          dataIndex: "alarmTime",
          title: "报警时间",
          slots: {
            customRender: "alarmTime",
          },
          customRender: ({ text }) => {
            return text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          },
        },
        {
          dataIndex: "alarmLevelName",
          title: "报警级别",
          align:'center',
          width:100
        },
        {
          dataIndex: "timeoutProcessTimesName",
          title: "处理时限",
          align:'center',
          width:100,
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
          align:'center',
          width:100,
        },
        {
          dataIndex: "alarmStatusName",
          title: "处理状态",
          align:'center',
          width:100,
          slots: {
            customRender: "alarmStatusName",
          },
          customRender: ({ text, record }) => {
            return (
              <div>
                <span>{text}</span>
              </div>
            );
          },
        },
        {
          dataIndex: "estimateHandlerTime",
          title: "预计处理时间",
          align:'center',
          slots: {
            customrender: "estimateHandlerTime",
          },
          customRender: ({ text }) => {
            return (
              <a-popover
                content={text ? moment(text).format("YYYY-MM-DD HH:mm:SS") : "--"}
              >
                {text ? moment(text).format("YYYY-MM-DD HH:mm:SS") : "--"}
              </a-popover>
            );
          },
        },
        {
          dataIndex: "alarmHandlerName",
          title: "处理人",
          align:'center',
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
          ...usePersonalColumns(),
          // {
          //   title: "岗位",
          //   dataIndex: "postNames",
          //   key: "postNames",
          //   customRender: ({ text }) => {
          //     return text == "" ? "--" : text;
          //   },
          // },
          {
            title: "是否在岗",
            dataIndex: "onDuty",
            key: "onDuty",
            customRender: ({ text }) => {
              return text ? "是" : "否";
            },
          },
        ],
        search: [
          {
            label: "状态",
            value: "enabled",
            component: "g-select",
            options: [
              { label: "启用", value: true },
              { label: "禁用", value: false },
            ],
            field: { value: "value", label: "label" },
          },
          {
            label: "",
            value: "keyword",
            placeholder: "请输入人员名称",
          },
        ],
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
    onBeforeMount(() => {
      state.btnStatus = route.params.alarmStatus || "";
      state.search = [
        {
          label: "",
          value: "keyword",
          placeholder: "请输入设备名称/报警事件",
          width: "198px",
        },

        {
          label: "报警市场",
          value: "marketTenant",
          component: "g-select",
          url: "marketlist",
          field: { marketName: "label", marketTenant: "value" },
          placeholder: "请选择报警市场",
          width: "198px",
        },
        {
          label: "报警分类",
          value: "alarmTypeCode",
          component: "g-select",
          url: "getAlarmTypes",
          field: { applicationName: "label", alarmTypeCode: "value" },
          placeholder: "请选择报警分类",
          width: "198px",
        },
        {
          label: "处理状态",
          value: "alarmStatus",
          component: "g-select",
          options: alarmHandleEnumerate,
          placeholder: "请选择处理状态",
          width: "198px",
        },
        // {
        //   label: "超时状态",
        //   value: "alarmHandlerTimeoutStatus",
        //   component: "g-select",
        //   options: alarmOvertimeEnumerate,
        //   placeholder: "请选择超时状态",
        //   width: "198px",
        // },
        {
          label: "报警时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
          width: "218px",
        },
      ];
    });
    const changeData = (record) => {
      tableData.value.searchRecord();
    };
    const beforeGet = (params) => {
      return {
        ...params,
      };
    };
    onMounted(() => {
      searchCacheHandle();
    });
    const searchCacheHandle = () => {
      // 获取路由参数
      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());
      let query = {};
      // debugger
      if (params.searchValue && params.searchValue !== "undefined") {
        query = JSON.parse(params.searchValue);
        tableData.value.form.alarmHandlerTimeoutStatus = query.alarmHandlerTimeoutStatus;
        tableData.value.form.alarmLevelId = query.alarmLevelId;
        tableData.value.form.alarmStatus = query.alarmStatus;
        tableData.value.form.keyword = query.keyword;
        tableData.value.form.date = query.date;

        setTimeout(() => tableData.value.getData(), 100);
      }
    };
    /* 详情 */
    const suspend = (record) => {
      proxy.$api.getmarketconfig(record.marketTenant).then((res) => {
        sessionStorage.setItem("marketurl", res.url);
        sessionStorage.setItem("marketenant", res.marketTenant);
        proxy.$api
          .gettokenouaa({
            grant_type: "client_credentials",
            client_id: res.account,
            client_secret: res.password,
          }).then((data) => {
            sessionStorage.setItem("markettoken", data.access_token);

            history.pushState(
              {},
              "",
              `/portal/genericEquipmentMonitor/alarmSafetyDetail?businessKey=${record.businessKey}&alarmStatus=${record.alarmStatus}&type=detail&id=${record.id}&marketname=${res.marketName}`
            );
          }).catch(()=>{
        sessionStorage.removeItem("marketurl");
      sessionStorage.removeItem("marketenant");
      
      
      });;
      })
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
    /* 移交 */
    const transfer = (record) => {
      proxy.$api.positionList().then((resdata) => {
        proxy.$api.getOrganizations().then((res) => {
          state.modal.search = [
            {
              label: "职位",
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
              options: getp(res).map((data) => {
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
          state.selectedRow = record;
          state.modal.visible = true;
        });
      });
      state.selectedRow = record;
      state.modal.visible = true;
    };
    /* 保存移交 */
    const chengUser = (selectedKeys, selectedItems) => {
      if (selectedKeys.length) {
        const feature = window.config.feature;
        const usePersonal = feature ? Boolean(feature.usePersonal) : false;
        proxy.$api
          .alarmHandelAssign({
            id: state.selectedRow.id,
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
    /* 保存挂起 */
    const saveSuspend = (form) => {
      proxy.$api.alarmHandelSuspend({ id: state.selectedRow.id, ...form }).then((res) => {
        proxy.$message.success("提交成功");
        handelSuspendModal.value.cancel();
        tableData.value.getData();
      });
    };
    const saveHandel = (form) => {
      proxy.$api.alarmHandelResult({ id: state.selectedRow.id, ...form }).then((res) => {
        proxy.$message.success("提交成功");
        handelResultModal.value.cancel();
        tableData.value.getData();
      });
    };
    return {
      saveHandel,
      ...toRefs(state),
      handelStatusColor,
      transfer,
      suspend,
      handle,
      chengUser,
      handelSuspendModal,
      handelResultModal,
      saveSuspend,
      tableData,
      beforeGet,
      changeData,
      alarmStatusList: alarmHandleEnumerate,
    };
  },
});
</script>

<style></style>
