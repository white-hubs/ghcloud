<template>
  <div id="components-grid-demo-flex" ref="ctr">
    <div class="productName">产品名称: {{ name }}</div>
    <div class="grid">
      <div>
        <div class="colName">访问端</div>
        <div class="terminalList">
          <a-empty v-if="!productTerminal.length" description="当前暂无访问端数据"></a-empty>
          <div v-else>
            <a-checkbox-group v-model:value="checkedTerminalIds">
              <template v-for="item in productTerminal" :key="item.id">
                <div class="checkboxCtr" @click="checkedTerminal(item)" :class="[clickTerminal === item.id ? 'active' : '']">
                  <a-checkbox :value="item.id" @change="changeTerminal"></a-checkbox>
                  <span class="pl1 content" :title="item.name">
                    {{ item.name }}
                  </span>
                </div>
              </template>
            </a-checkbox-group>
          </div>
        </div>
      </div>
      <div>
        <div class="colName">应用</div>
        <div class="appList">
          <a-empty v-if="!clickTerminal" description="请选择访问端"></a-empty>
          <div v-else>
            <a-empty v-if="!terminalApp.length" description="当前暂无应用数据"></a-empty>
            <a-checkbox-group v-model:value="checkedApp" v-else key="121212">
              <template v-for="item in terminalApp" :key="item.id">
                <div class="checkboxCtr" @click.stop="clickApp(item)" :class="clickAppId === item.id ? 'active' : ''">
                  <a-checkbox :value="item.id" @change="appChecked"></a-checkbox>
                  <span class="pl1">
                    {{ item.name }}
                  </span>
                </div>
              </template>
            </a-checkbox-group>
          </div>
        </div>
      </div>
      <div>
        <div class="colName">菜单</div>
        <div class="menuList">
          <a-empty v-if="!clickAppId" description="请选择应用"></a-empty>
          <div v-else>
            <a-table
              v-if="menuTable.length"
              :dataSource="menuTable"
              :columns="columns"
              :row-selection="rowSelection"
              :expandedRowKeys="expandedRowKeys"
              :rowKey="'id'"
              :pagination="false"
              @expand="iconClick"
              :scroll="{ y: tableScrollY }"
            >
              <template #expandIcon="{ record, expanded }">
                <IconFont
                  v-if="record.children && record.children.length > 0"
                  :type="expandedRowKeys.includes(record.id) ? 'icon-xiangxia' : 'icon-xiangyou'"
                  @click="iconClick(!expanded, record)"
                />
              </template>
              <template #action="{ record }">
                <a-button type="link" v-if="!record.children.length" @click="openModal(record)">配置功能</a-button>
                <a-button type="link" v-else disabled>配置功能</a-button>
              </template>
              <!-- <template #functional-permissions="{ record }">
                <a-checkbox :value="item.functionId" v-model:checked="item.checked"
                  :disabled="!rowSelection.selectedRowKeys.includes(record.id)" v-for="item in record.functions"
                  :key="item.functionId" @change="(e) => handleFunctionChange(e, item)">{{ item.functionName
                  }}</a-checkbox>
              </template>
              <template #data-permissions="{ record }">
                <a-radio-group v-model:value="record.checkedDataRole"
                  :disabled="!rowSelection.selectedRowKeys.includes(record.id)"
                  @change="(e) => handleDataRoleChange(e, record)">
                  <a-radio :value="item.code" v-for="item in record.dataPermissions" :key="item.code">
                    <span @click="() => handleClickDataRole(item.code, record)">{{
                      item.name
                      }}</span>
                  </a-radio>
                </a-radio-group>
              </template> -->
            </a-table>
            <a-empty v-else description="当前应用暂无菜单" />
          </div>
        </div>
      </div>
    </div>
    <div class="buttonCtr">
      <a-space>
        <a-button @click="cancel">返回</a-button>
      </a-space>
    </div>
    <!-- 部门选择 -->
    <a-modal
      v-model:visible="visible"
      title="功能配置"
      centered
      @ok="submit"
      @cancel="cancelModal"
      okText="确定"
      cancelText="取消"
      :footer="null"
      :getContainer="() => $refs.ctr"
      :width="700"
    >
      <template v-if="menuF.length">
        <a-checkbox-group v-model:value="funcValue">
          <a-checkbox v-for="item in menuF" :key="item.id" :value="item.id" @change="(e) => checkFun(e, item)">{{ item.name }}</a-checkbox>
        </a-checkbox-group>
      </template>
      <template v-else>
        <a-empty description="当前菜单暂无功能" />
      </template>
    </a-modal>
    <a-modal
      v-model:visible="customDeptVisible"
      title="自定义部门"
      centered
      @ok="saveCustomDept"
      @cancel="cancelCustom"
      okText="确定"
      cancelText="取消"
      :getContainer="() => $refs.ctr"
      :confirmLoading="deptLoading"
      :width="700"
    >
      <div>
        <a-table
          :columns="deptColumns"
          :expandedRowKeys="expandedRowDeptKeys"
          rowKey="id"
          @expand="iconDeptClick"
          :data-source="deptTableSource"
          :row-selection="rowSelectionDept"
        >
          <template #expandIcon="{ record, expanded }">
            <IconFont
              v-if="record.children && record.children.length > 0"
              :type="expandedRowDeptKeys.includes(record.id) ? 'icon-xiangxia' : 'icon-xiangyou'"
              @click="iconDeptClick(!expanded, record)"
            />
          </template>
        </a-table>
      </div>
    </a-modal>
  </div>
</template>
<script lang="jsx">
import { defineComponent, reactive, onMounted, toRefs, computed, watch, getCurrentInstance, unref, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
const ruleConfigAppCode = [
  "WORK_REPORT",
  "PROPERTY_MANAGEMENT",
  "PERSONNELMANAGEMENT",
  "ATTENDANCE_MANAGE",
  "",
  "ATTENDANCE_MANAGEMENT",
  "OFFICIAL_MANAGEMENT",
  "ELECTRONIC_PATROL",
];
const ruleConfigMenuCode = [
  "attendanceResult",
  "sxcl",
  "XGJX",
  "XGRW",
  "HBZX",
  "kjhztj",
  "kqhzytj",
  "KQMRTJ",
  "YGZTB",
  "personnel-approval-record",
  "attendance-statistics",
  "overtimePay",
  "gdzx",
  "zcqd",
  "attendance-approval-record",
];
export default defineComponent({
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { proxy } = getCurrentInstance();
    const id = route.query.id;
    const productId = route.query.productId;
    const visible = ref(false);
    const customDeptVisible = ref(false);
    const state = reactive({
      productTerminal: [],
      clickTerminal: "",
      deptTableSource: [],
      checkedApp: [],
      checkedAppCode: "",
      selectedDeptKeys: [],
      checkedTerminalIds: [],
      terminalIndex: "",
      terminalApp: [],
      clickAppId: "",
      menuTable: [],
      deptLoading: false,
      deptColumns: [
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
      ],
      columns: [
        {
          dataIndex: "name",
          title: "名称",
          align: "left",
          ellipsis: true,
          width: 150,
        },
        // {
        //   title: "功能权限",
        //   align: "left",
        //   slots: { customRender: "functional-permissions" },
        // },
        // {
        //   title: "数据权限",
        //   align: "left",
        //   slots: { customRender: "data-permissions" },
        // },
      ],
      expandedRowKeys: [],
      selectedRowKeys: [],
      expandedRowDeptKeys: [],
      menuF: [],
      checkedRecordId: "",
      deptPermissonCode: {
        menuId: "",
        permissionCode: "",
      },
      tableScrollY: 700,
    });

    let funcValue = ref([]);

    const ctr = ref();
    const dept = ref();

    state.name = route.query.name;
    const cancelCustom = () => {
      customDeptVisible.value = false;
    };
    const saveCustomDept = async () => {
      if (!state.selectedDeptKeys.length) return proxy.$message.error("请选择部门后设置");
      if (state.selectedDeptKeys.length > 30) return proxy.$message.error("不能选择超过30个部门设置");
      state.deptLoading = true;
      const params = {
        id: id,
        terminalId: state.clickTerminal,
        menuId: state.deptPermissonCode.menuId,
        applicationId: state.clickAppId,
        permissionCode: state.deptPermissonCode.permissionCode,
        businessKeys: state.selectedDeptKeys.join(","),
      };
      // 选中
      await proxy.$api.updateMenuDataRole("post", params);
      await getCheckedAppMenu();
      proxy.$message.success("设置成功");
      state.deptLoading = false;
      state.selectedDeptKeys = [];
      customDeptVisible.value = false;
    };

    const getDeptList = async () => {
      const params = {
        name: "",
      };
      const data = await proxy.$api.organizations("get", params);
      state.deptTableSource = data;
    };

    const ignoreList = [
      "bimops-manage-web",
      "bimops-manage-app",
      "command-dispatch-app",
      "two-dimensional-configuration",
      "three-dimensional-visualization",
      "inspection-command-screen-app",
      "grain-storage-cockpit-app",
    ];
    const getProductTerminal = async () => {
      const data = await proxy.$api.productTerminal("get", {
        pageNumber: 1,
        pageSize: 1000,
        // productId: productId,
      });
      let terminals = [];
      if (data && data.records) {
        terminals = data.records;
      } else {
        terminals = data || [];
      }
      const filteredTerminals = terminals.filter((item) => ignoreList.includes(item.code));
      state.productTerminal = filteredTerminals;
    };

    const getRoleTerminal = async (id) => {
      const params = {
        id: id,
        pageNumber: 1,
        pageSize: 1000,
      };
      const data = await proxy.$api.getRoleTerminal("get", params);
      if (data && data.records) {
        state.checkedTerminalIds = data.records.map((item) => item.id);
      } else {
        state.checkedTerminalIds = data.map((item) => item.id);
      }
    };

    const terminalCheckedApp = async (id, terminalId) => {
      const data = await proxy.$api.roleTerminalCheckedApp("get", {
        id: id,
        terminalId: terminalId,
      });
      if (data && data.records) {
        state.checkedApp = data.records.map((item) => item.id);
      } else {
        state.checkedApp = data.map((item) => item.id);
      }
    };

    // 访问端已关联的应用 ifIsAppChecked表示从appChecked方法触发
    const getTerminalApp = async (id, ifIsAppChecked = false) => {
      const data = await proxy.$api.terminalCheckedApp("get", id);
      if (data && data.records) {
        state.terminalApp = data.records;
      } else {
        state.terminalApp = data;
        if (data.length > 0) {
          if (!ifIsAppChecked) {
            if (state.checkedApp.includes(state.terminalApp[0].id)) {
              state.clickAppId = state.terminalApp[0].id;
              await getMenu({
                terminalId: state.clickTerminal,
                applicationId: state.terminalApp[0].id,
              });
              getCheckedAppMenu();
            }
          }
        } else {
          state.menuTable = [];
        }
      }
    };

    const getCheckedAppMenu = async () => {
      const data = await proxy.$api.appCheckedMenu("get", {
        id: id,
        terminalId: state.clickTerminal,
        applicationId: state.clickAppId,
      });
      if (data && data.records) {
        state.selectedRowKeys = data.records.map((item) => item.id);
      } else {
        // 配置表格选中回显
        state.selectedRowKeys = data.map((item) => item.id);
        const handledData = handleTreeData(state.menuTable);
        handleTableData(handledData, data);
        //  处理数据
        function handleTableData(tableData, data) {
          const handleCheckData = data.map((item) => item.id);
          for (const item of tableData) {
            if (handleCheckData.includes(item.id)) {
              const itemIndex = handleCheckData.indexOf(item.id);
              const checkedItem = data[itemIndex];
              const checkedIds = checkedItem.functions.map((item) => item.functionId);
              item.functions = item.functions.map((item) => {
                return {
                  ...item,
                  checked: checkedIds.includes(item.functionId),
                };
              });
              // 是否有数据权限
              const hasDataPermission = Boolean(checkedItem.dataPermissions.length);
              const permissionIndex = 0;
              item.checkedDataRole = hasDataPermission ? checkedItem.dataPermissions[permissionIndex].code : "";
              if (hasDataPermission) {
                const hasBusinessKeys = checkedItem.dataPermissions[permissionIndex].businessKeys;
                item.checkedDeptRole = hasBusinessKeys ? checkedItem.dataPermissions[0].businessKeys.split(",") : [];
              } else {
                item.checkedDeptRole = [];
              }
            }
          }
        }
      }
    };
    const handleTreeData = (source) => {
      let res = [];
      source.forEach((el) => {
        res.push(el);
        el.children && res.push(...handleTreeData(el.children));
      });
      return res;
    };
    const GetTreeData = (data) => {
      let TreeData = [];
      let map = new Map(); //存在id,对应所在的内存地址
      let outputObj, pid;
      for (let i = 0; i < data.length; i++) {
        pid = data[i].parentId;
        if (map.has(pid)) {
          //存在，将些信息，加入到对应id=pid的对象上的children
          if (!map.get(pid).children) map.get(pid).children = [];
          let obj = new Object(data[i]);
          map.get(pid).children.push(obj);
          //通过pid在Map中查找，并将当前对象，加入到对应的childres属性
          map.set(data[i].id, obj);
          //重点(必须也加入Map)：将当前id及对应的对象，存入Map对象中
        } else if (!map.has(pid) && pid === null) {
          //这里处理pid不存在，且pid 为0的处理，pid不存在，且不为0的，程序不考虑这种情况
          outputObj = new Object(data[i]);
          //加入到要返回的数组中
          TreeData.push(outputObj);
          //将id添加到Map中
          map.set(data[i].id, outputObj);
        }
      }
      return TreeData;
    };
    const getMenu = async (params) => {
      const setParams = {
        ...params,
        pageSize: 1000,
        pageNumber: 1,
        enabled: true,
      };
      const data = await proxy.$api.getMenu("get", setParams);
      if (data && data.records) {
        state.menuTable = data.records;
        state.expandedRowKeys = data.records.map((item) => item.id);
      } else {
        state.menuTable = handleMenuData(data);
        state.expandedRowKeys = data.map((item) => item.id);
      }
    };

    // 递归处理菜单数据
    const handleMenuData = (data = []) => {
      for (const item of data) {
        if (!item.children.length) {
          item.checkedDataRole = "";
          if (ruleConfigAppCode.includes(state.checkedAppCode) && ruleConfigMenuCode.includes(item.code)) {
            item.dataPermissions && item.dataPermissions.reverse();
          } else {
            item.dataPermissions = [];
          }
        } else {
          handleMenuData(item.children);
        }
      }
      return data;
    };
    const handleFunctionChange = async (e, item) => {
      const { target } = e;
      const { menuId } = item;
      let params = {
        id: id,
        terminalId: state.clickTerminal,
        menuId,
        applicationId: state.clickAppId,
        functionId: target.value,
      };
      // 选中
      await proxy.$api.updateMenuFunctionRole(target.checked ? "post" : "delete", params);
      proxy.$message.success("操作成功");
    };
    const handleClickDataRole = (permissionCode, record) => {
      if (permissionCode !== "CUSTOM_DEPT") return;
      customDeptVisible.value = true;
      state.selectedDeptKeys = record.checkedDeptRole;
      state.deptPermissonCode.menuId = record.id;
      state.deptPermissonCode.permissionCode = permissionCode;
    };
    const handleDataRoleChange = async (e, record) => {
      const { target } = e;
      if (target.value === "CUSTOM_DEPT") {
        customDeptVisible.value = true;
        state.selectedDeptKeys = [];
        state.deptPermissonCode.menuId = record.id;
        state.deptPermissonCode.permissionCode = target.value;
        return;
      }
      const params = {
        id: id,
        terminalId: state.clickTerminal,
        menuId: record.id,
        applicationId: state.clickAppId,
        permissionCode: target.value,
      };
      // 选中
      await proxy.$api.updateMenuDataRole("post", params);
      proxy.$message.success("操作成功");
    };
    const checkedTerminal = (item) => {
      if (state.checkedTerminalIds.includes(item.id)) {
        state.clickTerminal = item.id;
        getTerminalApp(item.id);
        terminalCheckedApp(id, item.id);
      }
    };

    const changeTerminal = async (e) => {
      if (e.target.checked) {
        state.clickTerminal = e.target.value;
        terminalCheckedApp(id, e.target.value);
      } else {
        state.clickTerminal = "";
      }
      await proxy.$api.roleTerminal(e.target.checked ? "post" : "delete", {
        id: id,
        terminalId: e.target.value,
      });
      proxy.$message.success("操作成功");
      getRoleTerminal(id);
    };

    const appChecked = async (e) => {
      if (e.target.checked) {
        state.clickAppId = e.target.value;
        getCheckedAppMenu();
      } else {
        state.clickAppId = "";
      }
      await proxy.$api.roleTerminalApp(e.target.checked ? "post" : "delete", {
        id: id,
        terminalId: state.clickTerminal,
        applicationId: e.target.value,
      });
      await proxy.$message.success("操作成功");
      getTerminalApp(state.clickTerminal, true);
    };

    const clickApp = (item) => {
      setTimeout(async () => {
        if (state.checkedApp.includes(item.id)) {
          state.clickAppId = item.id;
          state.checkedAppCode = item.code;
          await getMenu({
            terminalId: state.clickTerminal,
            applicationId: item.id,
          });
          getCheckedAppMenu();
        }
      }, 0);
    };

    const iconClick = (expanded, record) => {
      if (expanded) {
        state.expandedRowKeys.push(record.id);
      } else {
        state.expandedRowKeys = state.expandedRowKeys.filter((item) => item !== record.id);
      }
    };
    const iconDeptClick = (expanded, record) => {
      if (expanded) {
        state.expandedRowDeptKeys.push(record.id);
      } else {
        state.expandedRowDeptKeys = state.expandedRowDeptKeys.filter((item) => item !== record.id);
      }
    };

    const rowSelection = computed(() => {
      return {
        type: "checkbox",
        selectedRowKeys: unref(state.selectedRowKeys),
        // onChange: checkedMenu,
        onSelect: selectedMenu,
        onSelectAll: checkedAll,
      };
    });
    const rowSelectionDept = computed(() => {
      return {
        type: "checkbox",
        selectedRowKeys: unref(state.selectedDeptKeys),
        onSelect: (record, selected, selectedRows) => {
          if (selected) {
            state.selectedDeptKeys.push(record.id);
          } else {
            state.selectedDeptKeys = state.selectedDeptKeys.filter((item) => item !== record.id);
          }
          record.checkedDeptRole = state.selectedDeptKeys;
        },
        onSelectAll: (selected, selectedRows, changeRows) => {
          if (selected) {
            state.selectedDeptKeys = selectedRows.map((item) => item.id);
          } else {
            state.selectedDeptKeys = [];
          }
        },
      };
    });

    const checkedAll = async (selected, selectedRow, changeRow) => {
      if (selected) {
        state.selectedRowKeys = selectedRow.map((item) => item.id);
        // 全选
        await proxy.$api.roleAppMenuSelectAll("post", {
          id: id,
          terminalId: state.clickTerminal,
          applicationId: state.clickAppId,
        });
        proxy.$message.success("操作成功");
      } else {
        state.selectedRowKeys = [];
        // 全删
        await proxy.$api.roleAppMenuSelectAll("delete", {
          id: id,
          terminalId: state.clickTerminal,
          applicationId: state.clickAppId,
        });
        proxy.$message.success("操作成功");
      }
    };

    const selectedMenu = async (record, selected) => {
      // 选中
      if (selected) {
        state.selectedRowKeys.push(record.id);
      }
      // 取消选中
      else {
        state.selectedRowKeys = state.selectedRowKeys.filter((item) => item !== record.id);
      }
      await proxy.$api.roleAppMenu(selected ? "post" : "delete", {
        id: id,
        terminalId: state.clickTerminal,
        applicationId: state.clickAppId,
        menuId: record.id,
      });
      await proxy.$message.success("操作成功");
      getCheckedAppMenu();
    };

    const checkedMenu = (record, selectedRows) => {
      state.selectedRowKeys = record;
    };

    const cancel = () => {
      router.back(-1);
    };

    const cancelModal = () => {
      visible.value = false;
    };

    const saveConfig = () => {};

    const openModal = async (record) => {
      state.checkedRecordId = record.id;
      // 获取当前菜单的功能
      const data = await proxy.$api.menuFunc("get", record.id);
      // 获取当前已经绑定的功能
      const resp = await proxy.$api.roleMenuFunc("get", {
        id: id,
        menuId: record.id,
      });
      funcValue.value = resp.length ? resp.map((item) => item.id) : [];
      state.menuF = data;
      // 获取当前菜单的功能
      visible.value = true;
    };

    const getCheckedFun = async () => {
      const data = await proxy.$api.reactive("get", checkedRecordId);
    };

    const checkFun = async (e, record) => {
      if (e.target.checked) {
        // await state.funcValue.concat([e.target.value]);
        await proxy.$api.menuFuncAdd("post", {
          menuId: state.checkedRecordId,
          id: id,
          functionId: e.target.value,
        });
        funcValue.value = [...funcValue.value, e.target.value];
        proxy.$message.success("操作成功");
      } else {
        await proxy.$api.menuFuncAdd("delete", {
          menuId: state.checkedRecordId,
          id: id,
          functionId: e.target.value,
        });
        proxy.$message.success("操作成功");
        funcValue.value = funcValue.value.filter((item) => item !== e.target.value);
      }
    };

    onMounted(() => {
      // if (productId) {
      getProductTerminal();
      getRoleTerminal(id);
      getDeptList();
      // }
      state.tableScrollY = document.querySelector(".menuList") ?? offsetHeight ?? 700;
    });

    return {
      dept,
      ctr,
      visible,
      funcValue,
      customDeptVisible,
      ...toRefs(state),
      cancel,
      checkFun,
      openModal,
      saveConfig,
      cancelModal,
      checkedTerminal,
      cancelCustom,
      saveCustomDept,
      changeTerminal,
      rowSelection,
      rowSelectionDept,
      appChecked,
      iconClick,
      clickApp,
      iconDeptClick,
      handleFunctionChange,
      handleDataRoleChange,
      handleClickDataRole,
    };
  },
});
</script>
<style lang="less" scoped>
#components-grid-demo-flex {
  height: 100%;

  .productName {
    text-align: center;
    width: 100%;
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid #eee;
  }

  .grid {
    width: 100%;
    height: calc(100% - 100px);
    display: grid;
    overflow: hidden;
    grid-template-columns: 1fr 1fr 4.5fr;

    > div {
      height: 100%;
      overflow: hidden;
    }

    .terminalList,
    .appList,
    .menuList {
      height: calc(100% - 40px);
      overflow: hidden;

      > div {
        height: 100%;
        overflow: overlay;
      }

      :deep(.ant-checkbox-group) {
        width: 100%;
        height: 100%;

        .checkboxCtr {
          width: 100%;
          height: 32px;
          text-align: left;
          padding: 0 16px;
          cursor: pointer;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .colName {
      width: 100%;
      height: 40px;
      line-height: 40px;
      text-align: center;
      border-bottom: 1px solid #eee;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        padding: 5px;
        cursor: pointer;
        text-align: left;
        padding: 5px 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        &:hover {
          background-color: rgba(24, 143, 255, 0.534);
        }

        &.active {
          background-color: rgba(24, 143, 255, 0.534);
        }
      }
    }
  }

  .active {
    background-color: rgba(24, 143, 255, 0.534);
  }

  .buttonCtr {
    width: 100%;
    height: 60px;
    line-height: 60px;
    border-top: 1px solid #eee;
    text-align: right;
    padding-right: 10px;
  }
}

:deep(.ant-empty) {
  padding: 20px;

  .ant-empty-image svg {
    width: 100%;
  }
}

:deep(.ant-modal) {
  max-height: 600px !important;

  .ant-checkbox-group {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: repeat(4, 1fr);

    .ant-checkbox-wrapper {
      height: 32px;
      margin-left: 0;
    }
  }
}
</style>
