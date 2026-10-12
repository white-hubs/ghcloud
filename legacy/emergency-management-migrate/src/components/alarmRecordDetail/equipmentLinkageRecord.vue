<template>
<div class="sub-item">
    <div class="sub-item-header">
        <g-vertical-line title="联动日志"></g-vertical-line>
    </div>
    <div class="sub-item-content">
        <a-table :dataSource="linkageRecordData" :columns="linkageRecordColumns" :pagination="false" bordered size="small"></a-table>
    </div>
</div>
</template>

<script lang="jsx">
import { defineComponent, onMounted, reactive, toRefs,getCurrentInstance } from "vue";
import {putFullTime} from "@/utils/common"
import {actionResult} from "@/utils/enumerate"
import { useRoute } from "vue-router";
export default defineComponent({
    setup(props){
        const {proxy} = getCurrentInstance();
        const route = useRoute();
        const {businessKey} = route.query;
        const state = reactive({
            linkageRecordData:[],
            linkageRecordColumns:[
                {
                    title: '执行时间',
                    dataIndex: 'executeTime',
                    key: 'executeTime',
                    slots:{
                        customRender:'executeTime'
                    },
                    customRender:({text}) =>{
                        return putFullTime(text) 
                    }
                },
                {
                    title: '触发人',
                    dataIndex: 'operatorName',
                    key: 'operatorName',
                },
                {
                    title: '设备名称',
                    dataIndex: 'deviceName',
                    key: 'deviceName',
                },
                {
                    title: '设备属性',
                    dataIndex: 'propName',
                    key: 'propName',
                },
                {
                    title: '执行动作',
                    dataIndex: 'propValue',
                    key: 'propValue',
                },
                {
                    title: '执行结果',
                    dataIndex: 'executeStatus',
                    key: 'executeStatus',
                    slots:{
                        customRender:'executeStatus'
                    },
                    customRender:({text}) =>{
                        const data = actionResult.find(item =>item.value === text);
                        if(data){
                            return data.label
                        }else{
                            return '--'
                        }
                    }
                }
            ]
        })
        onMounted(() =>{
            getDeviceLinkageRecord();
        })
        const getDeviceLinkageRecord = async () =>{
            const data = await proxy.$api.getIotDeviceProRecords({eventId:businessKey});
            if(data){
                state.linkageRecordData = data
            }
        }
        return {
            ...toRefs(state)
        }
    }
})
</script>

<style>

</style>