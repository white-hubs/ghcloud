<template>
<div class="tab-pane-content">
    <div class="sub-item" v-if="realMoitor.length!==0">
        <div class="sub-item-header">
            <g-vertical-line title="联动监控"></g-vertical-line>
        </div>
        <div class="sub-item-content">
            <a-row type="flex" :gutter="[32,16]" v-if="realMoitor.length">
                <a-col :span="8" v-for="(item,index) in realMoitor" :key="index">
                    <CubePlayer 
                      v-if="item.deviceId"
                      :type="videoAccessMode"
                      :h5sToken="item.token" 
                      :h5sControl="true" 
                      :dom-id="item.deviceId" 
                      :device-id="item.deviceId"
                    />
                </a-col>
            </a-row>
            <a-empty v-else/>
        </div>
    </div>
    <div class="sub-item">
        <div class="sub-item-header">
            <g-vertical-line title="监控录像"></g-vertical-line>
        </div>
        <div class="sub-item-content">
            <a-row type="flex" :gutter="[32,16]" v-if="videotapeData.length">
                <a-col :span="8" v-for="(item,index) in videotapeData" :key="index">
                    <video controls style="width: 100%;">
                        <source :src="serveIp === 'https:'?`${item.extranetFilePath}?session=${session}`:`${item.intranetFilePath}?session=${session}`" type="video/mp4">
                    </video>
                </a-col>
            </a-row>
            
            <a-empty v-if="videotapeData.length===0" description="暂无录像"/>
        </div>
    </div>
    <div class="sub-item">
        <div class="sub-item-header">
            <g-vertical-line title="监控抓拍"></g-vertical-line>
        </div>
        <div class="sub-item-content">
            <a-row type="flex" :gutter="[32,16]" v-if="photoData.length">
                <a-col :span="6" v-for="(item,index) in photoData" :key="index">
                    <img style="width:200px;" :src="`${serveIp === 'https:'?item.extranetFilePath:item.intranetFilePath}${videoAccessMode==='H5S'?`?session=${session}`:''}`" alt="">
                </a-col>
            </a-row>
            <a-empty v-else/>
        </div>
    </div>
</div>
</template>

<script>
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs } from "vue";
import { CubePlayer } from '@ghcloud/cube-player'
export default defineComponent({
    props:{
        businessKey:{
            type:[Number,String],
            default:""
        }
    },
    components:{CubePlayer},
    setup(props){
        const {proxy} = getCurrentInstance();
        const serveIp = window.location.protocol;
        const state = reactive({
            mediaConfig:{},
            realMoitor:[],
            videotapeData:[],
            photoData:[],
            session:""
        })
        onMounted(() =>{
            state.session=sessionStorage.getItem('videoSession')
          
            getStreamMediaConfig();
            getVideoEventAction();
            getEventBindVideo()
        })
        // 获取流媒体配置
        const getStreamMediaConfig = async () =>{
            const data = await proxy.$api.getStreamMediaConfig();
            if(data){
                state.mediaConfig = data
            }
        }
        // 获取摄像机
        const getEventBindVideo = async () =>{
            const data = await proxy.$api.getVideoActionByEvent({eventId:props.businessKey});
            if(data){
                state.realMoitor = data
            }
        }
        // 获取事件中摄像机操作文件（录屏及截图）
        const getVideoEventAction = async () =>{
            const data = await proxy.$api.getVideoEventAction({eventId:props.businessKey});
            if(data){
                state.videotapeData = data.filter(item =>item.type === 'VIDEOTAPE');
                state.photoData = data.filter(item =>item.type === 'PHOTOGRAPH');
            }
        }
        return {
            ...toRefs(state),
            serveIp,
            videoAccessMode : window.config.feature?.videoAccessMode ?? 'H5S'
        }
    }
})
</script>

<style scoped>
.ant-row{
  width: 100%;
}
.sub-item-content{
margin-bottom: 10px;
}
:deep(.video-player){
  width: 300px;
  height: 200px;
}
</style>