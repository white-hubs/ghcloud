<template lang="pug">
a-layout
  a-layout-header(class="form_header")
    a-form(layout="inline" :model="searchForm" ref="formRef")
      a-form-item(name="name")
        a-input(v-model:value.trim="searchForm.name" :placeholder="`请输入${KEYWORD_ALIAS.company}名称`" :maxlength="20")
      a-form-item
        a-button(type="primary" @click="getDeptList") 查询
      a-form-item
        a-button(type="default" @click="reset") 重置
  a-layout-content(class="info_content")
    TableView(:tableTitle="`${KEYWORD_ALIAS.company}列表`" :showButton="false")
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
        :scroll="{y:570}")
        template(#switch="{ record }")
          //- span(@click.stop="")
            a-switch(:checked="record.enabled" @change="checked =>changeEnabled(checked,record)")
          span
            span(:class="record.enabled? 'tableDotNormal':'tableDotDelete'")
            span(class="tableStatus pl1" ) 已通过
        template(#button="{ record }")
          span
            a-space(:size="12")
              a(@click.stop="editDept(record)" class="a_primary") 编辑
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
// import {deleteNullChild} from "@/utils/common"
import axios from "@/utils/axios";
import _ from "lodash";
import { Popover } from "ant-design-vue";
import { KEYWORD_ALIAS } from '@ghcloud/cube-business-alias-manage-plugin'
import { queryParameter } from '@ghcloud/cube-utils'
import { historyPush } from "@/utils/utils"
export default defineComponent({
  components: { CaretDownOutlined, CaretRightOutlined },
  setup() {
    const { proxy } = getCurrentInstance();
    const formRef = ref();
    const state = reactive({
      tabLoading: false,
      searchForm: {
        name: "",
      },
      columns: [
        {
          title: `${KEYWORD_ALIAS.company}名称`,
          dataIndex: "name",
          align: "left",
          slots: {
            customRender: "name",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver  content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "启用状态",
          dataIndex: "",
          slots: { customRender: "switch" },
          align: "left",
        },
        {
          title: "备注",
          dataIndex: "remark",
          align: "left",
          slots: {
            customRender: "remark",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver  content={text}>
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
    });

    onMounted(() => {
      const cacheQuery = queryParameter.getQuery() || {};
      state.searchForm.name = cacheQuery.name ?? "";
      getDeptList();
    });

    const getDeptList = async () => {
      // 获取企业列表
      state.tabLoading = true;
      queryParameter.setAddressQuery({
        name: state.searchForm.name || undefined,
      });
      const data = await proxy.$api.tenant("get", data);

      state.tabLoading = false;
      if (data && data instanceof Array) {
        state.data = data;
      }
    };

    const changeEnabled = async (checked, record) => {
      const params = _.cloneDeep(record);
      params.enabled = checked;
      await proxy.$api.organizationId("put", params);
      record.enabled = checked;
    };

    const reset = () => {
      formRef.value.resetFields();
      queryParameter.setAddressQuery({});
      getDeptList();
    };

    const editDept = (item) => {
      historyPush({ id: item.id }, '/businessInfoOperate');
    };

    return {
      ...toRefs(state),
      editDept,
      getDeptList,
      changeEnabled,
      formRef,
      reset,
      KEYWORD_ALIAS
    };
  },
});
</script>

<style></style>
