<template lang="pug">
g-layout(title="模型视角")
  template(#content-table)
    a-layout-content(class="layout-content")
      .layout-content-left.flex-column
        g-vertical-line(title="选择区域")
        .content-box
          a-tree(v-if="areaList.length" :tree-data="areaList" :fieldNames="propsDefault" :defaultExpandAll.async="true" @select="selectedArea")
      .layout-content-center.flex-column
        g-vertical-line(title="选择模型或模型构建")
        .table-top
          span 当前选中区域：{{selectedAreaName?.name||'--'}}
        a-radio-group(v-model:value="modelType" @change="changeModelType")
          span 选择类型：
          a-radio(value="AREA") 模型绑定
          a-radio(value="ELEMENT") 构建绑定
        div(v-if="modelType === 'ELEMENT'")
          a-form(layout="inline" :model="elementForm")
            a-form-item(name="type")
              a-select(v-model:value="elementForm.bind")
                a-select-option(v-for="item in types" :key="item.value") {{item.label}}
            a-form-item(name="name")
              a-input(v-model:value.trim="elementForm.keyword" placeholder="请输入构建名称" :maxlength="40")
            a-form-item
              a-button(type="primary" @click="clickSearch") 查询
            a-form-item
              a-button(type="default" @click="reset") 重置
          a-table(:columns="columns" :data-source="data" :loading="tabLoading" :customRow="customRow" :rowClassName="rowClassName" size="small" rowKey="id" bordered :pagination="false" :locale="{emptyText: '暂无数据'}" :scroll="{y:280}")
          a-pagination(v-if="page.total>0" v-model:current="page.pageNumber" :total="page.total" :default-current="1"  @change="onShowSizeChange" @showSizeChange="onShowSizeChange")
      .layout-content-right
        .top-container
          g-vertical-line(title="设置视角")
          .tag-list
            span 管理视角：
            a-tag(v-for="(item,index) in tags" closable :key="index"  @close="handleClose(item)" :class="{'primary-color' : selectedTag&&selectedTag.id===item.id}" @click="handleChange(item)") {{item.name}}
            a-tag(@click="showInput" color="success")
              template(#icon)
                PlusOutlined
                span 新增
          div(v-if="inputVisible")
            span 视角名称：
            a-input(
              ref="inputRef"
              type="text"
              size="small"
              :style="{ width: '200px' }"
              v-model:value="inputValue")
        .bim-view
          BimModel(:bimPath="bimPath" ref="bimModel" :levelName="levelName")
  template(#footer-page)
    a-button(type="primary" @click="submit") 保存
</template>
<script lang="jsx">
import { PlusOutlined } from "@ant-design/icons-vue";
import gLayout from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gLayout.vue";
import { Modal } from "ant-design-vue";
import { defineComponent, getCurrentInstance, nextTick, onMounted, reactive, ref, toRefs } from "vue";

import BimModel from "./BimModel.vue";
export default defineComponent({
  components: {
    PlusOutlined,
    gLayout,
    BimModel,
  },
  setup() {
    const inputRef = ref();
    const bimModel = ref();
    const { proxy } = getCurrentInstance();
    const state = reactive({
      propsDefault: {
        label: "name",
        key: "id",
        children: "children",
      },
      areaList: [],
      elementForm: {
        keyword: "",
        bind: "",
      },
      page: {
        total: 0,
        pageNumber: 1,
        pageSize: 10,
      },
      types: [
        {
          label: "全部",
          value: "",
        },
        {
          label: "已绑定",
          value: true,
        },
        {
          label: "未绑定",
          value: false,
        },
      ],
      columns: [
        {
          title: "构建名称",
          dataIndex: "name",
          width: 100,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "构建编号",
          dataIndex: "code",
          width: 100,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "绑定状态",
          dataIndex: "bind",
          width: 100,
          ellipsis: true,
          slots: {
            customRender: "bind",
          },
          customRender: ({ text }) => {
            if (text)
              return (
                <PopOver position="topLeft" content="已绑定">
                  已绑定
                </PopOver>
              );
            else
              return (
                <PopOver position="topLeft" content="未绑定">
                  未绑定
                </PopOver>
              );
          },
        },
      ],
      data: [],
      tabLoading: false,
      bimPath: null,
      currentBim: null,
      selectedAreaName: null,
      modelType: "AREA",
      inputVisible: false,
      inputValue: "",
      tags: [],
      selectedTag: {},
      tableCurrRow: {},
      levelName: "",
    });
    const getAreaList = async () => {
      const data = await proxy.$api.getAreaList();
      if (data) {
        state.areaList = data;
      }
    };
    const selectedArea = async (selectedKeys, e) => {
      if (e.selectedNodes.length) {
        state.tags = [];
        state.inputVisible = false;
        const raw = e.selectedNodes?.[0] ?? e.node;
        state.selectedAreaName = raw?.props?.dataRef ?? raw?.dataRef ?? raw;
        const data = await proxy.$api.areaBindModelDetail(selectedKeys[0], "get");
        if (data && data.loadPath) {
          state.modelType = "AREA";
          state.bimPath = "/bimresource/" + data.loadPath;
          state.levelName = data.bimLevelName;
          state.currentBim = data;
          getViewList(state.selectedAreaName.id);
        }
      }
    };
    const getViewList = async (params) => {
      const data = await proxy.$api.bimViewList({ businessName: params });
      if (data) {
        state.tags = data;
        state.selectedTag = null;
      }
    };
    const changeModelType = async (event) => {
      if (event.target.value === "ELEMENT") {
        if (state.currentBim) {
          getElementList();
          state.tags = [];
        }
      } else {
        getViewList(state.currentBim.modelFileName);
      }
      state.inputVisible = false;
      bimModel.value.review();
    };
    // 获取构建列表
    const getElementList = async () => {
      const data = await proxy.$api.bindViewELementList({
        pageSize: state.page.pageSize,
        pageNumber: state.page.pageNumber,
        ...state.elementForm,
        modelFileId: state.currentBim.modelFileId,
        bimLevelName: state.levelName,
      });
      if (data && data.records) {
        state.tableCurrRow = null;
        state.data = data.records;
        state.page.total = data.total;
      }
    };
    const showInput = () => {
      state.inputVisible = true;
      state.selectedTag = null;
      nextTick(() => {
        inputRef.value.focus();
      });
    };
    const handleChange = (item) => {
      state.inputVisible = true;
      state.selectedTag = item;
      state.inputValue = item.name;
      if (item.viewConfig) {
        bimModel.value.setCameraStatus(JSON.parse(item.viewConfig));
      }
    };
    const reset = () => {
      state.elementForm = {
        keyword: "",
        bind: "",
      };
      state.page.pageNumber = 1;
      getElementList();
    };
    //点击查询
    const clickSearch = () => {
      state.page.pageNumber = 1;
      getElementList();
    };
    const submit = async () => {
      // 没有选择的视角则为新增
      if (!state.selectedTag) {
        if (!state.inputValue) {
          proxy.$message.error("请添加视角名称");
          return;
        }
        // 绑定模型视角
        let camera = bimModel.value.getCamera();
        let params;
        if (state.modelType === "AREA") {
          params = {
            businessType: state.modelType,
            businessName: state.selectedAreaName.id,
            viewConfig: JSON.stringify(camera),
            name: state.inputValue,
          };
        } else if (state.modelType === "ELEMENT") {
          if (!state.tableCurrRow) {
            proxy.$message.error("请选择构建设备");
            return;
          }
          params = {
            businessType: state.modelType,
            businessName: state.tableCurrRow.code,
            viewConfig: JSON.stringify(camera),
            name: state.inputValue,
          };
        }
        const data = await proxy.$api.bimViewBind(params);
        if (data) {
          switch (state.modelType) {
            case "AREA":
              getViewList(state.selectedAreaName.id);
              break;
            case "ELEMENT":
              getViewList(state.tableCurrRow.code);
              break;
          }
          state.inputVisible = false;
          state.inputValue = "";
          proxy.$message.success("操作成功！");
        }
      } else {
        if (!state.inputValue) {
          proxy.$message.error("请添加视角名称");
          return;
        }
        let camera = bimModel.value.getCamera();
        let params = {
          viewConfig: JSON.stringify(camera),
          name: state.inputValue,
          id: state.selectedTag.id,
        };
        const data = await proxy.$api.editBimView(params);
        if (data) {
          switch (state.modelType) {
            case "AREA":
              getViewList(state.selectedAreaName.id);
              break;
            case "ELEMENT":
              getViewList(state.tableCurrRow.code);
              break;
          }
          state.inputVisible = false;
          state.inputValue = "";
          proxy.$message.success("操作成功！");
        }
      }
    };
    const onShowSizeChange = (current, pageSize) => {
      state.page.pageNumber = current;
      state.page.pageSize = pageSize;
      getElementList();
    };
    // 点击行
    const customRow = (record) => {
      return {
        onClick: () => {
          state.inputVisible = false;
          state.tableCurrRow = record;
          bimModel.value.zoomToComponents(record.objectId);
          getViewList(state.tableCurrRow.code);
        },
      };
    };
    // 选中行class
    const rowClassName = (record, index) => {
      return record.id === state.tableCurrRow?.id ? "primary-color-2" : "";
    };
    // 删除视角
    const handleClose = (item) => {
      Modal.confirm({
        title: () => "提示",
        content: () => "是否确认删除该视角?",
        async onOk() {
          const data = await proxy.$api.deleteBimView(item.id);
          if (data) {
            switch (state.modelType) {
              case "AREA":
                getViewList(state.selectedAreaName.id);
                break;
              case "ELEMENT":
                getViewList(state.selectedAreaName.code);
                break;
            }
            proxy.$message.success("操作成功");
          }
        },
        onCancel() {},
      });
    };
    onMounted(async () => {
      await getAreaList();
    });
    return {
      ...toRefs(state),
      selectedArea,
      showInput,
      handleChange,
      submit,
      bimModel,
      inputRef,
      changeModelType,
      getElementList,
      clickSearch,
      onShowSizeChange,
      customRow,
      rowClassName,
      handleClose,
      reset,
    };
  },
});
</script>

<style lang="less" scoped>
.padding {
  padding: 16px;
}

.box {
  border-right: 1px solid #f0f2f5;
  .padding();
}

.layout-content {
  display: flex;
  text-align: left;
  border-bottom: 1px solid #f0f2f5;
  height: 100%;

  &-left {
    // width: 200px;
    flex: 1;
    .box();
  }

  &-center {
    flex: 3;
    .box();

    /deep/ .ant-form {
      margin-top: 16px;
    }

    /deep/ .ant-pagination {
      text-align: right;
      margin-top: 16px;
    }
  }

  &-right {
    flex: 4;
    .padding();
    display: flex;
    flex-direction: column;

    .top-container {
      border-bottom: 1px solid #f0f2f5;
      padding-bottom: 20px;
    }

    .bim-view {
      flex: 1;
      overflow: hidden;
    }
  }

  /deep/ .ant-tree {
    text-align: left;
  }

  .content-box {
    flex: 1;
    overflow: auto;
  }

  .table-top {
    padding: 16px;
    text-align: left;
    border-bottom: 1px solid #f0f2f5;
    margin-bottom: 16px;
  }

  /deep/ .ant-table-wrapper {
    margin-top: 16px;
  }

  .tag-list {
    padding: 20px;

    /deep/ .ant-tag-checkable {
      background: #f0f2f5;
    }
  }
}

.footer {
  text-align: right;
  padding: 10px 20px;
  background: #ffffff;
}
</style>
