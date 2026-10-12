<template>
  <a-tabs v-model:activeKey="activeKey" @change="changeTab" style="height: 100%;">
    <a-tab-pane key="person" tab="关联人员" style="height: 100%;">
      <g-table ref="tableData" :title="pageTitle" :search="search" :api="api" rowKey="deviceId" :btns="btns"
        :isShowMore="false" :columns="columns" :rowSelection="true" :selectKey="selectedRow" editMode="page"
        :beforeGet="beforeGet" :pagination="{
          pageSize:500,
          pageNumber:1
        }" tableCode="MONITORING_DEVICE_PERSON">
        <template v-slot:header-btns="{ record }">
          <a-button type="primary" @click="addauth(record.selectedRowKeys)" :disabled="!record.selectedRowKeys.length">
            权限关联
          </a-button>
          <a-button type="primary" @click="clearRelate(record.selectedRowKeys)"
            :disabled="!record.selectedRowKeys.length">
            清空关联关系
          </a-button>
        </template>
        <template #btn="{ record }">
          <a-button type="link" @click="deleteauth(record)">解除关联</a-button>
          <a-button type="link" @click="addauth(record,'single')">权限关联</a-button>
        </template>
      </g-table>
    </a-tab-pane>
    <a-tab-pane key="device" tab="关联设备" style="height: 100%;">
      <div style="height: 100%;">
        <monitoring-device ref="tableDeviceData" />
      </div>
    </a-tab-pane>
  </a-tabs>
  <modal-table title="选择人员" url="getSecurityUserDeviceAuthPage" :columns="modal.columns" selectType="checkbox"
    :search="modal.search" :searchLength="3" :width="1300" @modal-save="chengUser" v-model:value="modal.visible"
    :disabledKeys="parmsdata?.ids ?? []" :beforeGet="beforeGet" :selectedKeys="parmsdata?.ids ?? []"></modal-table>
  <modal-table ref="yctable" title="移除选择人员" url="tenantUsersPost" :selectedKeys="selectedKeys"
    :disabledKeys="selectedKeys" :selectedRows="selectedRows" :columns="modal.yccolumns" :rowSelection="true"
    apiType="post" :yc="true" :params="parmsdata" :search="modal.ycsearch" :searchLength="3" :width="1300"
    @modal-save="ycchengUser" v-model:value="modal.ycvisible"></modal-table>
</template>
<script lang="jsx">
import {
  computed,
  defineComponent,
  getCurrentInstance,
  reactive,
  ref,
  toRefs,
  h,
  onMounted
} from "vue";
import { alarmOvertimeEnumerate, alarmHandleEnumerate } from "@/utils/enumerate";
import moment from "moment";
import monitoringDevice from "./monitoring-device.vue";
import { Modal } from 'ant-design-vue';
import { usePageName } from "@ghcloud/cube-utils"

export default defineComponent({
  components: { monitoringDevice },
  setup() {
    const { proxy } = getCurrentInstance();

    const handelSuspendModal = ref(null);
    const handelResultModal = ref(null);
    const tableData = ref(null);
    const tableDeviceData = ref(null);
    const yctable = ref(null);
    const selectedKeys = ref([]);
    const selectedRows = ref([]);
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      activeKey: "person",
      btnStatus: "",

      api: {
        list: "getsecuritydeviceauth",
        // path: "/alarmDetail",
        // pathParams: [{ value: "businessKey" }],
      },
      search: [
        {
          component: "span",
          value: "applicationCode",
          defaultValue: "SECURITY_MONITORING",
          width: "198px",
        },
        {
          label: "",
          value: "cascaderIds",
          defaultData: "areaId",
          valueType: "string",
          component: "g-cascader",
          url: "getAreaList",
          placeholder: "请选择区域",
          field: { id: "value", name: "label", children: "children" },
        },

        {
          label: "",
          value: "keyword",
          placeholder: "请输入设备名称",
          width: "198px",
        },
      ],
      btns: [""],
      columns: [
        {
          dataIndex: "code",
          title: "设备编码",
        },
        {
          dataIndex: "deviceName",
          title: "设备名称",
        },
        {
          dataIndex: "areaName",
          title: "所属区域",
        },
        {
          dataIndex: "userList",
          title: "关联人员",
          slots: {
            customRender: "userList",
          },
          customRender: ({ text }) => {
            return getUserList(text);
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
        ycvisible: false,
        url: "",
        yccolumns: [
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
            title: "部门",
            dataIndex: "organizations",
            key: "organizations",
            slots: {
              customRender: "organizations",
            },
            customRender: ({ text }) => {
              return text && text.length ? text.map((e) => e.name).join("/") : "--";
            },
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
            title: "操作",
            dataIndex: "handle",
            key: "handle",
            slots: {
              customRender: "handle",
            },
            customRender: ({ text, record }) => {
              return h(
                "a",
                {
                  onClick: async () => {

                    await proxy.$api.Deletesecuritydeviceauth({
                      userId: record.id,
                      securityDeviceId: state.selectedRow,
                    });
                    parmsdata.value.ids = parmsdata.value.ids.filter(
                      (res) => res !== record.id
                    );
                    if (parmsdata.value.ids.length == 0) {
                      yctable.value.resetList();
                    } else {
                      yctable.value.getData();
                    }
                    tableData.value.getData();
                  },
                },
                "移除"
              );
            },
          },
        ],
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
            title: "部门",
            dataIndex: "organizations",
            key: "organizations",
            slots: {
              customRender: "organizations",
            },
            customRender: ({ text }) => {
              return text && text.length ? text.map((e) => e.name).join("/") : "--";
            },
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
        ],
        search: [],
        ycsearch: [],
      },
    });
    onMounted(() => {
    })
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
      //   state.btnStatus = record.applicationCode;
    };
    const clearRelate = (selectedKeys) => {
      Modal.confirm({
        title: "提示",
        content: "确认清空当前选中设备的关联人员关系吗？",
        okText: "确认",
        cancelText: "取消",
        async onOk() {
          const params = {
            deviceIds: selectedKeys
          }
          await proxy.$api.clearRelateDevice(params)
          proxy.$message.success("清空成功");
          tableData.value.getData()
        }
      })
    }
    const beforeGet = (params) => {
      if (state.modal.visible) {
        return {
          ...params,
          deviceId: state.selectedRow.length === 1 ? state.selectedRow[0] : "",
          applicationCode: "SECURITY_MONITORING",
        };
      }
      return {
        ...params,
        applicationCode: "SECURITY_MONITORING",
      };

    };
    const getUserList = (list) => {
      if (list.length > 0) {
        return list
          .map((res) => {
            return res.userName;
          })
          .join(",");
      } else {
        return "--";
      }
    };
    /* 移交 */
    let Organizations = ref([]);

    const chengUser = async (selectedKeys, selectedItems) => {
      if (selectedKeys.length) {
        let data = {
          userList: selectedItems.map((res) => {
            return {
              userId: res.id,
              userName: res.name,
            };
          }),
          securityDeviceId: state.selectedRow,
        };
        await proxy.$api.Addsecuritydeviceauth(data);
        state.modal.visible = false;
        tableData.value.getData();
      }
    };
    const ycchengUser = async (selectedKeys, selectedItems) => {
      state.modal.visible = false;
      tableData.value.getData();
    };

    let deleteOrAdd = ref(true);
    const addauth = (selectedRowKeys, single) => {
      if (Array.isArray(selectedRowKeys)) {
        parmsdata.value.ids = []
      } else {
        parmsdata.value = {
          ids: selectedRowKeys.userList.map((res) => res.userId),
        };
      }
      const searchFiled = {
        label: "只看未关联",
        component: "g-select",
        value: "associated",
        options: [{
          label: "是",
          value: false
        }, {
          label: "否",
          value: true
        }]
      };
      proxy.$api.positionList().then((resdata) => {
        proxy.$api.getOrganizations().then((res) => {
          const hasSearchFiled = (selectedRowKeys.length === 1 || single)
          state.modal.search = [
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
              label: "",
              value: "keyword",
              placeholder: "请输入人员名称",
            },
          ];
          if (hasSearchFiled) {
            state.modal.search = [
              ...state.modal.search,
              searchFiled
            ]
          }
          state.selectedRow =
            selectedRowKeys instanceof Array
              ? selectedRowKeys
              : [selectedRowKeys.deviceId];
          state.modal.visible = true;
        });
      });
    };
    let parmsdata = ref({
      ids: [],
    });
    const deleteauth = (data) => {
      if (data.userList.length == 0) {
        proxy.$message.warning("当前设备没有关联人员");
        return;
      }
      parmsdata.value = {
        ids: data.userList.map((res) => res.userId),
      };
      proxy.$api.getOrganizations().then((res) => {
        state.modal.ycsearch = [
          {
            component: "span",
            value: "ids",
            defaultValue: data.userList.map((res) => res.userId),
            width: "198px",
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
            label: "",
            value: "keyword",
            placeholder: "请输入人员名称",
          },
        ];
        state.modal.ycvisible = true;
        selectedKeys.value = data.userList.map((res) => res.userId);
        selectedRows.value = data.userList;
        state.selectedRow = data.deviceId;
      });
    };
    const changeTab = activeKey => {
      if (tableData.value && activeKey === 'person') {
        tableData.value.getData();
      }
      if (tableDeviceData.value && activeKey === 'device') {
        tableDeviceData.value.tableData.getData()
      }
    };
    return {
      yctable,
      parmsdata,
      ycchengUser,
      deleteOrAdd,
      deleteauth,
      addauth,
      ...toRefs(state),
      handelStatusColor,
      getUserList,
      chengUser,
      handelSuspendModal,
      selectedKeys,
      selectedRows,
      tableData,
      tableDeviceData,
      beforeGet,
      changeData,
      clearRelate,
      handelResultModal,
      alarmStatusList: alarmHandleEnumerate,
      changeTab
    };
  },
});
</script>

<style lang="less" scoped>
.ant-tabs .ant-tabs-top-content {
  height: 100%;
}

:deep(.ant-tabs .ant-tabs-top-content) {
  height: 100%;
}

:deep(.ant-tabs) {
  height: 100%;
}

:deep(.ant-tabs-content) {
  height: calc(100% - 60px);
}
</style>
