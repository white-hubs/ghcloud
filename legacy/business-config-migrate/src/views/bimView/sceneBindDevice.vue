<template lang="pug">
g-layout(title="模型导航")
    template(#content-table)
        a-layout-content.layout-content
            .layout-content-left.flex-column
                a-tree(v-if="deviceList.length" :blockNode="true" checkable checkStrictly :selectable="false" :tree-data="deviceList" :checkedKeys="checkedDeviceKeys" :defaultExpandAll.async="true" @check="checkDevice")
                    template(#title="{dataRef}")
                        .tree-node
                            span {{dataRef.title}}
                            a(@click.stop="typeAddScene(dataRef,'DEVICE_TYPE')") 关联场景
            .layout-content-right.flex-column
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
a-modal(v-model:visible.sync="sceneModal" title="设备场景关联" centered width="880px"  @ok="handleOk")
        a-table(:columns="sceneColumns" :data-source="sceneData" size="small" rowKey="id" :pagination="false" bordered :row-selection="{selectedRowKeys:selectedRowKeys,onChange:onSelectChange,getCheckboxProps:getCheckboxProps}")
</template>

<script>
import gLayout from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gLayout.vue";
import gVerticalLine from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gVerticalLine.vue";
import { deleteNullChild } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/utils/common";
import { defineComponent, reactive, toRefs, onMounted, getCurrentInstance } from "vue";
export default defineComponent({
  components: { gLayout, gVerticalLine },
  setup() {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      deviceList: [],
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
      sceneModal: false,
      bindConfig: {},
      selectedRowKeys: [],
      sceneData: [],
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
    });
    // 获取设备分类
    const getGenreSearch = async () => {
      const data = await proxy.$api.getGenreSearch();
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
    const getInstanceList = async () => {
      const params = {
        keyword: state.equipPage.keyword,
        pageNumber: state.equipPage.pageNumber,
        pageSize: state.equipPage.pageSize,
        genreId: state.checkedDeviceKeys.length ? state.checkedDeviceKeys[0] : "",
      };
      const data = await proxy.$api.getInstanceList(params);
      if (data && data.records) {
        state.equipPage.total = data.total;
        state.equipTableData = data.records;
      }
    };
    const inputEquipList = () => {
      state.equipPage.pageNumber = 1;
      getInstanceList();
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
      getInstanceList();
    };
    const changeEquipPage = (current, pageSize) => {
      state.equipPage.pageNumber = current;
      state.equipPage.pageSize = pageSize;
      getInstanceList();
    };
    const typeAddScene = (record, type) => {
      state.sceneModal = true;
      getSceneTypePage();
      getSceneDeviceByBusinessId(record.id);
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
      state.sceneModal = true;
      getSceneTypePage();
      getSceneDeviceByBusinessId(record.id);
      state.bindConfig = {
        sceneTypes: [],
        businessType: type,
        businessId: record.id,
      };
    };
    const getSceneDeviceByBusinessId = async (id) => {
      const data = await proxy.$api.getSceneDeviceByBusinessId({
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
      return { disabled: record.level === 1 ? false : true };
    };
    const handleOk = async () => {
      state.bindConfig.sceneTypes = state.selectedRowKeys;
      const data = await proxy.$api.addSceneBindDevice(state.bindConfig);
      if (data) {
        state.sceneModal = false;
        proxy.$message.success("操作成功!");
      }
    };
    onMounted(() => {
      getGenreSearch();
      getInstanceList();
    });
    return {
      ...toRefs(state),
      checkDevice,
      changeEquipPage,
      typeAddScene,
      linkScene,
      onSelectChange,
      getCheckboxProps,
      handleOk,
      inputEquipList,
    };
  },
});
</script>

<style lang="less" scoped>
// @import url("~@/styles/searchTable/index.less");
.layout-content {
  height: 100%;
  display: flex;
  justify-content: flex-start;
  &-left {
    width: 360px;
    padding-right: 16px;
    height: 100%;
    overflow: auto;
  }
  &-right {
    flex: 1;
    padding: 16px;
  }
  :deep(.tree-node) {
    display: flex;
    justify-content: space-between;
  }
}
</style>
