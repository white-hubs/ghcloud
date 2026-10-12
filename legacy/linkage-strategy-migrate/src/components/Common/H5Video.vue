<template lang="pug">
.h5s_container
    video(:id="idStr")
</template>
<script>
import {defineComponent, getCurrentInstance, nextTick, onMounted, onUnmounted, reactive, watch} from "vue";
import {H5sPlayerWS} from '@/utils/h5splayer/h5splayer.js'
export default defineComponent({
    props:{
        idStr:{
            type:String,
            default:'cameraBox'
        },
        cameraItem:{
            type:Object,
            default: () =>{
                return {}
            }
        },
        mediaConfig:{
            type:Object,
            default:() =>{
                return {}
            }
        }
    },
    setup(props) {
        const {proxy} = getCurrentInstance()
        const state = reactive({
            player:null
        })
        onMounted(() =>{
            getSession()
        })
        onUnmounted(() =>{
            state.player.disconnect()
            state.player = null
        }) 
        const playVideo = () =>{
            const serveIp = window.location.protocol;
            if(serveIp === 'http:' && props.mediaConfig?.intranetAddress || serveIp === 'https:' && props.mediaConfig?.intranetAddress){
                const conf = {
                    hlsver: 'v1',
                    host: "",
                    protocol: serveIp,
                    rootpath: '/',
                    session: window.videoSession,
                    streamprofile: 'sub',
                    profile: 'sub',
                    token: props.cameraItem.token,
                    sub: props.cameraItem.token,
                    videoid: props.idStr
                }
                if(serveIp === 'http:'){
                    conf.host = props.mediaConfig.intranetAddress.split("//")[1];
                }else{
                    conf.host = props.mediaConfig.ipAddress.split("//")[1];
                }
                nextTick(() =>{
                    state.player = new H5sPlayerWS(conf)
                    state.player.connect()
                })
            }
            
        }
        const getSession = ()=>{
           if(!window.videoSession ){
                proxy.$api.getVideoPtzSession().then(res=>{
                    window.videoSession = res
                    playVideo()
                })
            }else{
               playVideo() 
            } 
        }
        watch(() =>props.cameraItem,()=>{
            state.player.disconnect()
            state.player = null
            getSession()
        })
    }
})
</script>
<style lang="less" scoped>
    .h5s_container{
        width: 100%;
        height: 100%;
        video{
            width: 100%;
            height: 100%;
            cursor: pointer;
            object-fit: inherit;
        }
    }
</style>
