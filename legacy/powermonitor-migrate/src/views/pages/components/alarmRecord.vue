<template>
    <g-layout title="报警记录">
        <template #header-btn>
            <a-button type="primary" :loading="exportLoading" @click="exportTable">导出</a-button>
        </template>
        <template #content-table>
            <s-table 
                ref="tableData"
                :api="api"
                :btns="[]"
                :search="search"
                :columns="columns"
            >
            </s-table>
        </template>
        <template #footer-btn>
            <a-button @click="goBack">返回</a-button>
        </template>
    </g-layout>
</template>
<script lang="jsx">
import { defineComponent, getCurrentInstance, reactive, toRefs } from "vue";
import { useRoute, useRouter } from "vue-router";
import moment from "moment"
export default defineComponent({
    setup(){
        const {proxy} = getCurrentInstance();
        const route = useRoute();
        const router = useRouter();
        const {alarmStatus,alarmHandlerTimeoutStatus,period,userId,alarmEvent} = route.query;
        const state = reactive({
            exportLoading:false,
            columns:[
                {
                    dataIndex:"alarmTime",
                    title:"报警时间",
                    slots:{
                        customRender:"alarmTime"
                    },
                    customRender:({text}) =>{
                        return text?moment(text).format("YYYY-MM-DD HH:mm:SS"):"--"
                    }
                },
                {
                    dataIndex:"alarmTargetName",
                    title:"报警设备",
                },
                {
                    dataIndex:"alarmLevelName",
                    title:"报警级别",
                },
                {
                    dataIndex:"alarmEventName",
                    title:"报警事件",
                },
                {
                    dataIndex:"areaName",
                    title:"报警区域",
                },
                {
                    dataIndex:"timeoutProcessTimes",
                    title:"处理时限",
                    slots:{
                        customRender:"timeoutProcessTimes"
                    },
                    customRender:({text,record,index}) =>{
                        return text?text:"--"
                    }
                },
                {
                    dataIndex:"alarmHandlerTimeoutStatusName",
                    title:"超时状态",
                },
                {
                    dataIndex:"alarmStatusName",
                    title:"处理状态",
                    slots:{
                        customRender:"alarmStatusName"
                    },
                    customRender:({text,record}) =>{
                        return text?text:"--"
                    }
                },
                {
                    dataIndex:"estimateHandlerTime",
                    title:"预计处理时间",
                    slots:{
                        customrender:"estimateHandlerTime"
                    },
                    customRender:({text}) =>{
                        return text?moment(text).format("YYYY-MM-DD HH:mm:SS"):"--"
                    }
                },
                {
                    dataIndex:"alarmHandlerName",
                    title:"处理人",
                    slots:{
                        customRender:"alarmHandlerName"
                    },
                    customRender:({text}) =>{
                        return text?text:"--"
                    }
                },
            ],
            search:[
                {
                    label:"",
                    components:"span",
                    value:"userId",
                    defaultValue:userId
                },
                {
                    label:"",
                    components:"span",
                    value:"alarmEvent",
                    defaultValue:alarmEvent
                },
                {
                    label:"",
                    components:"span",
                    value:"alarmStatus",
                    defaultValue:alarmStatus
                },
                {
                    label:"",
                    components:"span",
                    value:"alarmHandlerTimeoutStatus",
                    defaultValue:alarmHandlerTimeoutStatus
                },
                {
                    label:"",
                    components:"span",
                    value:"period",
                    defaultValue:period
                }
            ],
            api:{
                list:"getAlarmRecords"
            }
        })
        const goBack = () => {
            history.go(-1)
        };
        const exportTable = () =>{
            state.exportLoading = true;
            let period = statisticTable.value.form.period;
            proxy.$api.alarmRecordExport({alarmStatus:alarmStatus,alarmHandlerTimeoutStatus:alarmHandlerTimeoutStatus,period:period,userId:userId,alarmEvent:alarmEvent}).then(res =>{
                state.exportLoading = false;
                const link = document.createElement("a");
                let blob = new Blob([res], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
                link.style.display = "none";
                link.href = URL.createObjectURL(blob);
                link.setAttribute("download", "报警记录统计.xlsx");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }).catch(error =>{
                state.exportLoading = false;
            });
        }
        return {
            ...toRefs(state),
            goBack,
            exportTable
        }
    }
})
</script>

<style lang="less" scoped>
:deep(.content-search){
    padding-top: 0 !important;
}
:deep(.footer-btn){
    width: 100%;
    text-align: right;
}
</style>