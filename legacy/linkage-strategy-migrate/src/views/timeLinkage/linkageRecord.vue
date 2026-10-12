<template>
    <div class="content">
        <g-table :title="pageTitle" :api="api" :btns="btns" :search="search" tableCode="TIME_LINKAGE_RECORD"
            :columns="columns" :beforeGet="beforeGet" editMode="page">
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
                path: "/timeLinkageDetail"
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
                    defaultValue: "TIMING_CONTROL"
                },
                {
                    label: "时间范围",
                    value: "date",
                    defaultDate: "period",
                    component: "a-range-picker",
                },
                { label: "", value: "keyword", placeholder: "请输入任务名称搜索" },
            ],
            columns: [
                {
                    title: "触发时间",
                    dataIndex: "triggerTime",
                    key: "triggerTime",
                    customRender: ({ text }) => {
                        return putFullTime(text)
                    }
                },
                {
                    title: "事件名称",
                    dataIndex: "name",
                    key: "name"
                },
                {
                    title: "操作",
                    dataIndex: "action",
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
                applicationCode: 'DEVICE',
                businessType: 'TIMING_CONTROL'
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