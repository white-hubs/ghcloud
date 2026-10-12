<template>
  <gLayout :title="'数据权限-' + roleName" ref="roleDataPermission">
    <template #header-btn>
      <a-button type="link" @click="state.roleUserVisible = true"> <UserOutlined /> 查看角色下成员 </a-button>
    </template>
    <template #content-table>
      <a-table
        size="middle"
        :scroll="{ y: state.tableHeight }"
        :columns="columns"
        :data-source="state.dataSource"
        :rowClassName="getRowClassName"
        :pagination="false"
        bordered
      >
        <template #role="{ record }">
          <div v-if="record.pid">
            <a-select
              @change="(value) => handleDataPermissionChange(value, record)"
              :getPopupContainer="(triggerNode) => triggerNode.parentNode"
              v-model:value="record.dataPermission.scope"
              :options="dataPermissionOption"
              placeholder="选择"
              style="width: 200px"
            >
            </a-select>
          </div>
        </template>
        <template #checked="{ record }">
          <div class="custom-dept-cell" v-if="record.pid && record.dataPermission.scope === 'CUSTOM_DEPT'">
            <div
              class="custom-dept-cell-tag"
              v-if="record.dataPermission.customClientParams && record.dataPermission.customClientParams.length"
            >
              <a-tag
                color="green"
                closable
                @close="handleDeleteItem(record.dataPermission, item)"
                v-for="item in record.dataPermission.customClientParams"
                :key="item.id"
                >{{ item.name }}</a-tag
              >
            </div>
            <a-tag @click="handleChooseDept(record)" style="cursor: pointer">选择部门+</a-tag>
          </div>
        </template>
      </a-table>
      <a-modal
        v-model:visible="state.customDeptVisible"
        title="自定义部门"
        centered
        @ok="saveCustomDept"
        @cancel="cancelCustomDept"
        okText="确定"
        cancelText="取消"
        :width="700"
      >
        <a-tree-select
          v-model:value="state.selectedDeptKeys"
          style="width: 100%"
          :tree-data="state.deptTableSource"
          tree-checkable
          allow-clear
          :show-checked-strategy="SHOW_PARENT"
          search-placeholder="请选择部门"
          @change="handleSelectDept"
          :fieldNames="{ label: 'name', key: 'id', value: 'id', children: 'children' }"
        />
      </a-modal>
    </template>
    <template #footer-page>
      <a-button @click="goBack">返回</a-button>
      <a-button type="primary" @click="saveDataPermission" style="margin-left: 10px">保存</a-button>
    </template>
    <role-user v-model:value="state.roleUserVisible" :roleId="roleId" />
  </gLayout>
</template>
<script setup lang="jsx">
import { UserOutlined } from "@ant-design/icons-vue";
import { onMounted, reactive, getCurrentInstance, ref, h, computed, unref } from "vue";
import { useRoute } from "vue-router";

import { FIRSTCODE_FOR_APPCODE } from "@ghcloud/cube-permission-codes";

import modalTable from "./components/modalTable.vue";
import roleUser from "./components/role-user/index.vue";
import { authStore } from "@/api/auth-store";
import { cubeOuaaService } from "@/api/service";
const { proxy } = getCurrentInstance();

const { id: roleId, name: roleName } = useRoute().query;
const uuid = () => {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
};
const columnsData = () => {
  const personalColumns = [
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
      dataIndex: "organizationName",
      key: "organizationName",
    },
    {
      title: "是否在岗",
      dataIndex: "onDuty",
      key: "onDuty",
      slots: {
        customRender: "onDuty",
      },
      customRender: ({ text }) => {
        return text ? "是" : "否";
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
        return text;
      },
    },
  ];
  const ouaaColumns = [
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
        return text && text.length > 0 ? text.map((e) => e.name).join("/") : "--";
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
          MALE: "男",
          FEMALE: "女",
          NONE: "保密",
        };
        return text ? genderValues[text] : "--";
      },
    },
  ];
  if (window.config.feature?.usePersonal) {
    return personalColumns;
  } else {
    return ouaaColumns;
  }
};
const roleDataPermission = ref(null);
const state = reactive({
  dataSource: [],
  tableHeight: 600,
  selectedDeptKeys: [],
  selectedDeptRows: [],
  checkedDeptPermissionRowsId: "",
  deptTableSource: [],
  roleUserVisible: false,
  customDeptVisible: false,
  modal: {
    visible: false,
    search: [
      {
        label: "",
        value: "keyword",
        placeholder: "请输入人员名称",
      },
    ],
    url: "tenantUserList",
    columns: columnsData(),
  },
});
const handleDataPermissionChange = (value, record) => {
  if (value !== "CUSTOM_DEPT") {
    record.dataPermission.filterParams = null;
    record.dataPermission.customClientParams = [];
  }
};
const handleChooseDept = (record) => {
  getDeptList();
  state.checkedDeptPermissionRowsId = record.id;
  state.selectedDeptKeys = JSON.parse(JSON.stringify(record.dataPermission.filterParams || []));
  state.selectedDeptRows = JSON.parse(JSON.stringify(record.dataPermission.customClientParams || []));
  state.customDeptVisible = true;
};
const saveDataPermission = async () => {
  const params = {
    roleId,
    codes: state.dataSource
      .filter((item) => item.pid)
      .map((item) => {
        return {
          code: item.code,
          extentConfig: JSON.stringify({
            ...item.dataPermission,
          }),
        };
      }),
  };
  await cubeOuaaService.saveUserDataRole(params);
  proxy.$message.success("保存成功");
  goBack();
};
const handleDeleteItem = (rowDataPermission, dept) => {
  const index = rowDataPermission.customClientParams.findIndex((e) => e.id === dept.id);
  if (index > -1) {
    rowDataPermission.customClientParams.splice(index, 1);
    rowDataPermission.filterParams.splice(index, 1);
  }
};
const deptColumns = [
  {
    title: "部门名称",
    dataIndex: "name",
    align: "left",
    customRender: ({ text }) => {
      return <PopOver content={text}>{text}</PopOver>;
    },
  },
  {
    title: "人数",
    dataIndex: "members",
    align: "left",
    customRender: ({ text }) => {
      if (text) {
        return <PopOver content={text}>{text}</PopOver>;
      } else {
        return <PopOver content="0">0</PopOver>;
      }
    },
  },
  {
    title: "备注",
    dataIndex: "remark",
    align: "left",
    customRender: ({ text }) => {
      if (text) {
        return text;
      } else {
        return "--";
      }
    },
  },
];
const treeToArr = (data, pid = null, res = []) => {
  data.forEach((item) => {
    const addItem = { pid: pid, code: item.code, id: item.id ?? uuid(), name: item.name };
    addItem.dataPermission = item.dataPermission ? item.dataPermission : null;
    res.push(addItem);
    if (item.children && item.children.length !== 0) {
      treeToArr(item.children, item.id, res);
    }
  });
  return res;
};
const findDeptInTree = (nodes, id) => {
  for (const item of nodes || []) {
    if (item.id === id) {
      return item;
    }
    const found = findDeptInTree(item.children, id);
    if (found) {
      return found;
    }
  }
  return undefined;
};
const rowSelectionDept = computed(() => {
  return {
    type: "checkbox",
    selectedRowKeys: unref(state.selectedDeptKeys),
    onSelect: (record, selected, selectedRows) => {
      if (selected) {
        state.selectedDeptKeys.push(record.id);
        state.selectedDeptRows.push(record);
      } else {
        state.selectedDeptRows = state.selectedDeptRows.filter((item) => item.id !== record.id);
        state.selectedDeptKeys = state.selectedDeptKeys.filter((item) => item !== record.id);
      }
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      if (selected) {
        state.selectedDeptKeys = selectedRows.map((item) => item.id);
        state.selectedDeptRows = selectedRows;
      } else {
        state.selectedDeptKeys = [];
        state.selectedDeptRows = [];
      }
    },
  };
});
const handleSelectDept = (_v, _r, extra) => {
  const tn = extra?.triggerNode;
  let dataRef = tn?.dataRef ?? tn?.props?.dataRef ?? tn?.$props?.dataRef;
  const { checked = false } = extra ?? {};
  if (!dataRef?.id && extra?.triggerValue != null) {
    dataRef = findDeptInTree(state.deptTableSource, extra.triggerValue);
  }
  if (!dataRef?.id) {
    return;
  }
  if (checked) {
    state.selectedDeptRows.push(dataRef);
  } else {
    state.selectedDeptRows = state.selectedDeptRows.filter((item) => item.id !== dataRef.id);
  }
};
const saveCustomDept = () => {
  const index = state.dataSource.findIndex((item) => item.id === state.checkedDeptPermissionRowsId);
  if (index >= 0) {
    state.dataSource[index].dataPermission.filterParams = state.selectedDeptKeys;
    state.dataSource[index].dataPermission.customClientParams = state.selectedDeptRows;
  }
  state.customDeptVisible = false;
  state.selectedDeptKeys = [];
  state.selectedDeptRows = [];
};
const cancelCustomDept = () => {
  state.customDeptVisible = false;
};

const options = [
  { value: "jack", label: "Jack" },
  { value: "lucy", label: "Lucy" },
  { value: "tom", label: "Tom" },
];
const dataPermissionOption = [
  {
    label: "全部",
    value: "ALL",
  },
  {
    label: "当前用户",
    value: "CURRENT_USER",
  },
  {
    label: "当前用户部门",
    value: "CURRENT_USER_DEPT",
  },
  {
    label: "自定义部门",
    value: "CUSTOM_DEPT",
  },
];
const columns = [
  {
    title: "数据类型",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "权限",
    dataIndex: "role",
    key: "role",
    slots: {
      customRender: "role",
    },
  },
  {
    title: "选择人员数据全部可见",
    dataIndex: "checked",
    key: "checked",
    slots: {
      customRender: "checked",
    },
  },
];

const getRowClassName = (record, index) => {
  return !record.pid ? "custom-table-striped" : "";
};
const getTableHeight = () => {
  const tableDom = document.getElementsByClassName("content-table")[0];
  state.tableHeight = tableDom.getBoundingClientRect().height - 80;
};
const getDeptList = async () => {
  const params = {
    name: "",
  };
  const data = await proxy.$api.organizations("get", params);
  state.deptTableSource = data;
};
const getDataList = async () => {
  const applicationList = await cubeOuaaService.productApplications(authStore.tenant);
  const rolePermissions = await cubeOuaaService.getRolePermissions({ id: roleId });
  const dataPermissions = sessionStorage.getItem("user-data-roles") ? JSON.parse(sessionStorage.getItem("user-data-roles")) : [];
  const permissionAppCodes = Array.from(
    new Set(
      dataPermissions.map((item) => {
        return FIRSTCODE_FOR_APPCODE[item.code.split(":")[0]];
      }),
    ),
  );
  // 过滤出有权限code的app
  let dataPermissionApp = applicationList.filter((item) => permissionAppCodes.includes(item.code));
  dataPermissionApp = dataPermissionApp.map((item) => {
    // 过滤出当前app的权限code
    const currentItemPermissions = dataPermissions.filter((permissionItem) => {
      return FIRSTCODE_FOR_APPCODE[permissionItem.code.split(":")[0]] === item.code;
    });
    return {
      id: item.id,
      code: item.code,
      name: item.name,
      children: currentItemPermissions.map((permission) => {
        let permissionConfig = { scope: "", filterParams: null, customClientParams: [] };
        const currentRolePermission = rolePermissions.find((rolePermission) => rolePermission.code === permission.code);
        if (currentRolePermission) {
          permissionConfig = JSON.parse(currentRolePermission.extentConfig);
        }
        return {
          id: null,
          code: permission.code,
          dataPermission: {
            ...permissionConfig,
          },
          name: permission.name ?? "",
        };
      }),
    };
  });
  state.dataSource = treeToArr(dataPermissionApp);
};
onMounted(async () => {
  await getDataList();
  getTableHeight();
});

/** 返回上一页 */
const goBack = () => {
  window.history.back();
};
</script>

<style scoped lang="less">
:deep(.ant-table-tbody > tr.ant-table-row:hover > td) {
  background: none !important;
}

:deep(.content-search) {
  display: none;
}

:deep(.custom-table-striped) {
  background-color: #f2f2f2;

  td {
    border-right: none !important;
  }
}

:deep(.custom-dept-cell) {
  display: flex;
  align-items: center;

  .custom-dept-cell-tag {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }
}
</style>
