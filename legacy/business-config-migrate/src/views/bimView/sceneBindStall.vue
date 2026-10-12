<template lang="pug">
g-layout(title="模型导航")
    template(#content-table)
        a-layout-content.layout-content
            .layout-content-left.flex-column
                a-tree(v-if="stallList.length" :blockNode="true" checkable checkStrictly :selectable="false" :tree-data="stallList" :checkedKeys="checkedStallKeys" :defaultExpandAll.async="true" @check="checkStall")
                    template(#title="{dataRef}")
                        .tree-node
                            span {{dataRef.title}}
                            a(@click.stop="typeAddScene(dataRef,'STALL_TYPE')") 关联场景
            .layout-content-right.flex-column
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
    a-modal(v-model:visible.sync="sceneModal" title="档位场景关联" centered width="880px"  @ok="handleOk")
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
      stallList: [],
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
      sceneModal: false,
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
    const addKey = (data) => {
      data.forEach((item) => {
        Object.assign(item, { title: item.name, key: item.id });
        if (item.children && item.children.length) addKey(item.children);
      });
      return data;
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
    const inputBooth = () => {
      state.stallPage.pageNumber = 1;
      getBooth();
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
    const changeStallPage = (current, pageSize) => {
      state.stallPage.pageNumber = current;
      state.stallPage.pageSize = pageSize;
      getBooth();
    };
    const typeAddScene = (record, type) => {
      state.sceneModal = true;
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
      state.sceneModal = true;
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
      return { disabled: record.level === 1 ? false : true };
    };
    const handleOk = async () => {
      state.bindConfig.sceneTypes = state.selectedRowKeys;
      const data = await proxy.$api.addSceneConfig(state.bindConfig);
      if (data) {
        state.sceneModal = false;
        proxy.$message.success("操作成功!");
      }
    };
    onMounted(() => {
      getBoothTypeList();
      getBooth();
    });
    return {
      ...toRefs(state),
      checkStall,
      changeStallPage,
      typeAddScene,
      linkScene,
      onSelectChange,
      getCheckboxProps,
      handleOk,
      inputBooth,
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
