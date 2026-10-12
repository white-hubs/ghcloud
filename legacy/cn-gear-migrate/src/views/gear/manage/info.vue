<template lang="pug">
g-table(
  :title="pageTitle"
  editMode="page",
  :columns="columns",
  :search="search",
  :api="api",
  :slots="slots",
  ref="tableRef",
  @slot="operation"
)

  template(#content-left)
    .charge-type
      //- a-input-search(
      //-   v-model:value="searchValue",
      //-   style="margin-bottom: 8px",
      //-   placeholder="搜索"
      //- )
      a-tree(
        :tree-data="treeData",
        :auto-expand-parent="autoExpandParent",
        v-model:expandedKeys="expandedKeys",
        v-model:selectedKeys="selectedKeys",
        v-model:checkedKeys="checkedKeys",
        @select="selectTree"
      )
  template(#header-btns)
    div(class="import")
      a-button(type="primary" @click="downloadTemplate" v-loading="downloadLoading" ) 下载模板
      a-upload(:customRequest="customRequest" :showUploadList="false")
        a-button(type="primary" v-loading="importLoading") 批量导入
</template>

<script lang='jsx'>
import {
  defineComponent,
  reactive,
  ref,
  onMounted,
  toRefs,
  watch,
  getCurrentInstance,
} from "vue";
import { replaceObjectKeys } from "@pansy/utils";
import { rentAttr, types } from "@/utils/enumerate";
import { usePageName } from '@ghcloud/cube-utils'
const { pageTitle } = usePageName()
const dataList = [];

const generateList = (data) => {
  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    const key = node.key;
    dataList.push({
      key,
      title: node.title,
    });

    if (node.children) {
      generateList(node.children);
    }
  }
};

const getParentKey = (key, tree) => {
  let parentKey;

  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];

    if (node.children) {
      if (node.children.some((item) => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }

  return parentKey;
};

export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const tableRef = ref();
    const autoExpandParent = ref(true);
    const state = reactive({
      downloadLoading: false,
      importLoading: false,
      columns: [
        {
          dataIndex: "code",
          title: "档位编号",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "name",
          title: "档位名称",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "areaNames",
          title: "所在区域",
          width: 200,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "deptNames",
          title: "管理部门",
          slots: {
            customRender: "deptNames",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        // {
        //   dataIndex: "leaseType",
        //   key: "leaseType",
        //   title: "出租属性",
        //   slots: {
        //     customRender: "leaseType",
        //   },
        //   // width: 90,
        //   ellipsis: true,
        // },
        // {
        //   dataIndex: "enabled",
        //   key: "enabled",
        //   title: "启用状态",
        //   slots: {
        //     customRender: "enabled",
        //   },
        //   // width: 60,
        //   ellipsis: true,
        // },
        {
          title: "操作",
          slots: {
            customRender: "action",
          },
        },
      ],
      search: [
        // {
        //   label: "档位类型",
        //   placeholder: "请选择",
        //   value: "type",
        //   component: "g-select",
        //   url: "getBoothTypeList",
        //   field: { id: "value", name: "label" },
        // },
        // {
        //   label: "出租属性",
        //   placeholder: "请选择",
        //   value: "leaseType",
        //   component: "a-select",
        //   defaultValue: " ",
        //   options: replaceObjectKeys(rentAttr, {
        //     name: "label",
        //     value: "value",
        //   }),
        // },
        // {
        //   label: "档位状态",
        //   placeholder: "请选择",
        //   value: "enabled",
        //   component: "a-select",
        //   defaultValue: " ",
        //   options: replaceObjectKeys(types, {
        //     name: "label",
        //     value: "value",
        //   }),
        // },
        {
          label: "",
          value: "keyword",
          placeholder: "档位编号/档位名称",
        },
      ],
      slots: [
        { slot: "enabled", component: "a-switch" },
        {
          slot: "leaseType",
          component: "a-switch",
          checkedValue: "可租",
          unCheckedValue: "不可租",
        },
      ],
      api: {
        path: "/gearDetail",
        list: "getBooth",
        deleteSingle: "deleteStall",
      },
      treeData: [],
      expandedKeys: [],
      selectedKeys: [],
      checkedKeys: [],
      searchValue: null,
      autoExpandParent: true,
    });

    const getTreeData = (data) => {
      proxy.$api.getAreaListforBoothInfo(data, "get").then((res) => {
        state.treeData = replaceObjectKeys(res, {
          name: "title",
          id: "key",
          children: "children",
          code: "code",
          level: "level",
          quantity: "quantity",
        });
        generateList(state.treeData);
      });
    };

    onMounted(() => {
      getTreeData();
    });
    watch(
      () => state.searchValue,
      (value) => {
        const expanded = dataList
          .map((item) => {
            if (item.title.indexOf(value) > -1) {
              return getParentKey(item.key, state.treeData);
            }

            return null;
          })
          .filter((item, i, self) => item && self.indexOf(item) === i);
        state.expandedKeys = expanded;
        state.searchValue = value;
        state.autoExpandParent = true;
      }
    );
    const selectTree = (item) => {
      if (item && item.length > 0) {
        tableRef.value.form["areaId"] = item[0];
        tableRef.value.getData();
      } else {
        tableRef.value.form["areaId"] = null;
        tableRef.value.getData();
      }
    };
    const operation = (slot, record) => {
      if (slot === "leaseType" && !record.enabled) {
        proxy.$message.warn("当前状态为禁用");
        tableRef.value.getData();
      } else {
        const item = _.cloneDeep(record);
        item.areaIds = record.area.split(",");
        proxy.$api
          .postStall(item, `put`)
          .then((res) => {
            proxy.$message.success("操作成功");
          })
          .catch(() => {
            record[slot] = !record[slot];
          });
      }
    };
    const downloadTemplate = async () => {
      state.downloadLoading = true
      try {
        const res = await proxy.$api.downloadGearTemplate({}, "get");
        const link = document.createElement("a");
        let blob = new Blob([res], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        link.style.display = "none";
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "档位模板.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        proxy.$message.success("下载成功");
      } catch (error) {
      } finally {
        state.downloadLoading = false
      }

    }
    const customRequest = async (info) => {
      state.importLoading = true;
      try {
        const formData = new FormData();
        formData.append('file', info.file)
        await proxy.$api.importGearTemplate(formData, 'post')
        proxy.$message.success("导入成功");
        tableRef.value.getData();
      } catch (error) {
      } finally {
        state.importLoading = false
      }
    }
    return {
      tableRef,
      ...toRefs(state),
      downloadTemplate,
      customRequest,
      selectTree,
      operation,
      autoExpandParent,
      fileList: [],
      pageTitle
    };
  },
});
</script>

<style lang="less" scoped>
.import {
  display: inline-block !important;
}

.charge-type {
  width: 200px;
  height: 100%;
  margin-right: 10px;
  border: 1px solid #f3f3f3;
  border-bottom: none;
  overflow-y: scroll;
  overflow-y: overlay;

  :deep(.ant-tree) {
    text-align: left;
  }
}
</style>
