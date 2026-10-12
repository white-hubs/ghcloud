<template>
<div>
    <div class="item-title">处理流程记录</div>
    <div class="table-box">
        <a-table :data-source="data" :columns="columns" :pagination="false" :bordered="true" size="small" :loading="loading"></a-table>
    </div>
</div>
</template>

<script lang="jsx">
import moment from "moment";
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs } from "vue";
import { useRoute } from "vue-router";
export default defineComponent({
    setup(){
        const route = useRoute()
        const {id} = route.query;
        const {proxy} = getCurrentInstance();
        const state = reactive({
            loading:false,
            data:[],
            columns:[
                {
                    title: '时间',
                    dataIndex: 'operatorTime',
                    slots:{
                        customRender:'operatorTime'
                    },
                    customRender:({text}) =>{
                        return text?moment(text).format("YYYY-MM-DD HH:mm:ss"):"--"
                    }
                },
                {
                    title: '操作人',
                    dataIndex: 'operatorByName',
                },
                {
                    title: '处理内容',
                    dataIndex: 'operatorContent',
                },
            ]
        })
        onMounted(() =>{
            getAlarmHandleProcess()
        })
        // 获取处理流程
        const getAlarmHandleProcess = () =>{
            state.loading = true;
            proxy.$api.getAlarmHandleProcess({id:id}).then(res =>{
                state.data = res;
                state.loading = false
            })
        }
        return {
            ...toRefs(state)
        }
    }
})
</script>

<style>

</style>