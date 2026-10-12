<template lang="pug">
div
  g-layout(title="场景设备")
    template(#content-table)
      a-layout-content.layout-content
          .grid
              div
                  a-tabs( v-model:activeKey="activeKey")
                      a-tab-pane(:key="1" tab="设备")
                          a-tree(v-if="deviceList.length" :blockNode="true" checkable checkStrictly :selectable="false" :tree-data="deviceList" :checkedKeys="checkedDeviceKeys" :defaultExpandAll.async="true" @check="checkDevice")
                              template(#title="{dataRef}")
                                  .tree-node
                                      span {{dataRef.title}}
                                      a(@click.stop="typeAddScene(dataRef,'DEVICE_TYPE')") 关联场景
                      a-tab-pane(:key="2" tab="档位")
                          a-tree(v-if="stallList.length" :blockNode="true" checkable checkStrictly :selectable="false" :tree-data="stallList" :checkedKeys="checkedStallKeys" :defaultExpandAll.async="true" @check="checkStall")
                              template(#title="{dataRef}")
                                  .tree-node
                                      span {{dataRef.title}}
                                      a(@click.stop="typeAddScene(dataRef,'STALL_TYPE')") 关联场景
              div(v-if="activeKey === 1")
                  a-space(direction="vertical" :size="16")
                      a-form(layout="inline" :model="equipPage")
                          a-form-item(name="name")
                              a-input(v-model:value="equipPage.keyword" placeholder="请输入设备名称" :maxlength="20")
                          a-form-item
                              a-button(type="primary" @click="inputEquipList") 查询
                      a-table(:columns="equipTableColumn" :data-source="equipTableData" size="small" rowKey="id" bordered :pagination="false" :locale="{emptyText: '暂无数据'}" :scroll="{y:500}")
                          template(#action="{record}")
                              a-button(type="link" @click="linkScene(record,'DEVICE')") 关联场景
                      a-pagination(v-if="equipPage.total>0" v-model:current="equipPage.pageNumber" :total="equipPage.total" :default-current="1"  @change="changeEquipPage" @showSizeChange="changeEquipPage")
              div(v-if="activeKey === 2")
                  a-space(direction="vertical" :size="16")
                      a-form(layout="inline" :model="stallPage")
                          a-form-item(name="name")
                              a-input(v-model:value="stallPage.keyword" placeholder="请输入档位名称" :maxlength="20")
                          a-form-item
                              a-button(type="primary" @click="inputBooth") 查询
                      a-table(:columns="stallTableColumn" :data-source="stallTableData" size="small" rowKey="id" bordered :pagination="false" :locale="{emptyText: '暂无数据'}" :scroll="{y:500}")
                          template(#action)
                              a-button(type="link" @click="linkScene(record,'STALL')") 关联场景
                      a-pagination(v-if="stallPage.total>0" v-model:current="stallPage.pageNumber" :total="stallPage.total" :default-current="1"  @change="changeStallPage" @showSizeChange="changeStallPage")
  a-modal(v-model:visible.sync="floorModal" title="模型区域关联" centered width="880px"  @ok="handleOk")
    a-table(:columns="sceneColumns" :data-source="sceneData" size="small" rowKey="id" :pagination="false" bordered :row-selection="{selectedRowKeys:selectedRowKeys,onChange:onSelectChange,getCheckboxProps:getCheckboxProps}")

</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
} from "vue";
import { deleteNullChild } from "@/utils/common";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      activeKey: 1,
      propsDefault: {
        title: "name",
        key: "id",
        children: "children",
      },
      deviceList: [],
      stallList: [],
      checkedDeviceKeys: [],
      equipPage: {
        total: 0,
        pageNumber: 1,
        pageSize: 10,
        keyword: "",
      },
      equipTableData: [],
      equipTableColumn: [
        {
          dataIndex: "name",
          title: "设备名称",
        },
        {
          dataIndex: "code",
          title: "设备编号",
        },
        {
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
        },
      ],
      stallPage: {
        total: 0,
        pageNumber: 1,
        pageSize: 10,
        keyword: "",
      },
      stallTableData: [],
      stallTableColumn: [
        {
          dataIndex: "name",
          title: "档位名称",
        },
        {
          dataIndex: "code",
          title: "档位编号",
        },
        {
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
        },
      ],
      checkedStallKeys: [],
      treeData: [
        {
          title: "你麻痹",
          key: 1,
          children: [],
        },
      ],
      floorModal: false,
      sceneColumns: [
        {
          dataIndex: "name",
          title: "场景名称",
        },
        {
          dataIndex: "code",
          title: "场景编号",
        },
      ],
      sceneData: [],
      bindConfig: {},
      selectedRowKeys: [],
    });
    // 获取设备分类
    const equipTypeTree = async () => {
      const data = await proxy.$api.equipTypeTree();
      if (data && Array.isArray(data)) {
        state.deviceList = addKey(data);
      }
    };
    const addKey = (data) => {
      data.forEach((item) => {
        Object.assign(item, { title: item.name, key: item.id });
        if (item.children && item.children.length) addKey(item.children);
      });
      return data;
    };
    // 根据设备类型查询设备列表
    const getEquipList = async () => {
      const params = {
        keyword: state.equipPage.keyword,
        pageNumber: state.equipPage.pageNumber,
        pageSize: state.equipPage.pageSize,
        typeId: state.checkedDeviceKeys.length
          ? state.checkedDeviceKeys[0]
          : "",
      };
      const data = await proxy.$api.equipTable(params, "get");
      if (data && data.records) {
        state.equipPage.total = data.total;
        state.equipTableData = data.records;
      }
    };
    // 获取档位分类
    const getBoothTypeList = async () => {
      const data = await proxy.$api.getBoothTypeList();
      if (data && Array.isArray(data)) {
        state.stallList = addKey(data);
      }
    };
    // 根据档位分类查询档位列表
    const getBooth = async () => {
      const params = {
        keyword: state.stallPage.keyword,
        pageNumber: state.stallPage.pageNumber,
        pageSize: state.stallPage.pageSize,
        type: state.checkedStallKeys.length ? state.checkedStallKeys[0] : "",
      };
      const data = await proxy.$api.getBooth(params, "get");
      if (data && data.records) {
        state.stallPage.total = data.total;
        state.stallTableData = data.records;
      }
    };
    const inputEquipList = () => {
      state.equipPage.pageNumber = 1;
      getEquipList();
    };
    const inputBooth = () => {
      state.stallPage.pageNumber = 1;
      getBooth();
    };
    const checkDevice = (checkedKeys, e) => {
      if (e.checked) {
        state.checkedDeviceKeys = [e.node.eventKey];
      } else {
        state.checkedDeviceKeys = [];
      }
      state.equipPage = {
        total: 0,
        pageNumber: 1,
        pageSize: 10,
        keyword: "",
      };
      state.equipTableData = [];
      getEquipList();
    };
    const checkStall = (checkedKeys, e) => {
      if (e.checked) {
        state.checkedStallKeys = [e.node.eventKey];
      } else {
        state.checkedStallKeys = [];
      }
      state.stallPage = {
        total: 0,
        pageNumber: 1,
        pageSize: 10,
        keyword: "",
      };
      state.stallTableData = [];
      getBooth();
    };
    const changeEquipPage = (current, pageSize) => {
      state.equipPage.pageNumber = current;
      state.equipPage.pageSize = pageSize;
      getEquipList();
    };
    const changeStallPage = (current, pageSize) => {
      state.stallPage.pageNumber = current;
      state.stallPage.pageSize = pageSize;
      getBooth();
    };
    const typeAddScene = (record, type) => {
      state.floorModal = true;
      getSceneTypePage();
      getSceneConfigByBusinessId(record.id);
      state.bindConfig = {
        sceneTypes: [],
        businessType: type,
        businessId: record.id,
      };
    };
    // 获取所有场景
    const getSceneTypePage = async () => {
      const data = await proxy.$api.getSceneTypePage();
      if (data) {
        state.sceneData = deleteNullChild(data);
      }
    };

    const linkScene = (record, type) => {
      state.floorModal = true;
      getSceneTypePage();
      getSceneConfigByBusinessId(record.id);
      state.bindConfig = {
        sceneTypes: [],
        businessType: type,
        businessId: record.id,
      };
    };
    const getSceneConfigByBusinessId = async (id) => {
      const data = await proxy.$api.getSceneConfigByBusinessId({
        businessId: id,
      });
      if (data && Array.isArray(data)) {
        state.selectedRowKeys = data.map((item) => item.sceneType);
      }
    };
    const onSelectChange = (selectedRowKeys) => {
      state.selectedRowKeys = selectedRowKeys;
    };
    const getCheckboxProps = (record) => {
      return { disabled: record.level === 1 ? true : false };
    };
    const handleOk = async () => {
      state.bindConfig.sceneTypes = state.selectedRowKeys;
      const data = await proxy.$api.addSceneConfig(state.bindConfig);
      if (data) {
        state.floorModal = false;
        proxy.$message.success("操作成功!");
      }
    };
    onMounted(() => {
      equipTypeTree();
      getBoothTypeList();
      getEquipList();
      getBooth();
    });
    return {
      ...toRefs(state),
      checkDevice,
      changeEquipPage,
      checkStall,
      changeStallPage,
      typeAddScene,
      linkScene,
      onSelectChange,
      getCheckboxProps,
      handleOk,
      inputEquipList,
      inputBooth,
    };
  },
});
</script>

<style lang="less" scoped>
// @import url("~@/styles/searchTable/index.less");
.layout-content {
  height: 100%;
}
.grid {
  width: 100%;
  height: 100%;
  display: grid;
  overflow: hidden;
  grid-template-columns: 1fr 4fr;
  grid-column-gap: 16px;
  text-align: left;
  > div {
    background: #ffffff;
    padding: 10px;
    border-right: solid 1px #f0f2f5;
  }
  :deep(.ant-pagination) {
    text-align: right;
  }
  :deep(.tree-node) {
    display: flex;
    justify-content: space-between;
  }
}
</style>
