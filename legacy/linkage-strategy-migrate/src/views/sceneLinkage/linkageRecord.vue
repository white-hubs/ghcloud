<template>
    <div class="content">
        <g-table :title="pageTitle" :scrollX="0" tableCode="SCENE_LINKAGE_RECORD" :api="api" :btns="btns" :search="search" :beforeGet="beforeGet" :columns="columns"
            editMode="page">
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
                path: "/sceneLinkageDetail",
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
                    defaultValue: "SCENE_CONTROL"
                },
                {
                    label: "时间范围",
                    value: "date",
                    defaultDate: "period",
                    component: "a-range-picker",
                },
                { label: "", value: "keyword", placeholder: "请输入场景名称搜索" },
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
                    title: "场景名称",
                    dataIndex: "name",
                    key: "name"
                },
                {
                    title: "操作人",
                    dataIndex: "operatorName",
                    key: "operatorName"
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
                businessType: 'SCENE_CONTROL'
            }
        }
        return {
            ...toRefs(state),
            beforeGet,
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