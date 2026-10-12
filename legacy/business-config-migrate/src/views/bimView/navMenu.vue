<template lang="pug">
g-layout(title="业务菜单配置")
  template(#content-table)
    a-layout-content.layout-content
      .tree
        g-vertical-line(title="业务菜单")
        a-tree(
          v-if="businessMenu.length",
          :fieldNames="propsDefault",
          :blockNode="true",
          checkable,
          checkStrictly,
          :selectable="false",
          :tree-data="businessMenu",
          :checkedKeys="checkedMenupKeys",
          :defaultExpandAll.async="true",
          @check="checkMenu"
        )
        a-empty(v-else description="暂无业务菜单")
      .table
        g-vertical-line(title="关联区域")
        a-table(:columns="columns" :rowKey="(record) => record.id" :data-source="data" size="middle" :pagination="false" :row-selection="{selectedRowKeys:selectedRowKeys,onSelect:onSelectChange}")
          template(#action="{record}")
            a-space(:size="24")
              a(@click="addModelView(record)" :class="{'noActive':!selectedRowKeys.includes(record.id)}") 添加模型视角
              a(@click="configPanel(record)" :class="{'noActive':!selectedRowKeys.includes(record.id)}") 配置面板
  a-modal(v-model:visible="visible" title="添加模型视角" @ok="handleOk" @cancel="resetForm")
    .tag-list(v-if="viewList.length")
      .tag-item(v-for="item in viewList" :key="item.id" :class="{'primary-color':sceneBindView.includes(item.id)}" @click="changeView(item)") {{item.name}}
    a-empty(v-else description="该区域下模型还未添加视角")
  a-modal(v-model:visible="panelVisble" title="面板配置" @ok="savePanelConfig" @cancel="resetForm")
    a-form(:model="configForm")
      a-form-item(label="左边面板")
        a-select(v-model:value="configForm.LEFT_PANEL" allowClear :options="options" ref="select" placeholder="请选择面板")
      a-form-item(label="右边面板")
        a-select(v-model:value="configForm.RIGHT_PANEL" allowClear :options="options" ref="select" placeholder="请选择面板")
</template>
<script>
import gLayout from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gLayout.vue";
import gVerticalLine from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gVerticalLine.vue";
import { panelList } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/utils/bimPanleConfig";
import { deleteNullChild } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/utils/common";
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs } from "vue";
export default defineComponent({
  components: { gLayout, gVerticalLine },
  setup() {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      visible: false,
      panelVisble: false,
      businessMenu: [],
      checkedMenupKeys: [],
      checkedMenuObj: null,
      propsDefault: {
        label: "name",
        key: "id",
        children: "children",
      },
      data: [],
      columns: [
        {
          dataIndex: "name",
          key: "name",
          title: "区域名称",
        },
        {
          dataIndex: "code",
          key: "code",
          title: "区域编号",
        },
        {
          dataIndex: "action",
          key: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
        },
      ],
      selectedRowKeys: [],
      viewList: [],
      sceneBindView: [],
      options: panelList,
      configForm: {
        LEFT_PANEL: "",
        RIGHT_PANEL: "",
      },
      currentArea: null,
    });
    onMounted(() => {
      getSceneType();
      getAreaList();
    });
    const checkMenu = (checkedKeys, e) => {
      if (e.checked) {
        state.checkedMenupKeys = [e.node.eventKey];
        state.checkedMenuObj = e.node?.dataRef ?? e.node;
        getSceneBindAreaList(e.node.eventKey);
      } else {
        state.checkedMenupKeys = [];
        state.checkedMenuObj = null;
        state.selectedRowKeys = [];
      }
    };
    // 获取业务菜单
    const getSceneType = async () => {
      const data = await proxy.$api.getSceneType();
      if (data && Array.isArray(data)) {
        state.businessMenu = data;
      }
    };
    // 获取区域列表
    const getAreaList = async () => {
      const data = await proxy.$api.getAreaList();
      if (data && Array.isArray(data)) {
        state.data = deleteNullChild(data);
      }
    };
    // 根据场景查询关联的区域
    const getSceneBindAreaList = async (sceneType) => {
      const data = await proxy.$api.getSceneBindAreaList(sceneType);
      if (data && Array.isArray(data)) {
        state.selectedRowKeys = data.map((item) => item.id);
      }
    };
    const onSelectChange = async (record, selected, selectedRows, nativeEvent) => {
      if (!state.checkedMenupKeys.length) {
        proxy.$message.error("请选择业务场景");
        return false;
      }
      if (selected) {
        const data = await proxy.$api.sceneConfigArea({
          sceneType: state.checkedMenuObj.id,
          sceneTypeSequence: state.checkedMenuObj.sequence,
          areaId: record.id,
        });
        if (data) {
          getSceneBindAreaList(state.checkedMenupKeys[0]);
          proxy.$message.success("操作成功！");
        }
      } else {
        const data = await proxy.$api.deleteSceneConfig({
          areaId: record.id,
          sceneType: state.checkedMenuObj.id,
        });
        if (data) {
          getSceneBindAreaList(state.checkedMenupKeys[0]);
          proxy.$message.success("操作成功！");
        }
      }
    };
    const addModelView = async (record) => {
      if (!state.selectedRowKeys.includes(record.id)) {
        return;
      }
      const data = await proxy.$api.bimViewList({ businessName: record.id });
      if (data && Array.isArray(data)) {
        state.visible = true;
        state.viewList = data;
        state.currentArea = record;
      }
      const bindView = await proxy.$api.getSceneConfig({
        areaId: record.id,
        sceneType: state.checkedMenupKeys[0],
      });
      if (bindView) {
        state.sceneBindView = bindView.bimViewBindVOS.map((item) => item.id);
      }
    };
    const configPanel = async (record) => {
      const data = await proxy.$api.sceneConfigPanelList({
        areaId: record.id,
        sceneType: state.checkedMenupKeys[0],
      });
      if (data) {
        state.panelVisble = true;
        state.currentArea = record;
        state.configForm = {
          LEFT_PANEL: "",
          RIGHT_PANEL: "",
        };
        data.forEach((item) => {
          state.configForm[item.panelPosition] = item.panelConfig;
        });
      }
    };
    const changeView = (tag) => {
      if (state.sceneBindView.includes(tag.id)) {
        state.sceneBindView = state.sceneBindView.filter((item) => {
          return item !== tag.id;
        });
      } else {
        state.sceneBindView.push(tag.id);
      }
    };
    const handleOk = async () => {
      const data = await proxy.$api.sceneConfigArea({
        areaId: state.currentArea.id,
        sceneType: state.checkedMenuObj.id,
        sceneTypeSequence: state.checkedMenuObj.sequence,
        bimViewBinds: state.sceneBindView,
      });
      if (data) {
        state.visible = false;
        proxy.$message.success("操作成功！");
      }
    };
    const savePanelConfig = async () => {
      const params = {
        areaId: state.currentArea.id,
        sceneType: state.checkedMenupKeys[0],
        panelConfigModifyParams: [],
      };
      Object.keys(state.configForm).forEach((key) => {
        params.panelConfigModifyParams.push({
          panelPosition: key,
          panelConfig: state.configForm[key],
        });
      });
      const data = await proxy.$api.saveSceneConfigPanel(params);
      if (data) {
        state.panelVisble = false;
        proxy.$message.success("操作成功！");
      }
    };
    const resetForm = () => {};
    return {
      ...toRefs(state),
      checkMenu,
      onSelectChange,
      addModelView,
      configPanel,
      handleOk,
      savePanelConfig,
      resetForm,
      changeView,
    };
  },
});
</script>

<style lang="less" scoped>
.layout-content {
  text-align: left;
  display: flex;
  height: 100%;
  .tree {
    height: inherit;
    flex: 1;
    border-right: 1px solid #f0f2f5;
  }
  .table {
    flex: 4;
    a {
      &.noActive {
        cursor: no-drop;
        color: rgba(0, 0, 0, 0.25);
      }
    }
  }
}
.tag-list {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  .tag-item {
    width: 80px;
    padding: 4px;
    text-align: center;
    margin: 0 10px 10px 0;
    background: #eee;
    border-radius: 2px;
    overflow-x: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
  }
}
</style>
