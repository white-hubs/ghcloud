<template>
    <g-table tableCode="INSPECTION_ITEMS" :title="pageTitle" :columns="columns" :api="api" :search="search" :btns="btns" :slots="slots"
        :rowSelection="rowSelection" :editMode="'page'" :rules="rules" @slot="operation" ref="tableRef">
        <template v-slot:btn="{ record }">
            <a-button type="link" @click="detail('detail', record)">详情</a-button>
            <a-button type="link" @click="detail('edit', record)">编辑</a-button>
        </template>
    </g-table>
</template>
<script lang="jsx">
import {
    defineComponent,
    getCurrentInstance,
    reactive,
    toRefs,
    ref,
} from "vue";
import { useRouter } from "vue-router";
import { usePageName } from '@ghcloud/cube-utils'
export default defineComponent({
  components: {
  },
    setup() {
        const { proxy } = getCurrentInstance();
        const tableRef = ref();
        const router = useRouter();
        const { pageTitle } = usePageName()
        const state = reactive({
            columns: [
                {
                    dataIndex: "alias",
                    title: "巡检项名称",
                    slots: {
                        customRender: "alias",
                    },
                    ellipsis: true,
                    customRender: ({ text }) => {
                        return (
                            <PopOver position="topLeft" content={text ? text : ""}>
                                {text ? text : "--"}
                            </PopOver>
                        );
                    },
                },
                {
                    dataIndex: "name",
                    title: "巡检项内容",
                    slots: {
                        customRender: "name",
                    },
                    ellipsis: true,
                    customRender: ({ text }) => {
                        return (
                            <PopOver position="topLeft" content={text ? text : ""}>
                                {text ? text : "--"}
                            </PopOver>
                        );
                    },
                },
                {
                    dataIndex: "resultNames",
                    title: "巡检结果项",
                    slots: {
                        customRender: "resultNames",
                    },
                    ellipsis: true,
                    customRender: ({ text }) => {
                        return (
                            <PopOver position="topLeft" content={text ? text : ""}>
                                {text ? text : "--"}
                            </PopOver>
                        );
                    },
                },
                {
                    dataIndex: "referTypeNames",
                    title: "适用对象",
                    slots: {
                        customRender: "referTypeNames",
                    },
                    ellipsis: true,
                    customRender: ({ text }) => {
                        return (
                            <PopOver position="topLeft" content={text ? text : ""}>
                                {text ? text : "--"}
                            </PopOver>
                        );
                    },
                },
                {
                    dataIndex: "action",
                    title: "操作",
                    slots: {
                        customRender: "action",
                    },
                    fixed: "right",
                    width: 200,
                },
            ],
            api: {
                list: "inspectItemTemplatePage",
                deleteSingle: "inspectItemTemplateDelete",
                // delete: "inspectPlanId",
                path: "/inspectionItemDetails",
            },
            btns: ["add", "deleteSingle"],
            search: [
                {
                    label: "适用对象",
                    value: "referType",
                    component: "g-select",
                    defaultValue: null,
                    field: { name: "label", id: "value" },
                    options: [{
                        name: '全部',
                        id: null
                    }, {
                        name: '设备',
                        id: "DEVICE"
                    }, {
                        name: '档位',
                        id: "STALL"
                    }, {
                        name: '资产',
                        id: "PROPERTY"
                    },{
                        name: '现场点',
                        id: "SITE_POINT"
                    },{
                        name: '风险源',
                        id: "RISK_SOURCE"
                    },{
                        name: '小散工程',
                        id: "SMALL_ENGINEERING"
                    }
                    ],
                    placeholder: "",
                },
                { label: "", value: "keyword", placeholder: "巡检项名称搜索" },
            ],
            rowSelection: false,
            btnStatus: "all",
        });

        const changeBtnStatus = (type) => {
            state.btnStatus = type;
            tableRef.value.searchRecord();
        };

        const operation = async (record, status) => {
            proxy.$api
                .inspectPlanStatus(
                    {
                        id: record.id,
                        startFlag: status,
                    },
                    "put"
                )
                .then(() => {
                    proxy.$message.success("操作成功");
                    tableRef.value.getData();
                });
        };

        const stop = async (record) => {
            await proxy.$api.taskStatus("put", {
                id: record.id,
                statusValue: "STOP",
            });
            proxy.$message.success("任务已停止");
            tableRef.value.getData();
        };

        const detail = (type, record) => {
            router.push({
                path: "/inspectionItemDetails",
                query: { id: record.id, type },
            });
        };

        return {
            ...toRefs(state),
            changeBtnStatus,
            operation,
            tableRef,
            detail,
            stop,
            pageTitle
        };
    },
});
</script>
  