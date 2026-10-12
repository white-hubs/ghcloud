<template>
  <div class="content">
    <g-table :title="pageTitle" tableCode="LINKAGE_RULE" :api="api" :btns="btns" :search="search" :columns="columns"
      :scrollX="800" :slots="slots" @slot="updateEnabled" ref="tableData" :rowSelection="true" editMode="page">
    </g-table>
  </div>
</template>
<script>
import { defineComponent, getCurrentInstance, reactive, toRefs, ref } from "vue";
import { putFullTime } from "@/utils/common";
import { types } from "@/utils/enumerate";
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const tableData = ref(null);
    const { pageTitle } = usePageName()
    const state = reactive({
      api: {
        list: "conditionRulePage",
        deleteSingle: "deleteRule",
        delete: "batchDeleteRule",
        path: "/conditionalLinkageEdit",
      },
      btns: ["add", "deleteSingle", "edit", "delete"],
      search: [
        {
          label: "是否启用",
          value: "enabled",
          options: types,
          component: "g-select",
          defaultValue: null,
        },
        { label: "", value: "keyword", placeholder: "请输入联动名称搜索" },
      ],
      columns: [
        {
          title: "联动名称",
          dataIndex: "name",
        },
        {
          title: "触发次数",
          dataIndex: "triggerNum",
          slots: {
            customRender: "triggerNum",
          },
          customRender: ({ text }) => {
            return text == null ? "0" : text;
          },
        },
        {
          title: "创建人",
          dataIndex: "createByName",
        },
        {
          title: "更新时间",
          dataIndex: "updateTime",
          slots: {
            customRender: "updateTime",
          },
          customRender: ({ text }) => {
            return putFullTime(text);
          },
        },
        {
          title: "是否启用",
          dataIndex: "enabled",
          slots: {
            customRender: "enabled",
          },
        },
        {
          title: "操作",
          dataIndex: "action",
          slots: {
            customRender: "action",
          },
        },
      ],
      slots: [
        {
          slot: "enabled",
          component: "a-switch",
        },
      ],
    });
    // 修改启用状态
    const updateEnabled = async (key, record) => {
      const data = await proxy.$api.changeRuleEnabled({
        id: record.id,
        enabled: record.enabled,
      });
      if (data) {
        tableData.value.getData();
        proxy.$message.success("设置成功！");
      }
    };
    return {
      ...toRefs(state),
      updateEnabled,
      tableData,
      pageTitle
    };
  },
});
</script>
<style scoped>
.content {
  height: 80vh;
}

/* .contet{
heightvh;
} */
</style>
<!-- <template>
    <div class="content">
        <g-layout title="联动规则">
            <template #header-btn>
                <a-button type="primary" @click="addLinkage">新增</a-button>
            </template>
            <template #content-search>
                <a-form layout="inline">
                    <a-form-item>
                        <a-input v-model:value="search.keyword" placeholder="请输入联动名称搜索"></a-input>
                    </a-form-item>
                    <a-form-item label="是否启用">
                        <g-select :options="types" :field="null" v-model:value="search.enabled" style="width:200px"></g-select>
                    </a-form-item>
                    <a-form-item>
                        <a-space :size="16">
                            <a-button type="primary" @click="queryData">查询</a-button>
                            <a-button @click="reset">重置</a-button>
                        </a-space>
                    </a-form-item>
                </a-form>
            </template>
            <template #content-table>
                <a-table :dataSource="data" :columns="columns" :pagination="false">
                    <template #enable="{record}">
                        <a-switch v-model:checked="record.enable" />
                    </template>
                    <template #action="{record}">
                        <a-button type="link" @click="handelEdit(record)">编辑</a-button>
                        <a-popconfirm title="是否确认删除？" @confirm="handelDelete(record)">
                            <a-button type="link" danger>删除</a-button>
                        </a-popconfirm>
                    </template>
                </a-table>
            </template>
            <template #footer-page>
                <a-pagination v-model:current="search.pageNumber" v-model:page-size="search.pageSize" :total="total" :show-total="total => `共 ${total} 条数据`" @change="changePage"/>
            </template>
        </g-layout>
    </div>
</template>

<script>
import { defineComponent, getCurrentInstance, onMounted, reactive, ref, toRefs } from "vue";
import {types} from "@/utils/enumerate"
import { useRouter } from "vue-router";
import { cloneDeep } from 'lodash-es';
import {putFullTime} from "@/utils/common"
export default defineComponent({
    setup(){
        const {proxy} = getCurrentInstance();
        const router = useRouter();
        const initSearch = ref(null);
        const state = reactive({
            types:types,
            search:{
                keyword:"",
                enabled:"",
                pageNumber:1,
                pageSize:10,
            },
            columns:[
                {
                    title: '联动名称',
                    dataIndex: 'name',
                },
                {
                    title: '触发次数',
                    dataIndex: 'triggerNum',
                    slots:{
                        customRender:'triggerNum'
                    },
                    customRender:({text}) =>{
                        return text == null?'0':text
                    }
                },
                {
                    title: '创建人',
                    dataIndex: 'createByName',
                },
                {
                    title: '更新时间',
                    dataIndex: 'updateTime',
                    slots:{
                        customRender:'updateTime'
                    },
                    customRender:({text}) =>{
                        return putFullTime(text)
                    }
                },
                {
                    title: '操作',
                    dataIndex: 'action',
                    slots: {
                        customRender: "action",
                    },
                }
            ],
            data:[],
            total:100
        })
        onMounted(() =>{
            initSearch.value = cloneDeep(state.search);
            getConditionRulePage();
        })
        const getConditionRulePage = async () =>{
            const data = await proxy.$api.conditionRulePage(state.search);
            if(data){
                state.data = data.records;
                state.total = data.total;
            }
        }
        const changePage = (page,pageSize) =>{
            state.search.pageNumber = page;
            getConditionRulePage()
        }
        const queryData = () =>{
            state.search.pageNumber = 1;
            getConditionRulePage()
        }
        const reset = () =>{
            state.search = cloneDeep(initSearch.value);
            getConditionRulePage()
        }
        const addLinkage = () =>{
            router.push({path:"/conditionalLinkageEdit"})
        }
        const handelEdit = (record) =>{
            router.push({
                path:"/conditionalLinkageEdit",
                query:{id:record.id}
            })
        }
        const handelDelete = async (record) =>{
            const data = await proxy.$api.deleteRule({id:record.id});
            if(data){
                getConditionRulePage();
                proxy.$message.success("操作成功！")
            }
        }
        return{
            ...toRefs(state),
            addLinkage,
            handelEdit,
            handelDelete,
            changePage,
            queryData,
            reset
        }
    }
})
</script>

<style>
</style> -->
