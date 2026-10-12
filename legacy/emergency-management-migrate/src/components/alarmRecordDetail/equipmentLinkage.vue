<template>
<div class="sub-item">
    <div class="sub-item-header">
        <g-vertical-line title="设备联动"></g-vertical-line>
    </div>
    <div class="sub-item-content">
        <a-table :dataSource="linkageTableData" :columns="linkageTableColumns" :pagination="false" bordered size="small">
            <template #action="{record}">
                <a-popconfirm title="是否确认执行？" @confirm="implement(record)">
                    <a-button type="link">执行</a-button>
                </a-popconfirm>
            </template>
        </a-table>
    </div>
</div>
</template>

<script lang="jsx">
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs } from "vue";
import { useRoute } from "vue-router";
export default defineComponent({ 
    setup(props){
        const {proxy} = getCurrentInstance();
        const route = useRoute();
        const {businessKey} = route.query;
        const state = reactive({
            linkageTableData:[],
            linkageTableColumns:[
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
                    title: '执行方式',
                    dataIndex: 'executeMode',
                    key: 'executeMode',
                    slots:{
                        customRender:'executeMode'
                    },
                    customRender:({text}) =>{
                        return text === 'AUTOMATIC' ? '自动' : '手动'
                    }
                },
                {
                    title: '操作',
                    dataIndex: 'action',
                    key: 'action',
                    slots:{
                        customRender:'action'
                    },
                }
            ],
        })
        onMounted(() =>{
            getDeviceLinkageList();
        })
        const getDeviceLinkageList = async () =>{
            const data = await proxy.$api.getIotDeviceListByEvent({eventId:businessKey});
            if(data){
                state.linkageTableData = data
            }
        }
        const implement = async(record) =>{
            const data = await proxy.$api.manualControlIotDevice({eventIotDeviceId:record.id});
            if(data){
                proxy.$message.success("下发指令成功！")
            }
        }
        return {
            ...toRefs(state),
            implement
        }
    }
})
</script>

<style>

</style>