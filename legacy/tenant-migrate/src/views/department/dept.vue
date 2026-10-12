<template lang="pug">
g-layout(:title="pageTitle")
  template(#header-btn)
      a-button(type="primary" @click="handleDownload()" :disabled="data.length === 0" :loading="downLoading") 导出
      a-button(type="primary" @click="addDept('')") 新增
  template(#content-search)
    a-form(layout="inline" :model="searchForm" ref="formRef")
      a-form-item(name="name")
        a-input(v-model:value.trim="searchForm.name" placeholder="请输入部门名称" :maxlength="20")
      a-form-item
        a-button(type="primary" @click="getDeptList") 查询
  template(#content-table)
    a-table(
      :columns="columns" 
      :data-source="data" 
      :loading="tabLoading" 
      size="small" 
      rowKey="id" 
      bordered 
      :pagination="false" 
      :locale="{emptyText: '暂无数据'}" 
      :expandRowByClick="true" 
      :scroll="{y:tableScrollY}")
      template(#expandIcon="{record,expanded}")
        span(v-if="record.children.length")
          CaretRightOutlined(v-if="!expanded")
          CaretDownOutlined(v-else)
      template(#switch="{ record }")
        span(@click.stop="")
          a-switch(:checked="record.enabled" @change="checked =>changeEnabled(checked,record)"
           checked-children="启用" 
                un-checked-children="禁用")
      template(#button="{ record }")
        span
          a-space(:size="12")
            a(@click.stop="editDept(record)" class="a_primary") 编辑
            a(@click.stop="addDept(record.id)" class="a_primary") 新增下级
            a(@click.stop="deleteDept(record)" class="a_danger") 删除
</template>
<script lang="jsx">
import {
  defineComponent,
  onMounted,
  reactive,
  toRefs,
  createVNode,
  ref,
  getCurrentInstance,
} from "vue";
import { CaretDownOutlined, CaretRightOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
// import {deleteNullChild} from "@/utils/common"
import { historyPush } from "@/utils/utils"
import axios from "@/utils/axios";
import _ from "lodash";
import { Modal } from "ant-design-vue";
import { cubeOuaaService } from "@/api/service";
import { usePageName, useDownloadExcel, queryParameter } from '@ghcloud/cube-utils'

export default defineComponent({
  components: { CaretDownOutlined, CaretRightOutlined },
  setup() {
    const confirm = Modal.confirm;
    const { proxy } = getCurrentInstance();
    const formRef = ref();
    const router = useRouter();
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
        return await cubeOuaaService.getOrganizationsExcel(params)
      }
    })
    const state = reactive({
      tabLoading: false,
      searchForm: {
        name: "",
      },
      api: { list: "organizations" },
      columns: [
        {
          title: "部门名称",
          dataIndex: "name",
          width: 220,		
          align: "left",
           customRender: ({ text }) => {
             return <PopOver content={text}>{text}</PopOver>
          },
        },
        {
          title: "人数",
          dataIndex: "members",
          width: 220,		
          align: "left",
          customRender: ({ text }) => {
            if (text) {
              return  <PopOver content={text}>{text}</PopOver>;
            } else {
              return  <PopOver content='0'>0</PopOver>;
            }
          },
        },
        {
          title: "备注",
          dataIndex: "remark",
          width: 220,		
          align: "left",
          customRender: ({ text }) => {
            if (text) {
              return text;
            } else {
              return "--";
            }
          },
        },
        {
          title: "部门状态",
          width: 220,		
          dataIndex: "",
          slots: { customRender: "switch" },
          align: "left",
        },
        {
          title: "操作",
          dataIndex: "",
          slots: { customRender: "button" },
        },
      ],
      data: [],
      iconDown: createVNode(CaretDownOutlined),
      iconRight: createVNode(CaretRightOutlined),
      tableScrollY: 0,
    });
    onMounted(() => {
      const cacheQuery = queryParameter.getQuery() || {};
      state.searchForm.name = cacheQuery.name ?? "";
      getDeptList();
      window.onresize = () => {
        getScrollY();
      };
    });
    const getDeptList = async () => {
      state.tabLoading = true;
      queryParameter.setAddressQuery({
        name: state.searchForm.name || undefined,
      });
      const data = await proxy.$api.organizations("get", {
        name: state.searchForm.name,
        // enabled: true,
      });
      state.tabLoading = false;
      if (data && data instanceof Array) {
        state.data = data;
      }
      setTimeout(() => { getScrollY() }, 100);
    };
    const expandIcon = (props) => {
      if (props.record.children && props.record.children.length) {
        if (props.expanded) {
          return createVNode(CaretDownOutlined);
        } else {
          return createVNode(CaretRightOutlined);
        }
      }
    };
    const changeEnabled = async (checked, record) => {
      const params = _.cloneDeep(record);
      params.enabled = checked;
      await proxy.$api.organizationId("put", params);
      proxy.$message.success("操作成功");
      getDeptList();
      // record.enabled = checked;
    };
    const reset = () => {
      formRef.value.resetFields();
      queryParameter.setAddressQuery({});
      getDeptList();
    };
    const editDept = (item) => {
      historyPush({ item: JSON.stringify(item) }, '/dept/editDept')
    };
    const deleteDept = (record) => {
      const contentTip = record?.children.length > 0 ? '该部门下有子部门，是否确认删除该部门？' : '是否确认删除该部门？'
      confirm({
        title: "提示",
        content: contentTip,
        okText: "确认",
        cancelText: "取消",
        okType: "danger",
        onOk: async () => {
          return new Promise(async (resolve, reject) => {
            try {
              await proxy.$api.deleteOrganization(`delete`, record.id);
              proxy.$message.success("操作成功");
              getDeptList();
              resolve();
            } catch (error) {
              reject();
            }
          })
        },
      });
    };
    const addDept = (id) => {
      historyPush({id}, '/dept/editDept')
    };
    const getScrollY = () => {
      state.tableScrollY = document.querySelector('.content-table').clientHeight - 75
      const tableBody = document.getElementsByClassName("content-table")[0];
      tableBody.style.height = state.tableScrollY + "px";
    }

    return {
      ...toRefs(state),
      expandIcon,
      deleteDept,
      editDept,
      addDept,
      getDeptList,
      changeEnabled,
      formRef,
      reset,
      pageTitle,
      downLoading,
      handleDownload
    };
  },
});
</script>

<style></style>
