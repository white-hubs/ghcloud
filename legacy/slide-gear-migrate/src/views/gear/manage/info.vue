<template>
  <g-table :pageSizeOptions="['10', '20', '50', '100']" tableCode="GEAR_INFO" :title="pageTitle" editMode="page"
    :columns="columns" :search="search" :api="api" :slots="slots" rowSelection :btns="btns" ref="tableRef"
    :beforeGet="beforeGet" @slot="operation" :isShowMore="false" :scrollX='1400'>
    <template #content-left>
      <div class="charge-type">
        <a-input-search v-model:value="searchValue" style="margin-bottom: 8px" placeholder="搜索" />
        <a-tree :tree-data="treeData" :auto-expand-parent="autoExpandParent" v-model:expandedKeys="expandedKeys"
          v-model:selectedKeys="selectedKeys" v-model:checkedKeys="checkedKeys" @select="selectTree">
          <template #title="{ title }">
            <span v-if="title.indexOf(searchValue) > -1">
              {{ title.substr(0, title.indexOf(searchValue)) }}
              <span style="color: #f50">{{ searchValue }}</span>
              {{ title.substr(title.indexOf(searchValue) + searchValue.length) }}
            </span>
            <span v-else>{{ title }}</span>
          </template>
        </a-tree>
      </div>

    </template>
    <template #header-btns>
      <div class="import">
        <a-button type="primary" @click="batchDownloadCode" :loading="codeLoading">批量下载二维码</a-button>
        <a-button type="primary" @click="downloadTemplate" :loading="downloadLoading">下载模板</a-button>
        <a-upload :customRequest="customRequest" :showUploadList="false">
          <a-button type="primary" :loading="importLoading">批量导入</a-button>
        </a-upload>
        <a-button type="primary" :loading="exportLoading" @click="batchExportExcel">批量导出</a-button>
      </div>
    </template>
  </g-table>
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
import { rentAttr, types, uploadFileStateList } from "@/utils/enumerate";
import { Image, Modal } from 'ant-design-vue'
import { generateBatch } from '@/api/identity'
import { tableExportExcel } from '@ghcloud/cube-utils'
import _ from 'lodash'
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
let tableParams = {

}
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const tableRef = ref();
    const autoExpandParent = ref(true);
    const state = reactive({
      downloadLoading: false,
      importLoading: false,
      exportLoading: false,
      codeLoading: false,
      columns: [
        {
          dataIndex: "code",
          title: "档位编号",
          width: 100,
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
          width: 100,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "visualizationCode",
          title: "模型编码",
          width: 120,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "typeName",
          title: "档位类型",
          width: 100,
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
          width: 150,
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
          title: "所属部门",
          slots: {
            customRender: "deptNames",
          },
          width: 100,
          customRender: ({ text }) => {
            const value = text && text.length ? text.join("/") : "--";
            return (
              <PopOver position="topLeft" content={value}>
                {value}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "masterName",
          title: "档主名称",
          slots: {
            customRender: "masterName",
          },
          width: 100,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : "--"}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "masterPhone",
          title: "档主联系方式",
          slots: {
            customRender: "masterPhone",
          },
          width: 150,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : "--"}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "leaseType",
          key: "leaseType",
          title: "出租属性",
          slots: {
            customRender: "leaseType",
          },
          width: 100,
          ellipsis: true,
        },
        {
          dataIndex: "leased",
          key: "leased",
          title: "出租状态",
          slots: {
            customRender: "leased",
          },
          width: 100,
          ellipsis: true,
        },
        {
          dataIndex: "enabled",
          key: "enabled",
          title: "启用状态",
          slots: {
            customRender: "enabled",
          },
          width: 100,
          ellipsis: true,
        },
        {
          dataIndex: "files",
          key: "files",
          title: "附件",
          slots: {
            customRender: "files",
          },
          width: 200,
          customRender: ({ text }) => {
            if (!text || !text.length) {
              return (
                <PopOver position="topLeft" content={"--"}>
                  {"--"}
                </PopOver>
              );
            } else {
              const pdfFile = text.findIndex(item => item.type === 'pdf');
              const otherFile = text.findIndex(item => item.type !== 'pdf');
              return <div style="display: flex; flex-wrap: wrap; gap: 10px">
                {pdfFile > -1 && <a style="display:block;white-space:nowrap; overflow: hidden; text-overflow:ellipsis" target="_blank" href={text[pdfFile].path}>{text[pdfFile].name}</a>}
                {otherFile > -1 && <Image width='80px' height="80px" src={text[otherFile].path} />}
              </div>
            }
          },
        },
        {
          title: "操作",
          dataIndex: 'action',
          slots: {
            customRender: "action",
          },
        },
      ],
      search: [
        {
          label: "档位类型",
          placeholder: "请选择",
          value: "type",
          component: "g-select",
          url: "getBoothTypeList",
          field: { id: "value", name: "label" },
          width: '150px'
        },
        {
          label: "出租属性",
          placeholder: "请选择",
          value: "leaseType",
          component: "a-select",
          defaultValue: " ",
          width: '150px',
          options: replaceObjectKeys(rentAttr, {
            name: "label",
            value: "value",
          }),
        },
        {
          label: "出租状态",
          placeholder: "请选择",
          value: "leased",
          component: "a-select",
          defaultValue: " ",
          width: '150px',
          options: replaceObjectKeys(rentAttr, {
            name: "label",
            value: "value",
          }),
        },
        {
          label: "档位状态",
          placeholder: "请选择",
          value: "enabled",
          width: '150px',
          component: "a-select",
          defaultValue: " ",
          options: replaceObjectKeys(types, {
            name: "label",
            value: "value",
          }),
        },
        {
          label: "所属部门",
          value: "departmentId",
          url: "deptList",
          component: "g-select",
          field: { id: "value", name: "label" },
          width: '150px',
          placeholder: "请选择所属部门",
        },
        {
          label: "是否上传附件",
          placeholder: "请选择",
          value: "uploadFileState",
          width: '100px',
          component: "a-select",
          defaultValue: " ",
          options: replaceObjectKeys(uploadFileStateList, {
            name: "label",
            value: "value",
          }),
        },
        {
          label: "",
          value: "keyword",
          width: '190px',
          placeholder: "档位编号/档位名称",
        },
      ],
      btns: ["add", "detail", "edit", "deleteSingle"],
      slots: [
        { slot: "enabled", component: "a-switch" },
        {
          slot: "leaseType",
          component: "a-switch",
          checkedValue: "可租",
          unCheckedValue: "不可租",
        },
        {
          slot: "leased",
          component: "a-switch",
          checkedValue: "已出租",
          unCheckedValue: "未出租",
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
    const batchDownloadCode = async () => {
      if (tableRef.value.selectedRowKeys.length === 0) {
        proxy.$message.warn("请选择要下载的二维码")
        return;
      }
      const params = {
        entityType: 'STALL',
        entityInfo: tableRef.value.selectedRows.map((item) => {
          return {
            entityId: item.id,
            entityName: item.name,
            serialNumber: item.id
          }
        }),
      }
      try {
        state.codeLoading = true
        const res = await generateBatch(params)
        if (res) {
          saveQrcodeZip(res.data ?? res)
        }
      } catch (error) {
        state.codeLoading = false
        message.error(error.errorMessage ?? '操作失败')
      } finally {
        state.codeLoading = false
      }
    }
    const saveQrcodeZip = (data) => {
      const blob = data instanceof Blob ? data : new Blob([data], { type: 'application/zip' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.style.display = 'none'
      link.href = url
      link.download = '二维码.zip'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }
    const batchExportExcel = async () => {
      try {
        state.exportLoading = true
        const result = await getAllData()
        const exportColumns = state.columns.filter(item => !['files', 'action'].includes(item.dataIndex)).map(item => {
          return {
            header: item.title,
            key: item.dataIndex
          }
        })
        await tableExportExcel({
          dataSource: result,
          columns: exportColumns,
          fileName: '档位信息表',
        })
      } finally {
        state.exportLoading = false
      }
    }
    onMounted(() => {
      state.slots = [
        { slot: "enabled", component: "a-switch", },
        {
          slot: "leaseType",
          component: "a-switch",
          checkedValue: "可租",
          unCheckedValue: "不可租",
        },
        {
          slot: "leased",
          component: "a-switch",
          checkedValue: "已出租",
          unCheckedValue: "未出租",
        },
      ]
    })
    const getAllData = async () => {
      const params = {
        ...tableRef.value.form,
        pageSize: 10,
      }
      let currentPage = 1
      let totalPages = 1
      let allData = []
      while (currentPage <= totalPages) {
        const { records, pages } = await proxy.$api.getBooth({ ...params, pageNumber: currentPage })
        const handleRecords = records.map((item) => {
          return {
            ...item,
            leaseType: item.leaseType ? "可租" : "不可租",
            leased: item.leased ? "已出租" : "未出租",
            enabled: item.enabled ? "启用" : "禁用",
            deptNames: item.deptNames?.join("/"),
          };
        })
        allData = [...allData, ...handleRecords]
        currentPage++
        totalPages = pages
      }
      return allData
    }
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
      const filedTitle = {
        leaseType: `是否确认将${record.name}的出租属性改为${record.leaseType ? "可租" : "不可租"}?`,
        leased: `是否确认将${record.name}的出租状态改为${record.leased ? "已出租" : "未出租"}?`,
        enabled: `是否确认将${record.name}的启用状态改为${record.enabled ? "启用" : "禁用"}?`,
      }
      if (['leased', 'leaseType'].includes(slot)) {
        if (!record.enabled) {
          proxy.$message.error("当前档位未启用,请先启用");
          record[slot] = !record[slot];
          return
        }
      }
      Modal.confirm({
        title: '提示',
        content: filedTitle[slot],
        onOk() {
          const item = _.cloneDeep(record);
          item.areaIds = record.area ? record.area.split(",") : [];
          item.areaNames = record.areaNames ? record.areaNames.split(",") : [];
          proxy.$api
            .postStall(item, `put`)
            .then((res) => {
              proxy.$message.success("操作成功");
              tableRef.value.getData();
            })
            .catch(() => {
              record[slot] = !record[slot];
            });
        },
        onCancel() {
          record[slot] = !record[slot];
        }

      })
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
        const res = await proxy.$api.importGearTemplate(formData, 'post')
        if (res.fail > 0) {
          for (const item of res.errorMsg) {
            proxy.$message.error({
              duration: 1,
              content: item
            })
          }

          return
        }
        proxy.$message.success("导入成功");
        tableRef.value?.reset()
      } catch (error) {
      } finally {
        state.importLoading = false
      }
    }
    const beforeGet = (params) => {
      tableParams = params
      return {
        ...params,
      }
    }
    return {
      beforeGet,
      tableRef,
      ...toRefs(state),
      downloadTemplate,
      batchExportExcel,
      customRequest,
      selectTree,
      batchDownloadCode,
      operation,
      autoExpandParent,
      pageTitle
    };
  },
});
</script>

<style lang="less" scoped>
.import {
  display: inline-block !important;
}

:deep(.ant-table-header-column) {
  width: 100%;
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

:deep(.ant-cascader-picker-label) {
  text-align: left
}
</style>
