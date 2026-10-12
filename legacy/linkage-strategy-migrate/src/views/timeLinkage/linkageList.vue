<template>
    <div class="content">
        <g-table :title="pageTitle"
            :api="api"
            :btns="btns"
            :search="search"
            :columns="columns"
            :slots="slots"
            tableCode="TIME_LINKAGE"
            :scrollX="800"
            editMode="page"
            :rowSelection="true"
            @slot="updateEnabled"
            ref="tableData"
            >
        </g-table>
    </div>
</template>

<script>
import { defineComponent, reactive, toRefs,ref, getCurrentInstance } from "vue";
import { usePageName } from '@ghcloud/cube-utils'

import moment from 'moment'
export default defineComponent({
    setup(){
        const {proxy} = getCurrentInstance();
        const tableData = ref(null);
        const { pageTitle } = usePageName()
        const state = reactive({
            api:{
                list:"getTimeingTaskPage",
                deleteSingle:"deleteRule",
                delete:"batchDeleteRule",
                path:"/timeLinkageEdit"
            },
            btns:["add","edit","deleteSingle","delete"],
            search:[
                { label: "", value: "keyword", placeholder: "请输入任务名称搜索" },
            ],
            columns:[
                {
                    title: '定时任务名称',
                    dataIndex: 'name',
                    key: 'name',
                },
                {
                    title: '周期类型',
                    dataIndex: 'looped',
                    key: 'looped',
                    customRender:({text}) =>{
                        return text?'循环':'单次'
                    }
                },
                {
                    title: '更新时间',
                    dataIndex: 'updateTime',
                    key: 'updateTime',
                    customRender:({text}) =>{
                        return moment(text).format('YYYY-MM-DD HH:mm:ss')
                    }
                },
                {
                    title: '执行次数',
                    dataIndex: 'triggerNum',
                    key: 'triggerNum',
                  
                },
                {
                    title: '是否启用',
                    dataIndex: 'enabled',
                    key: 'enabled',
                    slots:{
                        customRender:"enabled"
                    }
                },
                {
                    title: '操作',
                    dataIndex: 'action',
                    key: 'action',
                    slots:{
                        customRender:"action"
                    }
                },
            ],
            slots:[
                {
                    slot:"enabled",
                    component:"a-switch",
                }
            ],
        })
        // 修改启用状态
        const updateEnabled = async (key,record) =>{
            const data = await proxy.$api.changeRuleEnabled({id:record.id,enabled:record.enabled});
            if(data){
                tableData.value.getData();
                proxy.$message.success("设置成功！");
                
            }
        }
        return{
            ...toRefs(state),
            updateEnabled,
            tableData,
            pageTitle
        }
    }
})
</script>

<style scoped>
.content{
height: 82vh;
overflow: auto;

}

</style>