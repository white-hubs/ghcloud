<template>
<div class="tab-pane-content">
    <div class="sub-item">
        <div class="sub-item-header">
            <g-vertical-line title="报警通知"></g-vertical-line>
        </div>
        <div class="sub-item-content">
            <a-table :dataSource="alarmNoticeData" :columns="alarmNoticeCloumn" :pagination="false" bordered size="small"></a-table>
        </div>
    </div>
    <div class="sub-item">
        <div class="sub-item-header">
            <g-vertical-line title="消息信息"></g-vertical-line>
        </div>
        <div class="sub-item-content">
            <a-table :dataSource="messageNoticeData" :columns="messageNoticeColumn" :pagination="false" bordered size="small"></a-table>
        </div>
    </div>
</div>
</template>

<script lang="jsx">
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs } from "vue";
import {putFullTime} from "@/utils/common"
import { useRoute } from "vue-router";
export default defineComponent({
    setup(props){
        const {proxy} = getCurrentInstance();
        const route = useRoute();
        const {businessKey} = route.query;
        const state = reactive({
            alarmNoticeData:[],
            alarmNoticeCloumn:[
                {
                    title: '通知时间',
                    dataIndex: 'sendTime',
                    slots:{
                        customRender:'sendTime'
                    },
                    customRender:({text}) =>{
                        return putFullTime(text)
                    }
                },
                {
                    title: '通知人员',
                    dataIndex: 'userName',
                },
                {
                    title:"通知终端",
                    dataIndex:"terminalName"
                },
                {
                    title: '通知结果',
                    dataIndex: 'sendStatus',
                    slots:{
                        customRender:'sendStatus'
                    },
                    customRender:({text}) =>{
                       return text?'成功':'失败'
                    }
                },
            ],
            messageNoticeData:[],
            messageNoticeColumn:[
                {
                    title: '通知时间',
                    dataIndex: 'sendTime',
                    slots:{
                        customRender:'sendTime'
                    },
                    customRender:({text}) =>{
                        return putFullTime(text)
                    }
                },
                {
                    title: '通知方式',
                    dataIndex: 'channelTypeName',
                },
                {
                    title:"通知终端",
                    dataIndex:"terminalName",
                    slots:{
                        customRender:'terminalName' 
                    },
                    customRender:({text}) =>{
                        return text?text:'--'
                    }
                },
                {
                    title: '通知人员',
                    dataIndex: 'userName',
                },
                {
                    title: '通知结果',
                    dataIndex: 'sendStatus',
                    slots:{
                        customRender:'sendStatus'
                    },
                    customRender:({text}) =>{
                       return text?'成功':'失败'
                    }
                },
            ]
        })
        // 报警通知
        const getAlarmNoticePersonList = async () =>{
            const data = await proxy.$api.getAlaramNoticPersonnerList({businessKey:businessKey});
            if(data){
                state.alarmNoticeData = data;
            }
        }
        // 消息通知
        const getMsgRecordTargets = async () =>{
            const data = await proxy.$api.getMsgRecordTargets({businessKey:businessKey});
            if(data){
                state.messageNoticeData = data
            }
        }
        onMounted(() =>{
            getAlarmNoticePersonList();
            getMsgRecordTargets()
        })
        return {
            ...toRefs(state)
        }
    }
})
</script>

<style>

</style>