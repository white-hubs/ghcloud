<template>
  <a-layout>
    <a-layout-content style="background-color: white">
      <div style="padding: 10px">
        <a-table
          :key="showThreeVisualization"
          :columns="columns"
          :data-source="data"
          size="middle"
          :pagination="false"
          :rowKey="(record) => record.id"
          :expandedRowKeys="expandedRowKeys"
          :scroll="{ x: 770, y: tableHeight }"
          @expand="iconExpand"
          :loading="loading"
          class="areaTable"
          :customRow="customRow"
        >
          <template v-slot:title>
            <div class="flex justify-between bottomLine">
              <g-vertical-line :title="pageTitle"></g-vertical-line>
              <div>
                <a-button style="margin-right: 16px" type="primary" @click="handleExport" :disabled="!data.length" :loading="exportLoading"
                  >导出</a-button
                >
                <a-button
                  style="margin-right: 16px"
                  type="primary"
                  @click="
                    () => {
                      importModalRef?.openImportModal();
                    }
                  "
                  >导入</a-button
                >
                <a-button type="primary" @click="AddChild('addHighest')">新增</a-button>
              </div>
            </div>
            <a-form layout="inline" style="padding-top: 16px">
              <a-form-item label="">
                <a-input v-model:value="condition.keyword" placeholder="区域名称" @press-enter="search" allow-clear></a-input>
              </a-form-item>
              <a-form-item>
                <a-space :size="16">
                  <a-button type="primary" @click="search">查询</a-button>
                </a-space>
              </a-form-item>
            </a-form>
          </template>
          <template #sort="{ text, record }">
            <div class="editable-cell">
              <div v-if="editableData[record.id]" class="editable-cell-input-wrapper">
                <a-input-number
                  v-model:value="editableData[record.id].sort"
                  @pressEnter="save(record.id, true)"
                  @blur="save(record.id, true)"
                />
              </div>
              <div v-else class="editable-cell-text-wrapper">
                {{ text === null ? "--" : text }}
                <EditOutlined class="editable-cell-icon" @click="edit(record.id)" />
              </div>
            </div>
          </template>
          <template v-slot:action="{ record }">
            <a-space :size="16">
              <a @click="AddChild(record)" v-if="record.level < 4">新增下级</a>
              <a @click.stop="edit(record.id, true)">编辑</a>
              <a-popconfirm title="是否删除当前选中？" cancelText="取消" okText="确定" @confirm.stop="Delete(record)">
                <a class="deleteRow" @click.stop.prevent>删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </a-table>
      </div>
    </a-layout-content>
  </a-layout>
  <a-modal
    :title="modalTitle"
    centered
    v-model:visible="showModal"
    :width="formState.areaExtend.floorPlanFileId ? 900 : 760"
    destroyOnClose
    :style="{ maxWidth: 'calc(100vw - 32px)' }"
    :body-style="{ maxHeight: '72vh', overflowY: 'auto' }"
    :closable="!submitting && !floorPlanUploading"
    :mask-closable="false"
    :keyboard="!submitting && !floorPlanUploading"
  >
    <a-form ref="formRef" :model="formState" :rules="rules" :disabled="submitting" layout="vertical" class="area-editor">
      <a-row :gutter="16">
        <a-col :xs="24" :md="8">
          <a-form-item label="区域名称" name="name">
            <a-input v-model:value="formState.name" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="16">
          <a-form-item label="区域介绍" :name="['areaExtend', 'introduce']">
            <a-textarea
              v-model:value="formState.areaExtend.introduce"
              :maxlength="300"
              :auto-size="{ minRows: 1, maxRows: 3 }"
              placeholder="请输入区域介绍"
              show-count
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row v-if="showThreeVisualization" :gutter="16">
        <a-col :xs="24" :md="12">
          <a-form-item label="模型区域" name="aliasName">
            <a-input v-model:value="formState.aliasName" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="12">
          <a-form-item label="区域类型" name="visualizationAreaType">
            <a-radio-group :options="visualizationAreaTypeOptions" v-model:value="formState.visualizationAreaType" placeholder="请选择" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-form-item label="平面图与坐标轴" :label-col="{ style: { width: 'auto !important', whiteSpace: 'nowrap' } }">
        <a-form-item-rest>
          <FloorPlanConfig
            ref="floorPlanRef"
            v-model:file-id="formState.areaExtend.floorPlanFileId"
            v-model:file="floorPlanFile"
            v-model:coordinate-axis="formState.areaExtend.coordinateAxis"
            :disabled="submitting"
            @uploading-change="floorPlanUploading = $event"
          />
        </a-form-item-rest>
      </a-form-item>
      <a-form-item label="区域图片" :name="['areaExtend', 'pictureFiles']">
        <gUpload
          :sceneCode="GLOBAL_SCENE_CODE.spaceList"
          :file="imageList"
          v-model:value="formState.areaExtend.pictureFiles"
          :max="10"
          :size="500"
          businessKey="mdata"
        />
      </a-form-item>
      <a-form-item label="视频附件" :name="['areaExtend', 'videoFiles']">
        <gUpload
          :sceneCode="GLOBAL_SCENE_CODE.spaceList"
          :file="videoList"
          v-model:value="formState.areaExtend.videoFiles"
          :max="1"
          listType="text"
          accept=".mp4"
          :size="500"
          businessKey="mdata"
        />
      </a-form-item>
    </a-form>
    <template #footer>
      <a-button key="back" :disabled="submitting || floorPlanUploading" @click="showModal = false">取消</a-button>
      <a-button key="submit" type="primary" :loading="submitting" :disabled="floorPlanUploading" @click="handelModalOk">保存</a-button>
    </template>
  </a-modal>
  <ImportModal ref="importModalRef" @enter="search" />
</template>

<script lang="jsx">
import { CaretDownOutlined, CaretRightOutlined, DownOutlined, UpOutlined, EditOutlined, CheckOutlined } from "@ant-design/icons-vue";
import gVerticalLine from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gVerticalLine.vue";
import { tableColumns, flattenTree } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/utils/common.js";
import { cloneDeep } from "lodash-es";
import { createVNode, defineComponent, getCurrentInstance, nextTick, onMounted, reactive, ref, toRefs } from "vue";

import { useCubeQueryState } from "@ghcloud/cube-app-design";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import { usePageName } from "@ghcloud/cube-utils";

import FloorPlanConfig from "./components/FloorPlanConfig.vue";
import gUpload from "./components/gUpload.vue";
import ImportModal from "./components/import-modal.vue";
import { cubeOuaaService } from "@/api/service";
import { cubeMdataService } from "@/api/service";
import { getDepth, findNodeIndexById, moveNodeInTree } from "@/utils/sort-table";

export default defineComponent({
  components: {
    DownOutlined,
    UpOutlined,
    gVerticalLine,
    EditOutlined,
    CheckOutlined,
    ImportModal,
    gUpload,
    FloorPlanConfig,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const editableData = reactive({});
    const showThreeVisualization = ref(false);
    const { pageTitle } = usePageName();

    const state = reactive({
      columns: [
        {
          mark: "name",
          dataIndex: "name",
          key: "name",
          title: "区域名称",
          customRender: ({ record }) => {
            return record.name || "--";
          },
          ellipsis: true,
        },
        {
          mark: "code",
          dataIndex: "code",
          key: "code",
          title: "区域编号",
          customRender: ({ record }) => {
            return record.code || "--";
          },
          ellipsis: true,
        },
        {
          mark: "aliasName",
          dataIndex: "aliasName",
          key: "aliasName",
          title: "模型区域",
          customRender: ({ record }) => {
            return record.aliasName || "--";
          },
        },
        {
          mark: "visualizationAreaType",
          dataIndex: "visualizationAreaType",
          key: "visualizationAreaType",
          title: "区域类型",
          customRender: ({ record }) => {
            return visualizationAreaTypeOptions.find((e) => e.value === record.visualizationAreaType)?.label || "--";
          },
        },
        {
          title: "操作",
          mark: "action",
          dataIndex: "action",
          key: "action",
          slots: {
            customRender: "action",
          },
          width: 200,
          fixed: "right",
        },
      ],
      data: [],
      icon: createVNode(CaretDownOutlined),
      allArea: [],
      loading: true,
      tableHeight: 0,
      expandedRowKeys: [],
      imageList: [],
      videoList: [],
    });
    const condition = ref({
      keyword: "",
    });
    const queryState = useCubeQueryState({
      storage: "url",
      initialState: { keyword: "" },
      cacheFields: ["keyword"],
      resolveValue: (field, raw) => raw ?? "",
    });
    const visualizationAreaTypeOptions = [
      { label: "楼栋", value: "BUILDING" },
      { label: "楼层", value: "FLOOR" },
      { label: "其他", value: "OTHER" },
    ];
    const formRef = ref();
    const floorPlanRef = ref();
    const floorPlanFile = ref(null);
    const floorPlanUploading = ref(false);
    const submitting = ref(false);
    const formState = reactive({
      id: "",
      name: "",
      children: [],
      areaManagerIds: [],
      areaManagerName: [],
      code: "",
      aliasName: "",
      visualizationAreaType: undefined,
      parentId: null,
      areaExtend: {
        introduce: null,
        pictureFiles: "",
        videoFiles: "",
        floorPlanFileId: null,
        coordinateAxis: null,
      },
    });
    const rules = {
      code: [{ required: true, message: "请输入区域编号", trigger: "blur" }],
      name: [{ required: true, message: "请输入区域名称", trigger: "blur" }],
    };
    const showModal = ref(false);
    const modalTitle = ref("");
    const getTableData = (data) => {
      proxy.$api
        .getAreaList(data, "get")
        .then((res) => {
          state.data = res;
          if (res) {
            state.allArea = flattenTree(res);
          }
        })
        .finally(() => {
          state.loading = false;
        });
    };

    const search = () => {
      state.loading = true;
      queryState.update({ keyword: condition.value.keyword });
      queryState.writeCache();
      getTableData(condition.value);
    };
    const reset = () => {
      condition.value = {
        keyword: "",
      };
      queryState.update({ keyword: "" });
      queryState.clearCache();
      getTableData(condition.value);
    };

    const AddChild = (record) => {
      if (record === "addHighest") {
        formState.parentId = null;
        modalTitle.value = "新增区域";
      } else {
        state.expandedRowKeys.push(record.id);
        ((formState.parentId = record.id), (modalTitle.value = "新增下级-" + record.name));
      }
      state.imageList = [];
      state.videoList = [];
      floorPlanFile.value = null;
      floorPlanUploading.value = false;
      formState.id = "";
      formState.name = "";
      formState.children = [];
      formState.areaManagerIds = [];
      formState.areaManagerName = [];
      formState.code = "";
      formState.aliasName = "";
      formState.visualizationAreaType = undefined;
      formState.areaExtend = {
        introduce: "",
        pictureFiles: "",
        videoFiles: "",
        floorPlanFileId: null,
        coordinateAxis: null,
      };
      showModal.value = true;
      nextTick(() => {
        formRef.value.clearValidate();
      });
    };

    const edit = async (id, openModal = false) => {
      if (openModal) {
        state.imageList = [];
        state.videoList = [];
        floorPlanFile.value = null;
        floorPlanUploading.value = false;
        formState.areaExtend = {
          introduce: "",
          pictureFiles: "",
          videoFiles: "",
          floorPlanFileId: null,
          coordinateAxis: null,
        };
        try {
          const res = await cubeMdataService.getAreaById(id);
          if (res.areaExtend) {
            state.imageList = (res.areaExtend.pictureFiles || []).map((e) => {
              return {
                uid: e.id,
                name: e.name,
                status: "done",
                url: e.path,
              };
            });
            state.videoList = (res.areaExtend.videoFiles || []).map((e) => {
              return {
                uid: e.id,
                name: e.name,
                status: "done",
                url: e.path,
              };
            });
            formState.areaExtend.pictureFiles = (res.areaExtend.pictureFiles || []).map((e) => e.id).join(",");
            formState.areaExtend.videoFiles = (res.areaExtend.videoFiles || []).map((e) => e.id).join(",");
            formState.areaExtend.introduce = res.areaExtend.introduce;
            const floorPlanId = res.areaExtend.floorPlanFileId ?? res.areaExtend.floorPlanFile?.id;
            formState.areaExtend.floorPlanFileId = floorPlanId == null ? null : String(floorPlanId);
            formState.areaExtend.coordinateAxis = res.areaExtend.coordinateAxis || null;
            floorPlanFile.value = res.areaExtend.floorPlanFile || null;
          }
          formState.id = id;
          formState.name = res.name;
          formState.children = res.children;
          formState.areaManagerIds = res.areaManagerIds;
          formState.areaManagerName = res.areaManagerName;
          formState.code = res.code;
          formState.aliasName = res.aliasName;
          formState.visualizationAreaType = res.visualizationAreaType || undefined;
          formState.parentId = res.parentId;
          formState.sort = res.sort;
          showModal.value = true;
          modalTitle.value = "编辑区域";
          nextTick(() => {
            formRef.value.clearValidate();
          });
        } catch (error) {
          proxy.$message.error("获取区域信息失败");
          throw new Error("获取区域信息失败");
        }
      } else {
        editableData[id] = cloneDeep(state.allArea.filter((item) => id === item.id)[0]);
      }
    };
    const Delete = (record) => {
      state.loading = true;
      if (record.children.length) {
        proxy.$message.error("当前区域有下属区域，无法删除");
        state.loading = false;
        return;
      }
      proxy.$api.areaId({ id: record.id }, `delete`).then(() => {
        state.loading = true;
        getTableData(condition.value);
      });
    };

    const save = async (id, rowEdit = false) => {
      if (id && editableData[id]) {
        Object.assign(state.allArea.filter((item) => id === item.id)[0], editableData[id]);
      }
      const params = cloneDeep(rowEdit ? editableData[id] : formState);
      if (rowEdit) delete params.areaExtend;
      if (params.areaExtend) {
        if (typeof params.areaExtend.pictureFiles === "string") {
          params.areaExtend.pictureFiles = params.areaExtend.pictureFiles.split(",").filter((e) => !!e);
        }
        if (typeof params.areaExtend.videoFiles === "string") {
          params.areaExtend.videoFiles = params.areaExtend.videoFiles.split(",").filter((e) => !!e);
        }
      }
      try {
        if (!params.id) {
          await cubeMdataService.insertArea(params);
        } else {
          if (rowEdit) {
            await proxy.$api.area(params, "put");
          } else {
            await cubeMdataService.updateArea(params);
          }
        }
        getTableData(condition.value);
        proxy.$message.success("操作成功");
        try {
          delete editableData[id];
        } catch (error) {}
        return true;
      } catch (error) {
        proxy.$message.error(error?.toJSON?.()?.errorMessage || error?.message || "保存失败，请重试");
        return false;
      }
    };

    const iconExpand = (expanded, record) => {
      if (expanded) {
        state.expandedRowKeys.push(record.id);
      } else {
        if (state.expandedRowKeys.length) {
          state.expandedRowKeys = state.expandedRowKeys.filter((item) => {
            return item !== record.id;
          });
        }
      }
    };

    const handelModalOk = async () => {
      if (submitting.value || floorPlanUploading.value) return;
      try {
        await formRef.value.validate();
      } catch {
        return;
      }
      if (!floorPlanRef.value?.validate()) return;
      submitting.value = true;
      try {
        if (await save(formState.id)) showModal.value = false;
      } finally {
        submitting.value = false;
      }
    };
    const getUserTerminals = async () => {
      const res = await cubeOuaaService.getUserTerminals();
      const terminalCodes = res.map((item) => item.code);
      showThreeVisualization.value = terminalCodes.includes("three-dimensional-visualization");
      if (!showThreeVisualization.value) {
        state.columns = state.columns.filter((item) => {
          return item.key !== "aliasName" && item.key !== "visualizationAreaType";
        });
      }
    };
    onMounted(async () => {
      getUserTerminals();
      condition.value.keyword = queryState.state.keyword;
      getTableData(condition.value);
      await nextTick();
      setTimeout(() => {
        const contentHei = document.querySelector(".view_content .ant-layout-content").clientHeight;
        state.tableHeight = contentHei - 205;
      }, 100);
    });
    const importModalRef = ref();
    const startRecord = ref({});
    const endRecord = ref({});
    const changeData = (list, key, item) => {
      for (let i = 0; i < list.length; i++) {
        const element = list[i];
        if (element.id === key) {
          list[i] = { ...element, ...item };
          return list;
        }
        if (element.children && element.children.length > 0) {
          element.children = changeData(element.children, key, item);
        }
      }
      return list;
    };
    const customRow = (record, index) => {
      return {
        style: {
          cursor: "move",
        },
        onMouseenter: (event) => {
          var ev = event || window.event;
          ev.target.draggable = true;
        },
        onDragstart: (event) => {
          var ev = event || window.event;
          ev.stopPropagation();
          startRecord.value = record;
        },
        onDragover: (event) => {
          var ev = event || window.event;
          ev.preventDefault();
        },
        onDrop: (event) => {
          var ev = event || window.event;
          const startDepth = getDepth(state.data, startRecord.value.id);
          const curDepth = getDepth(state.data, record.id);
          // 非同级不能拖拽
          if (startRecord.value.parentId != record.parentId) {
            if (startDepth === 0 && curDepth === 0) {
              ev.target.draggable = true;
            } else {
              ev.target.draggable = false;
              return false;
            }
          } else {
            ev.target.draggable = true;
          }
          ev.stopPropagation();
          endRecord.value = record;
          let startKey = startRecord.value.id;
          let endKey = endRecord.value.id;
          state.data = moveNodeInTree(state.data, startKey ?? 0, endKey ?? 0);
          // const startIndex = findNodeIndexById(state.data, startKey)
          // const endIndex = findNodeIndexById(state.data, endKey)
          // // 判断拖拽方向
          // if (startIndex < endIndex){
          //   state.data = changeData(state.data, endKey, startRecord.value);
          //   state.data = changeData(state.data, startKey, endRecord.value);
          // } else {
          //   state.data = changeData(state.data, startKey, endRecord.value);
          //   state.data = changeData(state.data, endKey, startRecord.value);
          // }
          handleSaveDrag(state.data);
        },
      };
    };
    const handleSaveDrag = async (areaSortEditDTOList) => {
      try {
        await cubeMdataService.editAreaSort(areaSortEditDTOList);
      } catch (error) {
        const { errorMessage } = error.toJSON();
        proxy.$message.error(errorMessage ?? "操作失败");
      } finally {
        getTableData(condition.value);
      }
    };
    const exportLoading = ref(false);
    const handleExport = async () => {
      try {
        exportLoading.value = true;
        const res = await cubeMdataService.exportArea();
        if (res) {
          const link = document.createElement("a");
          const blob = new Blob([res], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          link.style.display = "none";
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "区域管理.xlsx");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (error) {
        const { errorMessage } = error.toJSON();
        proxy.$message.error(errorMessage ?? "操作失败");
      } finally {
        exportLoading.value = false;
      }
    };
    return {
      ...toRefs(state),
      editingKey: "",
      editableData,
      condition,
      AddChild,
      edit,
      save,
      Delete,
      getTableData,
      search,
      reset,
      iconExpand,
      modalTitle,
      showModal,
      formState,
      rules,
      formRef,
      floorPlanRef,
      floorPlanFile,
      floorPlanUploading,
      submitting,
      handelModalOk,
      showThreeVisualization,
      visualizationAreaTypeOptions,
      fileList: [],
      importModalRef,
      startRecord,
      endRecord,
      changeData,
      customRow,
      handleSaveDrag,
      exportLoading,
      handleExport,
      pageTitle,
      GLOBAL_SCENE_CODE,
    };
  },
});
</script>
<style scoped lang="less">
.area-editor {
  padding: 0 8px;
}
.area-editor :deep(.ant-form-item) {
  margin-bottom: 16px;
}
.area-editor > :deep(.ant-form-item:last-child) {
  margin-bottom: 0;
}

:deep(.ant-table-tbody tr td) {
  &:first-child {
    align-items: center;
    justify-content: flex-start;
    display: flex;

    .ant-input {
      margin: 0px 5px !important;
    }

    > div {
      margin-left: 15px !important;
    }
  }
}

:deep(.ant-tabs-content) {
  height: calc(100% - 45px);
}

:deep(.ant-table-title) {
  padding-top: 0 !important;
}

:deep(.ant-table-body) {
  overflow: overlay;
}

:deep(.ant-table-placeholder) {
  border-bottom: none;
}

:deep(.ant-table-content) {
  border-bottom: none !important;
}

:deep(.ant-table-cell-fix-left) {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

:deep(.ant-table-selection-column) {
  width: 60px !important;
  padding: 5px !important;
}

:deep(.ant-table colgroup > col.ant-table-selection-col) {
  width: 20px;
}

:deep(.ant-table-row .ant-table-row-cell-ellipsis) {
  overflow: visible;
}

.editable-cell {
  position: relative;

  .editable-cell-input-wrapper,
  .editable-cell-text-wrapper {
    padding-right: 24px;
  }

  .editable-cell-text-wrapper {
  }

  .editable-cell-icon,
  .editable-cell-icon-check {
    position: absolute;
    right: 0;
    width: 20px;
    cursor: pointer;
  }

  .editable-cell-icon {
    margin-top: 4px;
    display: none;
  }

  .editable-cell-icon-check {
    line-height: 28px;
  }

  .editable-cell-icon:hover,
  .editable-cell-icon-check:hover {
    color: #108ee9;
  }

  .editable-add-btn {
    margin-bottom: 8px;
  }
}

.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}
// 拖拽
.areaTable tbody,
:deep(.ant-table-tbody) {
  cursor: move;
}
.drop-dragClass {
  cursor: move;
  background: var(--cube-theme-var--primary-color-outline) !important;
}
// 停靠
.drop-ghostClass {
  cursor: move;
  border-bottom: 1px solid var(--electronic-patrol-primary-color) !important;
}
// 选择
.drop-chosenClass:hover > td {
  cursor: move;
  border-bottom: 1px solid var(--electronic-patrol-primary-color) !important;
}
</style>
