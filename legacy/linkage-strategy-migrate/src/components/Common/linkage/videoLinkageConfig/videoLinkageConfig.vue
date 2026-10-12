<template>
    <div class="sub">
        <div class="add-row">
            <div class="item-title"> 现场抓拍:  
                <a-switch
          v-model:checked="videoConfig.enabled"
          :disabled="type == 'detail' ? true : false"
          checked-children="开"
          un-checked-children="关"
        />  
     </div>
            <span>现场抓拍：</span>
            <a-button type="primary" @click="addLinkageVideoConfig">
                添加
                <PlusOutlined />
            </a-button>
            <span class="explain">说明：监控录像默认录制时长30秒，报警监控默认每隔5秒抓拍3张；请确认报警设备已关联监控设备！</span>
        </div>
        <div class="config-row flex-between" v-for="(item,index) in videoConfig.actionConfig" :key="index">
            <div class="left">
                <video-action v-model:configData="videoConfig.actionConfig[index]"></video-action>
            </div>
            <div class="right">
                <a-button type="link" danger @click="deleteVideoConfig(index)">删除</a-button>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent, reactive, ref, toRefs,watch } from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";
export default defineComponent({
    components:{
        PlusOutlined
    },
    props:{
        actionConfig:{
            type:Array,
            default:() =>{
                return []
            }
        }
    },
    setup(props){
        watch(() =>props.actionConfig,(value) =>{
            state.videoConfig = value
        },
        {deep:true}
        )
        const state = reactive({
            videoConfig:{
                actionType:"VIDEO_DEVICE_ACTION",
                actionConfig:[],
                enabled:true
            },
            visible:false,
            search:{
                areaId:"",
                keyword:"",
                pageNumber:1,
                pageSize:10
            },
            areaList:[],
            tableData:[],
            tableColumns:[],
            selectedRowKeys:[],

        })
        const addLinkageVideoConfig = () =>{
            state.videoConfig.actionConfig.push({id:null,code:null,name:null,token:null,type:"PHOTOGRAPH",time:null,timeUnit:"SECOND",intervalTime:null,durationTime:null, executeMode:"AUTOMATIC",linkageVideoStrategyType: 'CUSTOM_VIDEO'});
        }
        const deleteVideoConfig = (index) =>{
            state.videoConfig.actionConfig.splice(index,1);
        }
        const onSelectChange = () =>{

        }
        return {
            ...toRefs(state),
            addLinkageVideoConfig,
            deleteVideoConfig,
            onSelectChange,
        }
    }
})
</script>

<style lang="less" scoped>
    .add-row,.config-row{
        margin-bottom: 10px;
    }
    .explain{
        margin-left: 16px;
        color: #aaa;
    }
</style>