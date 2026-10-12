<template>
  <g-table ref="tableData" :title="pageTitle" :search="search" :api="api" rowKey="id" :btns="btns" :isShowMore="false"
    :columns="columns" :pagination="{
          pageSize:500,
          pageNumber:1
        }" :rowSelection="true" :selectKey="selectedRow" editMode="page" :beforeGet="beforeGet"
    tableCode="MONITORING_DEVICE_PERMISSION">
    <template v-slot:header-btns="{ record }">
      <a-button type="primary" @click="handleRelate(record.selectedRowKeys)" :disabled="!record.selectedRowKeys.length">
        权限关联
      </a-button>
      <a-button type="primary" @click="handleClearRelate(record.selectedRowKeys)"
        :disabled="!record.selectedRowKeys.length">
        清空关联关系
      </a-button>
    </template>
    <template #btn="{ record }">
      <a-button type="link" @click="cancelRelate(record)">解除关联</a-button>
      <a-button type="link" @click="handleRelate(record,'single')">权限关联</a-button>
    </template>
  </g-table>
  <ModalTable ref="gltable" title="选择设备" url="getsecuritydeviceauth" rowKey="deviceId"
    :params="{applicationCode: 'SECURITY_MONITORING'}" :columns="modal.columns" selectType="checkbox"
    :search="modal.search" :searchLength="3" :width="1300" :beforeGet="beforeGetRelateModal" @modal-save="changeDevice"
    v-model:value="modal.visible" :disabledKeys="parmsdata?.ids ?? []"
    :selectedKeys="parmsdata?.ids ?? []"></ModalTable>
  <modal-table ref="yctable" title="移除选择设备" selectType="checkbox" url="getDevices" :disabledKeys="selectedKeys"
    :selectedKeys="selectedKeys" :selectedRows="selectedRows" :columns="modal.yccolumns" :rowSelection="true"
    apiType="post" :yc="true" :params="parmsdata" :search="modal.search" :searchLength="3" :width="1300"
    :beforeGet="beforeGetModal" @modal-save="ycChangeDevice" v-model:value="modal.ycvisible"></modal-table>
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
  onMounted,
} from "vue";
import { alarmOvertimeEnumerate, alarmHandleEnumerate } from "@/utils/enumerate";
import ModalTable from "@/components/Common/ModalTable.vue";
import moment from "moment";
import { cubeDeviceCenterService } from "@/api/service.ts";
import { Modal } from 'ant-design-vue'
import { usePageName } from "@ghcloud/cube-utils"

export default defineComponent({
  components: {ModalTable},
  setup() {
    const { proxy } = getCurrentInstance();

    const handelSuspendModal = ref(null);
    const handelResultModal = ref(null);
    const tableData = ref(null);
    const yctable = ref(null);
    const gltable = ref(null);
    const selectedKeys = ref([]);
    const selectedRows = ref([]);
    const customerTagOptions = ref([]);
    const listPagination = {
      onChange: (page) => {
      },
      pageSize: 8,
      size: 'small'
    }
    const getSlots = (record) => {
      const listSlots = {
        renderItem: ({ item }) => {
          return <a-list-item>
            {item.name}
          </a-list-item>
        }
      }
      return {
        content: () => {
          return <a-list size='small' v-slots={listSlots} pagination={listPagination} dataSource={record.devices}></a-list>
        }
      }
    }

    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      btnStatus: "",
      api: {
        // list: "getsecuritydeviceauth",
        list: "getSecurityUserDeviceAuthPage",
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
          value: "organizationId",
          valueType: "string",
          component: "g-select",
          url: "deptList",
          placeholder: "请选择部门",
          field: { id: "value", name: "label" },
        },
        {
          label: "",
          value: "keyword",
          placeholder: "请输入人员名称",
          width: "198px",
        },
      ],
      btns: [""],
      columns: [
        {
          dataIndex: "name",
          title: "人员名称",
          width: 180,
        },
        {
          dataIndex: "organization",
          title: "所属部门",
          width: 180,
          customRender: ({ record }) => {
            const text = record?.organization?.name;
            return (
              <a-popover content={text}>
                {text}
              </a-popover>
            );
          },
        },
        {
          dataIndex: "devices",
          title: "关联设备",
          width: 260,
          slots: {
            customRender: "devices",
          },
          customRender: ({ record }) => {
            const text = record.devices ? record.devices.map(item => item.name).join(',') : '--'
            return (
              <div class='contact-device'>
                {text ? <a-popover destroyTooltipOnHide title='设备列表' v-slots={getSlots(record)} trigger="click">
                  <div class='text'> {text}</div>   <a style={{ marginLeft: '5px' }}>查看</a>
                </a-popover> : '--'}
              </div>

            );
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
        columns: [
          {
            dataIndex: "code",
            title: "设备编码",
            ellipsis: true,
            customRender: ({ text }) => {
              return (
                <a-popover content={text}>
                  {text}
                </a-popover>
              );
            },
            width: 200,
          },
          {
            dataIndex: "deviceName",
            title: "设备名称",
            ellipsis: true,
            customRender: ({ text }) => {
              return (
                <a-popover content={text || '--'}>
                  {text || '--'}
                </a-popover>
              );
            },
            width: 200,
          },
          {
            dataIndex: "areaName",
            title: "所属区域",
            ellipsis: true,
            customRender: ({ text }) => {
              return (
                <a-popover content={text || '--'}>
                  {text || '--'}
                </a-popover>
              );
            },
            width: 200,
          },
        ],
        yccolumns: [
          {
            dataIndex: "code",
            title: "设备编码",
            ellipsis: true,
            customRender: ({ text }) => {
              return (
                <a-popover content={text || '--'}>
                  {text || '--'}
                </a-popover>
              );
            },
          },
          {
            dataIndex: "name",
            title: "设备名称",
            ellipsis: true,
            customRender: ({ text }) => {
              return (
                <a-popover content={text || '--'}>
                  {text || '--'}
                </a-popover>
              );
            },
          },
          {
            dataIndex: "areaName",
            title: "所属区域",
            ellipsis: true,
            customRender: ({ record }) => {
              const text = record?.area?.pathName;
              return (
                <a-popover content={text || '--'}>
                  {text || '--'}
                </a-popover>
              );
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
                      userId: state.selectedRow,
                      securityDeviceId: record.id,
                    });
                    parmsdata.value.ids = parmsdata.value.ids.filter(
                      (res) => res !== record.id
                    );
                    parmsdata.value.matchedDeviceIds = parmsdata.value.matchedDeviceIds.filter(
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
        search: []

      },
    });
    let modalSearch = [
      {
        label: "区域",
        value: "areaId",
        component: "g-cascader",
        url: "getAreaList",
        placeholder: "请选择区域",
        field: { id: "value", name: "label", children: "children" },
      },
      {
        label: "",
        value: "keyword",
        placeholder: "请输入设备名称",
      }
    ]
    onMounted(() => {
      state.modal.search = [...modalSearch]
      cubeDeviceCenterService.getCustomerTagListAll({ status: 1 }).then((res) => {
        customerTagOptions.value = res;
      });
    })
    const handelStatusColor = computed(() => (key) => {
      let obj = alarmHandleEnumerate.find((item) => item.value === key);
      if (obj) {
        return obj.color;
      } else {
        return "";
      }
    });
    const beforeGet = (params) => {
      tableData.value.page.pageNumber = 1;
      tableData.value.page.pageSize = 500;
      return {
        ...params,
        pageSize: 500,
        applicationCode: "SECURITY_MONITORING",
      };
    };
    const beforeGetModal = (params) => {
      return {
        ...params,
        tagCodes: params.tagCodes,
        anyAreaId: params.areaId ? params.areaId.at(-1) : ''
      };
    };
    const beforeGetRelateModal = (params) => {
      return {
        ...params,
        tagCodes: params.tagCodes ? params.tagCodes.join(",") : params.tagCodes,
        userId: state.selectedRow.length === 1 ? state.selectedRow[0] : '',
        areaId: params.areaId ? params.areaId.join(',') : params.areaId
      };
    }
    let Organizations = ref([]);
    const changeDevice = async (selectedKeys, selectedItems,tableState) => {
      const userList = tableData.value.dataSource.filter(d => state.selectedRow.includes(d.id)).map((res) => {
          return {
            userName: res.name,
            userId: res.id
          }
        })
      if (tableState.form.deviceAll) {
        let data = {
          userList: userList,
          applicationCode : 'SECURITY_MONITORING',
          areaId : tableState.form.areaId || null,
          keyword : tableState.form.keyword || null,
          associated : tableState.form.associated || null,
          deviceAll : tableState.form.deviceAll,
          userId: state.selectedRow.length===1 ?state.selectedRow[0]:null
        };
        await proxy.$api.Addsecuritydeviceauth(data);
      }else if (selectedKeys.length && selectedItems.length !== 0) {
        let data = {
          securityDeviceId: selectedItems.map((res) => res.deviceId),
          userList: userList
        };
        await proxy.$api.Addsecuritydeviceauth(data);
      }
      state.modal.visible = false;
      tableData.value.getData();
    };
    const ycChangeDevice = async (selectedKeys, selectedItems) => {
      state.modal.visible = false;
      tableData.value.getData();
    };

    let deleteOrAdd = ref(true);
    const handleRelate = (selectedRowKeys, single) => {
      if (Array.isArray(selectedRowKeys)) {
        parmsdata.value.matchedDeviceIds = []
        parmsdata.value.ids = []
      } else {
        parmsdata.value = {
          matchedDeviceIds: selectedRowKeys.devices ? selectedRowKeys.devices.map((res) => res.id) : [],
          ids: selectedRowKeys.devices ? selectedRowKeys.devices.map((res) => res.id) : [],
        };
      }
      state.selectedRow =
        selectedRowKeys instanceof Array
          ? selectedRowKeys
          : [selectedRowKeys.id];
      state.modal.visible = true;
      if (gltable.value) {
        gltable.value.form.tagCodes = []
      }
      const relateFiled = {
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
      }
      const hasSearchFiled = selectedRowKeys.length === 1 || single
      const dataAll = {
        label: "关联全部",
        component: "g-select",
        value: "deviceAll",
        options: [{
          label: "是",
          value: true
        }, {
          label: "否",
          value: false
        }]
      }
      state.modal.search = !hasSearchFiled ? [...modalSearch] : [...modalSearch, relateFiled]
      state.modal.search.push(dataAll)
      state.modal.search.splice(1, 0, {
        label: "设备标签",
        value: "tagCodes",
        component: "g-select",
        mode: "multiple",
        maxTagCount: 1,
        options: customerTagOptions.value.map((data) => {
          data.label = data.tagName;
          data.value = data.tagCode;
          return data;
        }),
      })
    };
    let parmsdata = ref({
      ids: [],
    });
    const cancelRelate = (data) => {
      if (!data.devices || data.devices.length == 0) {
        proxy.$message.warning("当前人员没有关联设备");
        return;
      }
      parmsdata.value = {
        matchedDeviceIds: data.devices ? data.devices.map((res) => res.id) : [],
        ids: data.devices ? data.devices.map((res) => res.id) : [],
      };
      state.selectedRow = [data.id];
      state.modal.ycvisible = true;
      selectedKeys.value = data.devices ? data.devices.map((res) => res.id) : [];
      selectedRows.value = data.devices || [];
      if (yctable.value) {
        yctable.value.form.tagCodes = []
      }
      state.modal.search = [...modalSearch]
      state.modal.search.splice(1, 0, {
        label: "设备标签",
        value: "tagCodes",
        component: "g-select",
        mode: "multiple",
        maxTagCount: 1,
        options: customerTagOptions.value.map((data) => {
          data.label = data.tagName;
          data.value = data.tagCode;
          return data;
        }),
      })
    };
    const handleClearRelate = (selectedRowKeys) => {
      Modal.confirm({
        title: "提示",
        content: "确认清空当前选中人员的关联设备关系吗？",
        okText: "确认",
        cancelText: "取消",
        async onOk() {
          const params = {
            userIds: selectedRowKeys
          }
          await proxy.$api.clearRelatePerson(params)
          proxy.$message.success("清空成功")
          tableData.value.getData();
        }
      })
    }
    return {
      handleClearRelate,
      yctable,
      gltable,
      parmsdata,
      ycChangeDevice,
      deleteOrAdd,
      cancelRelate,
      handleRelate,
      ...toRefs(state),
      handelStatusColor,
      changeDevice,
      handelSuspendModal,
      selectedKeys,
      selectedRows,
      tableData,
      beforeGet,
      beforeGetModal,
      beforeGetRelateModal,
      handelResultModal,
      alarmStatusList: alarmHandleEnumerate,
      customerTagOptions,
    };
  },
});
</script>

<style lang="less">
.contact-device {
  display: flex;
  align-items: center;

  span {
    display: flex;
    align-items: center;
    width: 100%;

    .text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }


    a {
      flex-shrink: 0
    }
  }


}
</style>
