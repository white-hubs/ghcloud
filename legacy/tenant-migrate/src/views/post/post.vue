<template lang="pug">
div(style="height:100%")
  g-layout(:title="pageTitle")
    template(#header-btn)
      a-button(type="primary" @click="handleDownload" :disabled="data.length === 0" :loading="downLoading") 导出
      a-button(type="primary" @click="addPost") 新增
    template(#content-search)
      a-form(layout="inline" :model="searchForm" ref="formRef")
        a-form-item(name="keyWord")
            a-input(v-model:value.trim="searchForm.keyWord" placeholder="请输入职位名称" :maxlength="20")
        a-form-item(name="type")
            a-select(v-model:value="searchForm.type")
                a-select-option(v-for="item in types" :key="item.value") {{item.name}}
        a-form-item
            a-button(type="primary" @click="changeNum(1)") 查询
        a-form-item
            a-button(type="default" @click="reset") 重置
    template(#content-table)
      a-table(:columns="columns" :data-source="data" :loading="tabLoading" size="small" rowKey="id" bordered :pagination="false" :locale="{emptyText: '暂无数据'}" :scroll="{y:500}")
        template(#switch="{ record }")
            span(@click.stop="")
                a-switch(:checked="record.enabled" @change="checked =>changeEnabled(checked,record)"  checked-children="启用" 
                un-checked-children="禁用")
        template(#button="{ record }")
            span(@click.stop = "")
                a-space(:size="12")
                    a(@click.stop="editPost(record)" class="a_primary") 编辑
                    a(@click.stop="deletePost(record)" class="a_danger") 删除
    template(#footer-page)
      a-pagination(v-model:current="pageNum" v-model:pageSize="pageSize" :total="total" show-size-changer :show-total="(total,range) => `共 ${total} 条`" @change="changeNum" @showSizeChange="changeSize")
          template(#buildOptionText="props")
              span {{props.value}}条/页
  a-modal(v-model:visible="visible" :title="modalTitle" okText="确定" cancelText="取消" @ok="onSubmit" @cancel="cancel" centered)
    a-form(:model="editForm" ref="modalFormRef" :rules="rules" v-bind="layout")
        a-form-item(label="职位名称" name="name")
            a-input(v-model:value.trim="editForm.name" placeholder="请输入职位名称" :maxlength="20")
        a-form-item(label="备注" name="remark")
            a-textarea.textArea(v-model:value="editForm.remark" placeholder="请输入备注" :maxlength="200" showCount :auto-size="{ minRows: 2, maxRows: 9 }")
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
import { types } from "@/utils/enumerate";
import axios from "@/utils/axios";
import { message } from "ant-design-vue";
import { Modal } from "ant-design-vue";
import _ from "lodash";
import { cubeOuaaService } from "@/api/service";
import { usePageName, useDownloadExcel } from '@ghcloud/cube-utils'

export default defineComponent({
  setup() {
    const { pageTitle } = usePageName()
    const { downLoading, handleDownload } = useDownloadExcel({
      fileName: pageTitle,
      exportServiceApi: async () => {
        const params = Object.keys(state.searchForm).reduce((acc, key) => {
          if (state.searchForm[key] !== null) {
            acc[key] = state.searchForm[key];
          }
          return acc;
        }, {});
        return await cubeOuaaService.getPositionExcel(params)
      }
    })
    const formRef = ref();
    const modalFormRef = ref();
    const visible = ref(false);
    const modalTitle = ref("新增职位");
    const confirm = Modal.confirm;
    const getInitalDept = () => {
      return {
        name: "",
        enabled: true,
        remark: "",
      };
    };
    const { proxy } = getCurrentInstance();
    const tabLoading = ref(false);
    const state = reactive({
      types: types,
      searchForm: {
        keyWord: "",
        type: "",
      },
      columns: [
        {
          title: "职位名称",
          dataIndex: "name",
          key: "name",
          width: 300,		
           customRender: ({ text }) => {
             return <PopOver content={text}>{text}</PopOver>
          },
        },
        {
          title: "备注",
          dataIndex: "remark",
          key: "remark",
          width: 300,		
          customRender: ({ text }) => {
            if (text) {
              return <PopOver content={text}>{text}</PopOver>;
            } else {
              return "--";
            }
          },
        },
        {
          title: "职位状态",
          dataIndex: "switch",
          key: "switch",
          width: 300,		
          slots: { customRender: "switch" },
        },
        {
          title: "操作",
          dataIndex: "operate",
          key: "operate",
          slots: { customRender: "button" },
        },
      ],
      data: [],
      pageSize: 10,
      pageNum: 1,
      total: 0,
      editForm: getInitalDept(),
      rules: {
        name: { required: true, message: "请输入职位名称" },
      },
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
      getPostList();
    });
    const getPostList = async () => {
      tabLoading.value = true;
      const data = await proxy.$api.positions("get", {
        name: state.searchForm.keyWord,
        enabled: state.searchForm.type,
        pageNumber: state.pageNum,
        pageSize: state.pageSize,
      });
      state.total = data.total;
      if (data.records && data.records instanceof Array) {
        state.data = data.records;
      }
      tabLoading.value = false;
    };
    const addPost = () => {
      showModal();
      modalTitle.value = "新增职位";
    };
    const changeEnabled = async (checked, record) => {
      const item = _.cloneDeep(record);
      item.enabled = checked;
      await proxy.$api.positionId("put", item);
      record.enabled = checked;
      message.success("操作成功");
      getPostList();
    };
    const editPost = (record) => {
      showModal();
      state.editForm = _.cloneDeep(record);
      modalTitle.value = "修改职位";
    };
    const deletePost = (record) => {
      confirm({
        title: "提示",
        content: "是否确认删除该职位？",
        okText: "确认",
        cancelText: "取消",
        okType: "danger",
        onOk: async () => {
          await proxy.$api.positionId(`delete`, record);
          message.success("操作成功");
          getPostList();
        },
      });
    };

    const reset = () => {
      formRef.value.resetFields();
      changeNum(1)
    };
    const showModal = () => {
      visible.value = true;
    };
    const onSubmit = async () => {
      modalFormRef.value.validate().then(async () => {
        // 有id为修改 无id为新增
        if (state.editForm.id) {
          await proxy.$api.positionId("put", state.editForm);
          message.success("操作成功");
          visible.value = false;
          getPostList();
        } else {
          await proxy.$api.position("post", state.editForm);
          message.success("操作成功");
          visible.value = false;
          getPostList();
        }
        cancel();
      });
    };
    const cancel = () => {
      // 重置表单并初始化表单数据
      modalFormRef.value.resetFields();
      state.editForm = getInitalDept();
    };
    const changeNum = (page) => {
      state.pageNum = page;
      getPostList();
    };

    const changeSize = (current, size) => {
      state.pageNum = 1;
      state.pageSize = size;
      getPostList();
    };
    return {
      ...toRefs(state),
      getPostList,
      changeEnabled,
      addPost,
      editPost,
      deletePost,
      reset,
      visible,
      formRef,
      modalFormRef,
      showModal,
      layout,
      modalTitle,
      onSubmit,
      cancel,
      changeNum,
      changeSize,
      tabLoading,
      pageTitle,
      downLoading,
      handleDownload
    };
  },
});
</script>

<style></style>
