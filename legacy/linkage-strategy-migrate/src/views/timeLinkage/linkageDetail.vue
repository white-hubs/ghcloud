<template>
    <div class="content">
        <g-layout title="事件详情">
            <template #content-table>
                <a-tabs v-model:activeKey="activeKey">
                    <a-tab-pane key="1" tab="事件详情">
                        <div class="tab-pane-content" v-if="detail">
                            <div class="sub-item">
                                <div class="sub-item-header">
                                    <g-vertical-line title="事件信息"></g-vertical-line>
                                </div>
                                <div class="sub-item-content">
                                    <a-row type="flex" :gutter="[16,16]">
                                        <a-col :span="8">任务名称：{{detail.name}}</a-col>
                                        <a-col :span="8">执行时间：{{putFullTime(detail.triggerTime)}}</a-col>
                                    </a-row>
                                </div>
                            </div> 
                        </div>
                    </a-tab-pane>
                    <a-tab-pane key="2" tab="通知记录">
                        <message-notice-record :businessKey="id"></message-notice-record>
                    </a-tab-pane>
                    <a-tab-pane key="3" tab="设备联动">
                        <equipment-linkage-record :businessKey="id"></equipment-linkage-record>
                    </a-tab-pane>
                    <a-tab-pane key="4" tab="监控联动">
                        <video-linkage :businessKey="id"></video-linkage>
                    </a-tab-pane>
                </a-tabs>
            </template>
            <template #footer-btn>
                <a-button @click="back">返回</a-button>
            </template>
        </g-layout>
    </div>
</template>

<script>
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs } from "vue";
import { useRoute, useRouter } from "vue-router";
import {putFullTime} from "@/utils/common"
export default defineComponent({
    setup(){
        const {proxy} = getCurrentInstance();
        const route = useRoute();
        const router = useRouter();
        const {id} = route.query
        const state = reactive({
            detail:{},
            putFullTime:putFullTime
        })
        const getLinkageEventDetail = async () =>{
            const data = await proxy.$api.getLinkageEventDetail({id:id});
            if(data){
                state.detail = data
            }
        }
        const back = () =>{
            router.back()
        }
        onMounted(() =>{
            getLinkageEventDetail()
        })
        return {
            ...toRefs(state),
            id,
            back
        }
    }
})
</script>

<style lang="less" scoped>
.tab-pane-content{
height: 550px;
overflow: auto;

}
    :deep(.content-search){
        padding-top: 0 !important;
    }
    :deep(.ant-tabs-bar){
        margin: 0;
    }
    :deep(.footer-btn){
        width: 100%;
        text-align: right;
    }
</style>
<style>
.content{
    height: 82vh;
overflow-y: auto;}
.sub-item-header{
margin-bottom: 15px;
margin-top: 10px;
}
</style>