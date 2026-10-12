<template lang="pug">
g-layout(title="模型导航")
  template(#content-table)
    a-layout-content.layout-content
        a-layout
            a-layout-sider
                g-vertical-line(title="选择区域")
                //- a-tree(v-if="areaList.length" checkable :tree-data="areaList" :fieldNames="propsDefault" :defaultExpandAll.async="true" @select="changeArea")
                a-tree(@select="changeArea" :expandedKeys="expandedKeys")
                    a-tree-node(v-for="item in areaList" :key="item.id" :title="item.name" :selectable="false")
                        a-tree-node(v-for="element in item.children" :key="element.id" :title="element.name" :class="{'primary-color' : element.id === selectedArea?.key}")
            a-layout-content.model-container
                g-vertical-line(title="导航配置")
                .model-bind 园区模型上位置及视角设置：
                .bim-container
                  BimModel(:bimPath="bimPath" ref="bimModel" @clickedObject="clickedObject" :levelName="levelName")
                .positon-coordinate 当前选择位置：
                    span X轴：{{worldPosition.x}}
                    span Y轴：{{worldPosition.y}}
                    span Z轴：{{worldPosition.z}}
  template(#footer-page)
    a-button(type="primary" @click="submit" :loading="submitLoading") 保存 
</template>
<script>
import gLayout from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gLayout.vue";
import gVerticalLine from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gVerticalLine.vue";
import { defineComponent, onMounted, reactive, toRefs, getCurrentInstance, ref } from "vue";

import BimModel from "./BimModel.vue";
const labelPng = "/resource/v1/bimops-fe-web-migrate-lib/images/label.png";

export default defineComponent({
  components: { gLayout, gVerticalLine, BimModel },
  setup() {
    const { proxy } = getCurrentInstance();
    const bimModel = ref();
    const state = reactive({
      areaList: [],
      propsDefault: {
        label: "name",
        key: "id",
        children: "children",
      },
      selectedArea: null,
      bimPath: null,
      levelName: "",
      expandedKeys: [],
      worldPosition: {
        x: "",
        y: "",
        z: "",
      },
      submitLoading: false,
    });
    // 获取区域
    const getAreaList = async () => {
      const data = await proxy.$api.getAreaList();
      if (data && data.length) {
        state.areaList = data;
        state.expandedKeys = data[0].id;
        const bimData = await proxy.$api.areaBindModelDetail(data[0].id, "get");
        if (bimData && bimData.loadPath) {
          state.bimPath = "/bimresource/" + bimData.loadPath;
          state.levelName = bimData.bimLevelName;
        }
      }
    };
    // 选择二级区域导航
    const changeArea = async (selectedKeys, e) => {
      if (e.selectedNodes.length) {
        const raw = e.selectedNodes?.[0] ?? e.node;
        state.selectedArea = raw?.props?.dataRef ?? raw?.dataRef ?? raw;
        Object.assign(state.selectedArea, { id: state.selectedArea.key });
        bimModel.value.clearItems();
        const data = await proxy.$api.modelNavDetail({
          businessId: state.selectedArea.id,
        });
        if (data && data.navigationConfig) {
          let config = JSON.parse(data.navigationConfig);
          addAreaLabel(config.worldPosition, config.areaInfo);
        }
      }
    };
    // 点击模型构建添加标签
    const clickedObject = (object) => {
      if (state.selectedArea && object?.objectId) {
        addAreaLabel(object.worldPosition, state.selectedArea);
      }
    };
    // 添加区域标签
    const addAreaLabel = (position, labelData) => {
      bimModel.value.clearItems();
      state.worldPosition = position;
      let content = document.createElement("div");
      content.innerHTML = `<div class="label-container"><div class='area-label'>${
        state.selectedArea.title
      }</div><img src=${labelPng}></img></div>`;
      bimModel.value.add2DLabel(content, labelData, state.worldPosition, -50, -52);
    };
    const submit = async () => {
      if (!state.selectedArea) {
        proxy.$message.error("请选择区域添加标签");
      }
      if (!state.worldPosition.x || !state.worldPosition.y || !state.worldPosition.x) {
        proxy.$message.error("请在模型上面添加标签位置");
      }
      state.submitLoading = true;
      let camera = bimModel.value.getCamera();
      let params = {
        businessType: "AREA",
        businessId: state.selectedArea.id,
        navigationConfig: JSON.stringify({
          worldPosition: state.worldPosition,
          camera: camera,
          areaInfo: state.selectedArea,
        }),
      };
      const data = await proxy.$api.addModelNav(params);
      state.submitLoading = false;
      if (data) {
        proxy.$message.success("操作成功！");
      }
    };
    onMounted(() => {
      getAreaList();
    });
    return {
      ...toRefs(state),
      changeArea,
      getAreaList,
      clickedObject,
      submit,
      bimModel,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@/styles/searchTable/index.less");
:deep(.ant-layout-sider) {
  border-right: solid 1px #f0f2f5;
  padding: 10px;
  text-align: left;
  background: #ffffff;
}
:deep(.ant-layout-footer) {
  background: #ffffff;
  padding: 10px 20px;
  text-align: right;
}
.layout-content {
  border-bottom: solid 1px #f0f2f5;
  height: 100%;
  :deep(.ant-tree li .ant-tree-node-content-wrapper.ant-tree-node-selected) {
    background: transparent;
  }
  /deep/ .primary-color .ant-tree-node-content-wrapper {
    // background: @green !important;
    color: #ffffff;
  }
}
.model-container {
  padding: 20px 10px;
  display: flex;
  flex-direction: column;
  text-align: left;
  .model-bind {
    padding: 10px;
    text-align: left;
  }
  .bim-container {
    flex: 1;
  }
  .positon-coordinate {
    span {
      margin-left: 16px;
    }
  }
}
:deep(.label-container) {
  text-align: center;
  min-width: 100px;
  .area-label {
    text-align: center;
    height: 30px;
    line-height: 30px;
    padding: 0 16px;
    background: linear-gradient(270deg, rgba(5, 21, 14, 0) 0%, rgba(5, 22, 15, 0.8) 48%, rgba(5, 19, 13, 0) 100%);
    color: #ffffff;
  }
  img {
    animation: bounce-wodn 1.5s linear infinite;
  }
}
</style>
