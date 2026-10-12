<template>
<div class="tab-pane-content">
    <div class="sub-item">
        <div class="sub-item-header">
            <g-vertical-line title="报警监控"></g-vertical-line>
        </div>
        <div class="sub-item-content">
            <a-row type="flex" :gutter="[32,16]" v-if="realMoitor.length">
                <a-col :span="8" v-for="(item,index) in realMoitor" :key="index">
                    <p class="name">{{item.deviceName}}</p>
                    <H5Video :mediaConfig="mediaConfig" :cameraItem="item" :idStr="'camera_'+index"></H5Video>
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
                    <p class="name">{{item.deviceName}}</p>
                    <video controls width="100%">
                        <source :src="serveIp === 'https:'?item.extranetFilePath+'?session='+session:item.intranetFilePath+'?session='+session" type="video/mp4">
                    </video>
                </a-col>
            </a-row>
            <div v-else>
                <a-empty />
            </div>
        </div>
    </div>
    <div class="sub-item">
        <div class="sub-item-header">
            <g-vertical-line title="监控抓拍"></g-vertical-line>
        </div>
        <div class="sub-item-content">
            <a-row type="flex" :gutter="[32,16]" v-if="photoData.length">
                <a-image-preview-group>
                    <a-col :span="6" v-for="(item,index) in photoData" :key="index">
                        <p class="name">{{item.deviceName}}</p>
                        <a-image :src="serveIp==='https'?item.extranetFilePath+'?session='+session:item.intranetFilePath+'?session='+session"></a-image>
                    </a-col>
                </a-image-preview-group>
            </a-row>
            <div v-else>
                <a-empty />
            </div>
        </div>
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
        const serveIp = window.location.protocol;
        const state = reactive({
            session:window.videoSession,
            mediaConfig:{},
            realMoitor:[],
            videotapeData:[],
            photoData:[]
        })
        onMounted(() =>{
            getStreamMediaConfig();
            getVideoEventAction();
            getEventBindVideo()
        })
        // 获取流媒体配置
        const getStreamMediaConfig = async () =>{
            const data = await proxy.$api.getStreamMediaConfig();
            if(data && data.records.length){
                state.mediaConfig = data.records[0]
            }
        }
        // 获取摄像机
        const getEventBindVideo = async () =>{
            const data = await proxy.$api.getVideoActionByEvent({eventId:businessKey});
            if(data){
                state.realMoitor = data
            }
        }
        
        // 获取摄像机联动动作
        const getVideoEventAction = () =>{
            proxy.$api.getVideoEventAction({eventId:businessKey}).then(res =>{
                state.photoData = res.filter(item =>item.type === 'PHOTOGRAPH');
                state.videotapeData = res.filter(item =>item.type === 'VIDEOTAPE');
            })
        }
        // 获取事件中摄像机操作文件（录屏及截图）
        // const getVideoEventAction = async () =>{
        //     const data = await proxy.$api.getVideoEventAction({eventId:businessKey});
        //     if(data){
        //         state.videotapeData = data.filter(item =>item.type === 'VIDEOTAPE').map(item=>{
        //             return{
        //                 ...item,
        //                 intranetFilePath:item.intranetFilePath+'?session='+window.videoSession,
        //                 extranetFilePath:item.extranetFilePath+'?session='+window.videoSession,
        //             }
        //         });
        //         state.photoData = data.filter(item =>item.type === 'PHOTOGRAPH').map(item=>{
        //             return{
        //                 ...item,
        //                 intranetFilePath:item.intranetFilePath+'?session='+window.videoSession,
        //                 extranetFilePath:item.extranetFilePath+'?session='+window.videoSession,
        //             }
        //         });;
        //     }
        // }
        return {
            ...toRefs(state),
            serveIp
        }
    }
})
</script>

<style>

</style>