<template>
  <a-space :size="8">
    <g-select
      :disabled="type == 'detail' ? true : false"
      :allowClear="false"
      :options="messageTargetOptions"
      :field="{ label: 'label', value: 'value', url: 'url' }"
      v-model:value="initConfig.messageTargetNotify"
      @changeCheck="changeCheck"
      style="width: 160px"
    ></g-select>

    <a-button type="primary" @click="focus" v-if="initConfig.messageTargetNotify != null && type == 'detail' ? false : true">
      {{
        initConfig.messageTargetNotify == "USER"
          ? "选择用户"
          : initConfig.messageTargetNotify == "ROLE"
            ? "选择角色"
            : initConfig.messageTargetNotify == "DEPARTMENT"
              ? "选择部门"
              : ""
      }}
    </a-button>

    <a-tag :closable="type == 'detail' ? false : true" v-for="item in selectedIds" @close="closetag(item)" :key="item">
      <!-- {{ selectedItemData }} -->
      {{
        selectedItemData.find((res) => {
          return res.id == item;
        })?.name
      }}
    </a-tag>
  </a-space>
  <a-modal v-model:visible="modalvisible" title="部门选择" @cancel="cancel" @ok="handleOk">
    <div class="queryCondition">
      <a-input v-model:value.trim="modledept.name" style="width: 300px" placeholder="请输入部门名称" />
      <a-button type="primary" @click="query">查询</a-button>
      <a-button>重置</a-button>
    </div>

    <a-table :pagination="false" :rowKey="(row) => row.id" :row-selection="rowSelection" :columns="columns" :data-source="deptData" />
  </a-modal>
  <modal-table
    title="选择人员"
    :value="modal.visible"
    url="tenantUserList"
    :columns="modal.columns"
    :selectedKeys="selectedIds"
    :disabledKeys="selectedIds"
    :search="modal.search"
    :searchLength="3"
    :width="1300"
    :enabled="true"
    :selectType="'checkbox'"
    @modal-save="chengUser"
    v-model:value="modal.visible"
  ></modal-table>
  <modal-table
    title="选择角色"
    :value="modal.rolevisible"
    url="getRoleList"
    :selectedKeys="selectedIds"
    :disabledKeys="selectedIds"
    :columns="modal.rolecolumns"
    :search="modal.rolesearch"
    :searchLength="3"
    :width="1300"
    :selectType="'checkbox'"
    @modal-save="rolechengUser"
    v-model:value="modal.rolevisible"
  ></modal-table>
</template>
<script>
import { replaceObjectKeys } from "@pansy/utils";
import { defineComponent, onMounted, reactive, toRefs, ref, getCurrentInstance } from "vue";
import { useRoute } from "vue-router";

import { messageTargetOptionsEnum } from "../../../utils/enumerate";
import ModalTable from "./ModalTable.vue";
export default defineComponent({
  props: {
    config: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const { type } = route.query;
    const modalvisible = ref(false);
    const deptData = ref([]);
    const selectref = ref(null);
    const selectKeys = ref([]);
    const modledept = ref({
      name: "",
    });
    const columns = [
      {
        title: "部门名称",
        dataIndex: "name",
        key: "name",
      },
    ];
    const selectedItemData = ref([]);
    const chengUser = (selectedKeys, selectedItems) => {
      selectedItemData.value = [...selectedItemData.value, ...selectedItems];
      if (selectedKeys.length) {
        state.selectedIds = selectedKeys;
        let newArr = selectedItems.map((element) => {
          return {
            userId: window.config.feature && window.config.feature?.usePersonal ? element.userId : element.id,
            userName: element.name,
          };
        });

        state.initConfig.targetConfig = [...state.initConfig.targetConfig, ...newArr];
      }
    };
    const rolechengUser = (selectedKeys, selectedItems) => {
      selectedItemData.value = [...selectedItemData.value, ...selectedItems];

      if (selectedKeys.length) {
        state.selectedIds = selectedKeys;
        state.selectedRowKeys = selectedKeys;
        let newArr = selectedItems.map((element) => {
          return { roleId: element.id, roleName: element.name };
        });
        state.initConfig.targetConfig = [...state.initConfig.targetConfig, ...newArr];
      }
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
            return text === "MALE" ? "男" : "女";
          },
        },
      ];
      if (window.config.feature?.usePersonal) {
        return personalColumns;
      } else {
        return ouaaColumns;
      }
    };
    const state = reactive({
      initConfig: {},
      messageTargetOptions: messageTargetOptionsEnum.filter((item) => item.url),
      selectOptions: [],
      selectedIds: [],
      selectedRowKeys: [],
      modal: {
        visible: false,
        rolevisible: false,
        rolecolumns: [
          {
            title: "角色名称",
            dataIndex: "name",
            key: "name",
          },
        ],
        rolesearch: [
          {
            label: "",
            value: "keyword",
            placeholder: "请输入角色名称",
          },
        ],
        url: "",
        columns: columnsData(),
        search: [],
      },
    });

    const rowSelection = {
      onChange: (selectedRowKeys, option) => {
        state.selectedIds = selectedRowKeys;
        selectedItemData.value = option;
        let newArr = option.map((element) => {
          return {
            departmentId: element.id,
            departmentName: element.name,
          };
        });
        state.initConfig.targetConfig = newArr;
      },
      getCheckboxProps: (record) => {
        return {
          disabled: state.selectedIds.includes(record.id), // 配置默认勾选的列 （Bealean）
          defaultChecked: state.selectedIds.includes(record.id),
        };
      },
    };

    onMounted(() => {
      // proxy.$api.getRoleList().then(res => {
      // });
      state.initConfig = props.config;

      if (state.initConfig.messageTargetNotify) {
        let option = messageTargetOptionsEnum.find((item) => item.value === state.initConfig.messageTargetNotify);

        if (option) {
          proxy.$api[option.url]({ enabled: true, pageSize: 1000 }).then((res) => {
            let data = res.records ? res.records : res;
            state.selectOptions = replaceObjectKeys(data, {
              id: "value",
              name: "label",
            });
            deptData.value = replaceObjectKeys(data, {
              id: "value",
              name: "label",
            });
          });
        }
        switch (state.initConfig.messageTargetNotify) {
          case "DEPARTMENT":
            state.selectedIds = state.initConfig.targetConfig.map((item) => item.departmentId);

            selectedItemData.value = state.initConfig.targetConfig.map((item) => {
              return {
                id: item.departmentId,
                name: item.departmentName,
              };
            });
            break;
          case "USER":
            state.selectedIds = state.initConfig.targetConfig.map((item) => item.userId);
            selectedItemData.value = state.initConfig.targetConfig.map((item) => {
              return {
                id: item.userId,
                name: item.userName,
              };
            });
            break;
          case "ROLE":
            state.selectedIds = state.initConfig.targetConfig.map((item) => item.roleId);
            selectedItemData.value = state.initConfig.targetConfig.map((item) => {
              return {
                id: item.roleId,
                name: item.roleName,
              };
            });
        }
      }
    });
    const focus = (item) => {
      selectKeys.value = state.selectedIds;

      if (state.initConfig.messageTargetNotify == "USER") {
        proxy.$api.tenantUserList().then((res) => {
          let data = res.records ? res.records : res;
          // debugger;
          state.selectOptions = replaceObjectKeys(data, {
            id: "value",
            name: "label",
          });
        });
        proxy.$api.getOrganizations().then((res) => {
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
          // state.selectedRow = record;
          state.modal.visible = true;
        });
      } else if (state.initConfig.messageTargetNotify == "DEPARTMENT") {
        modalvisible.value = true;
        proxy.$api.deptList({ enabled: true }).then((res) => {
          let data = res.records ? res.records : res;
          deptData.value = data;
          state.selectOptions = replaceObjectKeys(data, {
            id: "value",
            name: "label",
          });
        });
      } else {
        proxy.$api.getRoleList({ enabled: true }).then((res) => {
          let data = res.records ? res.records : res;

          state.selectOptions = replaceObjectKeys(data, {
            id: "value",
            name: "label",
          });
          state.modal.rolevisible = true;
          deptData.value = data;
        });
      }

      // selectref.value.blur();
    };
    const changeCheck = (value, option) => {
      proxy.$api[option.url]({ enabled: true }).then((res) => {
        let data = res.records ? res.records : res;
        setTimeout(() => {
          state.selectOptions = replaceObjectKeys(data, {
            id: "value",
            name: "label",
          });
        }, 1000);

        deptData.value = data;
      });
      state.selectedIds = [];
      state.initConfig.targetConfig = [];
    };
    const change = (value, option) => {
      switch (state.initConfig.messageTargetNotify) {
        case "DEPARTMENT":
          state.initConfig.targetConfig = option.map((element) => {
            return {
              departmentId: element.value,
              departmentName: element.label,
            };
          });
          break;
        case "USER":
          state.initConfig.targetConfig = option.map((element) => {
            return { userId: element.value, userName: element.label };
          });
          break;
      }
    };
    const filterOption = (value, option) => {
      return option.label.includes(value);
    };
    const handleOk = () => {
      // state.initConfig.targetConfig = state.selectOptions.map(element => {
      //   return {
      //     departmentId: element.value,
      //     departmentName: element.label,
      //   };
      // });
      // return;
      modalvisible.value = false;
    };
    const cancel = () => {
      modalvisible.value = false;
      state.initConfig.targetConfig = [];
    };
    const query = () => {
      proxy.$api.deptList({ enabled: true, name: modledept.value.name }).then((res) => {
        let data = res.records ? res.records : res;
        state.selectOptions = replaceObjectKeys(data, {
          id: "value",
          name: "label",
        });
        deptData.value = data;
      });
    };
    const closetag = (item) => {
      let findindex = state.selectedIds.findIndex((res) => {
        return res == item;
      });

      let find = state.selectedIds.find((res) => {
        return res == item;
      });
      state.selectedIds.splice(findindex, 1);
      selectedItemData.value.splice(findindex, 1);

      let status = state.initConfig.messageTargetNotify;
      switch (status) {
        case "DEPARTMENT":
          state.initConfig.targetConfig = state.initConfig.targetConfig.filter((res) => {
            return res.departmentId !== find;
          });
          break;
        case "USER":
          state.initConfig.targetConfig = state.initConfig.targetConfig.filter((res) => {
            return res.userId !== find;
          });
          break;
        case "ROLE":
          state.initConfig.targetConfig = state.initConfig.targetConfig.filter((res) => {
            return res.roleId !== find;
          });
        // state.initConfig.targetConfig = state.initConfig.targetConfig.filter(
        //   res => {
        //     res.roleId !== find;
        //   },
        // );
      }
    };
    return {
      selectedItemData,
      query,
      ...toRefs(state),
      handleOk,
      cancel,
      selectref,
      modalvisible,
      changeCheck,
      change,
      filterOption,
      rowSelection,
      type,
      modledept,
      deptData,
      columns,
      chengUser,
      focus,
      rolechengUser,
      selectKeys,
      closetag,
    };
  },
});
</script>

<style scoped>
.queryCondition {
  width: 450px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
