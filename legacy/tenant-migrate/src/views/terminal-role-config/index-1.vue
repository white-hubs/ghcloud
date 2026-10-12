<template lang="pug">
div(style="height:100%")
  g-layout(title="访问端角色配置")
    template(#content-search)
      a-form(layout="inline" :model="searchForm" ref="formRef")
        a-form-item(name="keyWord")
          a-input(v-model:value.trim="searchForm.keyWord" placeholder="请输入角色名称" :maxlength="20")
        a-form-item
          a-button(type="primary" @click="getConfigList") 查询
        a-form-item
          a-button(type="default" @click="reset") 重置
    template(#content-table)
      a-table(:columns="columns" :data-source="data" :loading="tableLoading" size="small" rowKey="id" bordered :pagination="false" :locale="{emptyText: '暂无数据'}" :scroll="{y:500}")
        template(#name="{ record }")
          div(@click.stop="")
            a-input(v-if="record['isEdit']" v-model:value="record['name']"
							style="margin: -5px 0" placeholder="请输入")
            div()
        template(#button="{ record }")
          span(@click.stop = "")
            a-space(:size="12")
              a(@click.stop="editConfig(record)" class="a_primary") 编辑
    template(#footer-page)
      a-pagination(v-model:current="pageNum" v-model:pageSize="pageSize" :total="total" show-size-changer :show-total="(total,range) => `共 ${total} 条`" @change="changeNum" @showSizeChange="changeSize")
        template(#buildOptionText="props")
          span {{props.value}}条/页
    role-modal(:visible="visible" :activeId="[]" @close="closeRoleModal")
</template>

<script lang="jsx">
import {
  defineComponent,
  onMounted,
  toRefs,
  reactive,
  ref,
  getCurrentInstance,
} from "vue";
import { message, Modal } from "ant-design-vue";
import _ from "lodash";
import roleModal from "./components/role-modal.vue";

export default defineComponent({
  components: {
    roleModal,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const formRef = ref();
    const visible = ref(false);
    const confirm = Modal.confirm;
    const tableLoading = ref(false);
    const state = reactive({
      searchForm: {
        keyWord: "",
      },
      columns: [
        {
          title: "访问端名称",
          dataIndex: "name",
          width: 220,
          customRender: ({ text }) => {
            return <PopOver content={text}>{text}</PopOver>
          },
        },
        {
          title: "访问端编码",
          dataIndex: "product.name",
          width: 220,
          customRender: ({ text }) => {
            return <PopOver content={text}>{text}</PopOver>
          },
        },
        {
          title: "访问端别名",
          dataIndex: "remark",
          width: 220,
          customRender: ({ text }) => {
            return <PopOver content={text}>{text}</PopOver>
          },
        },
        {
          title: "角色",
          dataIndex: "remark",
          width: 220,
          customRender: ({ text }) => {
            return <PopOver content={text}>{text}</PopOver>
          },
        },
        {
          title: "操作",
          dataIndex: "",
          slots: { customRender: "button" },
        },
      ],
      data: [],
      pageSize: 10,
      pageNum: 1,
      total: 0,
    });

    const layout = {
      labelCol: {
        span: 4,
      },
      wrapperCol: {
        span: 20,
      },
    };
    onMounted(() => {
      getConfigList();
    });

    const getConfigList = async () => {
      tableLoading.value = true;
      const data = await proxy.$api.roles("get", {
        name: state.searchForm.keyWord,
        pageNumber: state.pageNum,
        pageSize: state.pageSize,
      });
      state.total = data.total;
      if (data.records && data.records instanceof Array) {
        state.data = data.records;
      }
      tableLoading.value = false;
    };
    const reset = () => {
      formRef.value.resetFields();
      getConfigList();
    };
    const changeNum = (page) => {
      state.pageNum = page;
      getConfigList();
    };
    const changeSize = (current, size) => {
      state.pageSize = size;
      getConfigList();
    };
    const editConfig = (record) => {
      visible.value = true;
    };
    const closeRoleModal = (data) => {
      if (data) {
      }
    };
    return {
      ...toRefs(state),
      getConfigList,
      editConfig,
      reset,
      visible,
      formRef,
      layout,
      changeNum,
      changeSize,
      tableLoading,
      closeRoleModal
    };
  },
});
</script>

<style lang="less" scoped>
:deep(.ant-form) {
  .ant-select {
    width: 210px;
  }
}
</style>
