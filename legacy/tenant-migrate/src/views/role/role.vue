<template>
  <div style="height: 100%">
    <g-layout :title="pageTitle">
      <template v-slot:header-btn>
        <a-button type="primary" @click="handleDownloadRole()" :disabled="data.length === 0" :loading="downRoleLoading">导出可配权限</a-button>
        <a-button type="primary" @click="handleDownload()" :disabled="data.length === 0" :loading="downLoading">导出</a-button>
        <a-button type="primary" @click="addPost">新增</a-button>
      </template>
      <template v-slot:content-search>
        <a-form layout="inline" :model="searchForm" ref="formRef">
          <a-form-item label="角色状态" name="type">
            <a-select v-model:value="searchForm.type" placeholder="状态">
              <a-select-option v-for="item in types" :key="item.value">{{ item.name }}</a-select-option>
            </a-select>
          </a-form-item>
          <!-- <a-form-item label="所属产品" name="productId">
            <a-select v-model:value="searchForm.productId" placeholder="所属产品" allowClear>
              <a-select-option v-for="item in productList" :key="item.id">{{ item.name }}</a-select-option>
            </a-select>
          </a-form-item> -->
          <a-form-item name="keyWord">
            <a-input v-model:value.trim="searchForm.keyWord" placeholder="请输入角色名称" :maxlength="20"></a-input>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="getPostList">查询</a-button>
          </a-form-item>
          <a-form-item>
            <a-button type="default" @click="reset">重置</a-button>
          </a-form-item>
        </a-form>
      </template>
      <template v-slot:content-table>
        <a-table :columns="columns" :data-source="data" :loading="tabLoading" size="small" rowKey="id" bordered
          :pagination="false" :locale="{ emptyText: '暂无数据' }" :scroll="{ y: 500 }">
          <template v-slot:switch="{ record }">
            <span @click.stop>
              <a-switch :checked="record.enabled" @change="checked => changeEnabled(checked, record)"
                checked-children="启用" un-checked-children="禁用"></a-switch>
            </span>
          </template>
          <template v-slot:button="{ record }">
            <span @click.stop>
              <a-space :size="12">
                <a @click.stop="editPost(record)" class="a_primary">编辑</a>
                <a @click.stop="jurisdiction(record)" class="a_primary">菜单权限</a>
                <a @click.stop="relatedPersonnel(record)" class="a_primary">关联人员</a>
                <a @click.stop="toFeaturePermissionsPage(record)" class="a_primary">功能权限</a>
                <a @click.stop="toDataPermissionsPage(record)" class="a_primary">数据权限</a>
                <a @click.stop="deletePost(record)" class="a_danger">删除</a>
              </a-space>
            </span>
          </template>
        </a-table>
      </template>
      <template v-slot:footer-page>
        <a-pagination v-model:current="pageNum" v-model:pageSize="pageSize" :total="total" show-size-changer
          :show-total="(total, range) => `共 ${total} 条`" @change="changeNum" @showSizeChange="changeSize">
          <template v-slot:buildOptionText="props">
            <span>{{ props.value }}条/页</span>
          </template>
        </a-pagination>
      </template>
    </g-layout>
    <a-modal v-model:visible="visible" :title="modalTitle" okText="确定" cancelText="取消" :confirmLoading="submitLoading"
      @ok="onSubmit" @cancel="cancel" centered>
      <a-form :model="editForm" ref="modalFormRef" :rules="rules" v-bind="layout">
        <a-form-item label="角色名称" name="name">
          <a-input v-model:value.trim="editForm.name" placeholder="请输入角色名称" :maxlength="20"></a-input>
        </a-form-item>
        <!-- <a-form-item label="所属产品" name="productId">
          <a-select v-model:value="editForm.productId" placeholder="请选择产品">
            <a-select-option v-for="item in productList" :key="item.id">{{ item.name }}</a-select-option>
          </a-select>
        </a-form-item> -->
        <a-form-item label="备注" name="remark">
          <a-textarea v-model:value="editForm.remark" placeholder="请输入备注" :maxlength="200" showCount
            :auto-size="{ minRows: 2, maxRows: 9 }" class="textArea"></a-textarea>
        </a-form-item>
      </a-form>
    </a-modal>
    <personnel-select :ids="selectedRowKeys" :show="visiblePeople" @close="visiblePeople = false" @save="save"/>
  </div>
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
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import axios from "@/utils/axios";
import { message, Modal } from "ant-design-vue";
import personnelSelect from './components/personnel-select/personnel-select.vue';
import { cubeOuaaService } from "@/api/service";
import { queryParameter, usePageName, useDownloadExcel } from '@ghcloud/cube-utils'

import _ from "lodash";
export default defineComponent({
  components:{
    personnelSelect
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const formRef = ref();
    const modalFormRef = ref();
    const visible = ref(false);
    const modalTitle = ref("新增角色");
    const router = useRouter();
    const visiblePeople = ref(false)
    const store = useStore();
    const roleId = ref();
    const selectedRowKeys = ref();
    const confirm = Modal.confirm;
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
        return await cubeOuaaService.getRoleExcel(params)
      }
    })    
    const { downLoading:downRoleLoading, handleDownload:handleDownloadRole } = useDownloadExcel({
       fileName: '角色可配置权限',
        exportServiceApi: async () => {
      
        return await cubeOuaaService.getRoleExcelNew()
      }
    })  
    // const { downRoleLoading, handleDownloadRole } = useDownloadExcel({
    //   fileName: pageTitle+'可配置权限',
    //   exportServiceApi: async () => {
      
    //     return await cubeOuaaService.getRoleExcelNew(params)
    //   }
    // })
    const getInitalDept = () => {
      return {
        name: "",
        // productId: null,
        enabled: true,
        remark: "",
      };
    };
    const tabLoading = ref(false);
    const state = reactive({
      types: types,
      submitLoading: false,
      searchForm: {
        keyWord: "",
        type: "",
        // productId: null,
      },
      columns: [
        {
          title: "角色名称",
          dataIndex: "name",
          width: 200,
          customRender: ({ text }) => {
            return <PopOver content={text}>{text}</PopOver>
          },
        },
        // {
        //   title: "所属产品",
        //   dataIndex: "product.name",
        //   width: 220,
        //   customRender: ({ text }) => {
        //     return <PopOver content={text}>{text}</PopOver>
        //   },
        // },
        {
          title: "角色状态",
          dataIndex: "enabled",
          width: 180,
          slots: { customRender: "switch" },
        },
        {
          title: "备注",
          dataIndex: "remark",
          width: 220,
          slots: { customRender: "remark" },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver content={text}>
                {text ? text : "--"}
              </PopOver>
            );
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
      editForm: getInitalDept(),
      rules: {
        name: { required: true, message: "请输入角色名称" },
        // productId: { required: true, message: "请选择所属产品" },
      },
      productList: [],
    });

    const layout = {
      labelCol: {
        span: 4,
      },
      wrapperCol: {
        span: 20,
      },
    };
    const save = async (data) => {
      const res = await proxy.$api.roleAssignUsers({userIdList:data},roleId.value);
      message.success("关联成功");
      visiblePeople.value = false;
    }
    onMounted(() => {
      Object.assign(state.searchForm, queryParameter.getQuery());
      Object.assign(state, queryParameter.getQuery());
      getProductList();
      getPostList();
    });

    const setAddress = () => {
      queryParameter.setAddressQuery({
        ...state.searchForm,
        pageNum: state.pageNum,
        pageSize: state.pageSize,
      });
    }

    const getPostList = async () => {
      tabLoading.value = true;
      setAddress()
      const data = await proxy.$api.roles("get", {
        name: state.searchForm.keyWord,
        enabled: state.searchForm.type,
        productId: state.searchForm.productId,
        pageNumber: state.pageNum,
        pageSize: state.pageSize,
      });
      state.total = data.total;
      if (data.records && data.records instanceof Array) {
        state.data = data.records;
      }
      tabLoading.value = false;
    };
    const getProductList = async () => {
      const tenantCode = JSON.parse(sessionStorage.getItem("GH-NowEnterprise")).code
      const data = await proxy.$api.tenantCodeProduct("get", {
        code: tenantCode,
      });
      if (data && data.records) {
        state.productList = data.records;
      } else {
        state.productList = data;
      }
    };
    const addPost = () => {
      showModal();
      modalTitle.value = "新增角色";
    };

    const changeEnabled = async (checked, record) => {
      tabLoading.value = true;
      const item = _.cloneDeep(record);
      item.enabled = checked;
      item.productId = item.product.id;
      await proxy.$api.roleId("put", item);
      record.enabled = checked;
      tabLoading.value = false;
    };

    const editPost = (record) => {
      showModal();
      state.editForm = _.cloneDeep(record);
      state.editForm.productId = state.editForm.product.id;
      modalTitle.value = "修改角色";
    };
    const deletePost = (record) => {
      confirm({
        title: "提示",
        content: "是否确认删除该角色？",
        okText: "确认",
        cancelText: "取消",
        centered: true,
        okType: "danger",
        onOk: async () => {
          await proxy.$api.roleId("delete", record);
          message.success("操作成功");
          getPostList();
        },
      });
    };
    const reset = () => {
      formRef.value.resetFields();
      getPostList();
    };
    const showModal = () => {
      visible.value = true;
    };
    const onSubmit = async () => {
      modalFormRef.value.validate().then(async () => {
        state.submitLoading = true
        try {
          // 有id为修改 无id为新增
          if (state.editForm.id) {
            await proxy.$api.roleId("put", state.editForm);
            message.success("操作成功");
            visible.value = false;
            getPostList();
          } else {
            await proxy.$api.role("post", state.editForm);
            message.success("操作成功");
            visible.value = false;
            getPostList();
          }
          cancel();
        } catch (error) {
        } finally {
          state.submitLoading = false
        }

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
      state.pageSize = size;
      getPostList();
    };
    const jurisdiction = (item) => {
      function getPushPath() {
        const pathname_arr = location.pathname.split('/')
        pathname_arr[pathname_arr.length - 1] = '/rolePermission'
        const pathname = pathname_arr.join('/').replaceAll('//', '/')
        const query = {
          name: item.product?.name??'',
          productId: item.product?.id ? item.product?.id : "",
          id: item.id,
        }
        let queryString = ''
        for (const key in query) {
          if (Object.hasOwnProperty.call(query, key)) {
            const element = query[key];
            if (element) {
              queryString += `${queryString ? '&' : ''}${key}=${element}`
            }
          }
        }
        return `${pathname}${queryString ? '?' + queryString : ''}`
      }
      const target = getPushPath()
      history.pushState(history.state, "", target)
    };
    const relatedPersonnel = async (item)=>{
      selectedRowKeys.value = await proxy.$api.roleUseridList(item.id);
      roleId.value = item.id;
      visiblePeople.value = true;
    }
    const toFeaturePermissionsPage = (item) => {
      history.pushState(history.state, "", `/portal/tenant/role-feature-permissions?id=${item.id}&name=${item.name}`)
    }
    const toDataPermissionsPage = (item) => {
      history.pushState(history.state, "", `/portal/tenant/role-data-permissions?id=${item.id}&name=${item.name}`)
    }
    return {
      ...toRefs(state),
      toFeaturePermissionsPage,
      toDataPermissionsPage,
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
      visiblePeople,
      selectedRowKeys,
      onSubmit,
      cancel,
      changeNum,
      changeSize,
      tabLoading,
      jurisdiction,
      relatedPersonnel,
      save,
      pageTitle,
      downLoading,
      handleDownload,
      handleDownloadRole,
      downRoleLoading
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
