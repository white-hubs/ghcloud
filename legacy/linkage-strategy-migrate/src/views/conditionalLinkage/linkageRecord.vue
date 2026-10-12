<template>
    <div class="content">
        <g-table :title="pageTitle" tableCode="LINKAGE_RECORD" :api="api" :btns="btns" :search="search" :columns="columns" :scrollX="0"
            :beforeGet="beforeGet" editMode="page">
        </g-table>
    </div>
</template>
<script>
import { defineComponent, reactive, toRefs } from "vue";
import { putFullTime } from "@/utils/common"
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
    setup() {
        const { pageTitle } = usePageName()
        const state = reactive({
            api: {
                list: "getTriggerLinkageRecords",
                path: "/conditionalLinkageDetail",
            },
            btns: ["detail"],
            search: [
                {
                    label: "",
                    value: "applicationCode",
                    component: "span",
                    defaultValue: "DEVICE"
                },
                {
                    label: "",
                    value: "businessType",
                    component: "span",
                    defaultValue: "DEVICE_CONDITION"
                },
                {
                    label: "时间范围",
                    value: "date",
                    defaultDate: "period",
                    component: "a-range-picker",
                },
                { label: "", value: "keyword", placeholder: "请输入联动名称搜索" },
            ],
            columns: [
                {
                    title: "触发时间",
                    dataIndex: "triggerTime",
                    key: "triggerTime",
                    customRender: ({ text }) => {
                        return putFullTime(text)
                    },
                    width: 100,
                },
                {
                    title: "联动名称",
                    dataIndex: "name",
                    key: "name",
                    width: 100,
                },
                {
                    title: "操作",
                    dataIndex: "action",
                    width: 100,
                    key: "action",
                    slots: {
                        customRender: 'action'
                    }
                }
            ]
        })
        const beforeGet = (params) => {
            return {
                ...params,
                businessType: 'DEVICE_CONDITION',
                applicationCode: 'DEVICE'
            }
        }
        return {
            beforeGet,
            ...toRefs(state),
            pageTitle
        }
    }
})
</script>
<style scoped>
.content {
    height: 82vh;
    overflow: hidden;
}
</style>