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
</div>
</template>

<script>
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs } from "vue";
import {putFullTime} from "@/utils/common"
export default defineComponent({
    props:{
        businessKey:{
            type:[Number,String],
            default:""
        }
    },  
    setup(props){
        const {proxy} = getCurrentInstance();
        const state = reactive({
            alarmNoticeData:[],
            alarmNoticeCloumn:[
                {
                    title: '通知时间',
                    dataIndex: 'sendTime',
                    key: 'sendTime',
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
                    key: 'userName',
                },
                {
                    title: '通知结果',
                    dataIndex: 'sendStatus',
                    key: 'sendStatus',
                    slots:{
                        customRender:'sendStatus'
                    },
                    customRender:({text}) =>{
                       return text?'成功':'失败'
                    }
                },
            ],
        })
        // 报警通知
        const getAlarmNoticePersonList = async () =>{
            const data = await proxy.$api.getAlaramNoticPersonnerList({businessKey:props.businessKey});
            if(data){
                state.alarmNoticeData = data;
            }
        }
        onMounted(() =>{
            getAlarmNoticePersonList()
        })
        return {
            ...toRefs(state)
        }
    }
})
</script>

<style>

</style>