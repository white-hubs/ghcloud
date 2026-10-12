<template>
    <g-layout title="报警详情">
        <template #content-table>
            <a-tabs v-model:activeKey="activeKey">
                <a-tab-pane key="baseInfo" tab="报警详情">
                    <g-detail-form :formList="formList" :api="api" :afterGet="afterGet">
                        <template #edit-item="{record}">
                            <video-linkage :alarmStatus="record.alarmStatus"></video-linkage>
                            <div class="item-title">处理结果</div>
                            <div class="handel-content">
                                <a-row :gutter="[32,16]">
                                    <a-col :span="24">处理结果：{{handelStatusDetail?.operationParam?.alarmHandlerResultName|| '--'}}</a-col>
                                    <a-col :span="24">处理说明：{{handelStatusDetail?.operationParam?.alarmHandlerResultRemark|| '--'}}</a-col>
                                    <a-col :span="24">
                                        <span>现场照片：</span>
                                        <a-image-preview-group v-if="handelStatusDetail?.operationParam?.fileVOS.length">
                                            <a-image v-for="item in handelStatusDetail?.operationParam?.fileVOS" :key="item.id" :src="item.path" :width="100"></a-image>
                                        </a-image-preview-group>
                                        <span v-else>--</span>
                                    </a-col>
                                    <a-col :span="24">处理时间：{{handelStatusDetail.createTime?moment(handelStatusDetail.createTime).format("YYYY-MM-DD HH:mm:SS"):'--'}}</a-col>
                                </a-row>
                            </div>
                        </template>
                    </g-detail-form>
                </a-tab-pane>
                <a-tab-pane key="linkageAction" tab="联动动作">
                    <equipment-linkage></equipment-linkage>
                    <linkage-record></linkage-record>
                </a-tab-pane>
                <a-tab-pane key="handelRecord" tab="处理记录">
                    <handel-process></handel-process>
                </a-tab-pane>
            </a-tabs>
        </template>
        <template #footer-page>
            <a-button @click="goBack">返回</a-button>
        </template>
    </g-layout>
</template>

<script lang="jsx">
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs } from "vue";
import { useRoute, useRouter } from "vue-router";
import moment from "moment";
import videoLinkage from "./components/videoLinkage.vue";
import equipmentLinkage from "./components/equipmentLinkage.vue";
import linkageRecord from "./components/linkageRecord.vue";
import handelProcess from "./components/handelProcess.vue"
export default defineComponent({
    components:{videoLinkage,equipmentLinkage,linkageRecord,handelProcess},
    setup(){
        const {proxy} = getCurrentInstance();
        const router = useRouter();
        const route = useRoute();
        const {id,businessKey} = route.query;
        const state = reactive({
            activeKey:"baseInfo",
            alarmDetail:{},
            handelStatusDetail:{},
            formList:[
                {
                    title:"报警信息",
                    form:[
                        {
                            label:"报警时间",
                            value:"alarmTime"
                        },
                        {
                            label:"报警设备",
                            value:"alarmTargetName"
                        },
                        {
                            label:"报警级别",
                            value:"alarmLevelName"
                        },
                        {
                            label:"报警规则",
                            value:"alarmEventName"
                        },
                        {
                            label:"报警区域",
                            value:"areaName"
                        },
                        {
                            label:"处理时限",
                            value:"timeoutProcessTimesName"
                        },
                        {
                            label:"处理人",
                            value:"alarmHandlerName"
                        },
                        {
                            label:"超时状态",
                            value:"alarmHandlerTimeoutStatusName"
                        },
                        {
                            label:"处理状态",
                            value:"alarmStatusName"
                        },
                    ]
                }
            ],
            api:{
                detail:"alarmRecordDetail"
            }
        })
        onMounted(() =>{
            getAlarmEventOperates()
        })
        const afterGet = (res) =>{
            let alarmTime = res.alarmTime?moment(res.alarmTime).format("YYYY-MM-DD HH:mm"):"--";
            state.alarmDetail = res;
            return {...res,alarmTime}
        }
        // 获取处理结果
        const getAlarmEventOperates = () =>{
            proxy.$api.alarmEventOperates({id:id}).then(res =>{
                let result = res.find(item =>item.alarmStatusEvent == 'PROCESSED');
                if(result){
                    let videoList = result.operationParam.fileVOS.filter(item =>item.type == 'mp4' || item.type == 'AVI' || item.type == 'MKV')
                    let imageList = result.operationParam.fileVOS.filter(item =>item.type !== 'mp4'&&item.type !== 'AVI' && item.type !== 'MKV')
                    state.handelStatusDetail = {...result,videoList,imageList}
                }
            })
        }
        const goBack = () => {
            history.go(-1)
        };
        return {
            ...toRefs(state),
            goBack,
            afterGet,
            moment:moment
        }
    }
})
</script>

<style lang="less" scoped>
.item-title{
    width: 100%;
    height: auto !important;
    text-align: left;
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 10px;
    color: #000000D9;
    border-top: 1px solid #e8e8e88c;
    padding-top: 16px !important;
    font-family: "PingFang SC-Medium";
}
.handel-content{
    padding: 0 32px;
    margin-bottom: 16px;
}
</style>