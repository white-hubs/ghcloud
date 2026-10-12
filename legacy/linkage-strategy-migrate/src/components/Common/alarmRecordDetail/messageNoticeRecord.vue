<template>
<div class="tab-pane-content">
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

<script>
import { defineComponent, reactive, toRefs,getCurrentInstance, onMounted } from "vue";
import {putFullTime} from "@/utils/common"
export default defineComponent({
    props:{
        businessKey:{
            type:[Number,String],
            default:""
        }
    }, 
    setup(props){
        const { proxy } = getCurrentInstance();
        const state = reactive({
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
                    slots:{
                        customRender:'channelTypeName'
                    },
                    customRender:({text}) =>{
                       return text
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
        
        // 消息通知
        const getMsgRecordTargets = async () =>{
            const data = await proxy.$api.getMsgRecordTargets({businessKey:props.businessKey});
            if(data){
                state.messageNoticeData = data
            }
        }
        onMounted(() =>{
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