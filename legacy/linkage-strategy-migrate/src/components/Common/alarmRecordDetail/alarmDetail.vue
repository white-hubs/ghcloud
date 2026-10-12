<template>
<div class="tab-pane-content">
    <div class="sub-item">
        <div class="sub-item-header">
            <g-vertical-line title="报警详情"></g-vertical-line>
        </div>
        <div class="sub-item-content">
            <a-row type="flex" :gutter="[16,16]">
                <a-col :span="8">报警对象：{{detail.alarmTargetName}}</a-col>
                <a-col :span="8">报警级别：{{detail.alarmLevelName}}</a-col>
                <a-col :span="8">报警时间：{{putFullTime(detail.alarmTime)}}</a-col>
                <a-col :span="8">报警事件：{{detail.alarmEventName}}</a-col>
            </a-row>
        </div>
    </div>
    <div class="sub-item">
        <div class="sub-item-header">
            <g-vertical-line title="处理结果"></g-vertical-line>
        </div>
        <div class="sub-item-content">
            <a-row :gutter="[16,16]">
                <a-col :span="24">处理状态：{{handelStatus(detail.alarmConfirmedStatus)}}</a-col>
                <a-col :span="24">处理流程：</a-col>
                <a-col :span="24">
                    <a-table :dataSource="data" :columns="columns" :pagination="false" bordered size="small"></a-table>
                </a-col>
            </a-row>
        </div>
    </div>
</div>
</template>

<script>
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs,computed } from "vue";
import {putFullTime} from "@/utils/common"
import {alarmStatus} from "@/utils/enumerate"
export default defineComponent({
    props:{
        id:{
            type:[Number,String],
            default:''
        }
    },
    setup(props) {
        const {proxy} = getCurrentInstance();
        const handelStatus = computed(() =>(key) =>{
            const data =  alarmStatus.find(item =>{
                return item.value == key
            })
            if(data){
                return data?.label || '--'
            }
        })
        const state = reactive({
            detail:{},
            putFullTime:putFullTime,
            data:[],
            columns:[
                {
                    title: '时间',
                    dataIndex: 'operatorTime',
                    key: 'operatorTime',
                },
                {
                    title: '操作人',
                    dataIndex: 'operatorByName',
                    key: 'operatorByName',
                },
                {
                    title: '处理内容',
                    dataIndex: 'operatorContent',
                    key: 'operatorContent',
                },
            ]
        })
        onMounted(() =>{
            getAlaramDetail();
            getAlarmHandelProcess()
        })
        const getAlaramDetail = async () =>{
            const data = await proxy.$api.getAlaramDetail({id:props.id});
            if(data){
                state.detail = data
            }
        }
        // 获取处理流程
        const getAlarmHandelProcess = async () =>{
            const data = await proxy.$api.getAlarmHandelProcess({id:props.id});
            if(data){
                state.data = data
            }
        }
        return{
            ...toRefs(state),
            handelStatus
        } 
    }
})
</script>

<style>

</style>