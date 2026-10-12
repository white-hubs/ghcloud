<template>
<div>
    <a-space :size="16">
        <a-select :options="channelOptions.map(item =>({value:item.channelType,label:item.channelTypeName,channelConfigVOS:item.channelConfigVOS}))" v-model:value="configData.channelType" placeholder="请选择通知方式" @change="changeChannel" style="width:200px"></a-select>
        <g-select v-if="configData.channelType && configData.channelType !== 'CHANNEL_SMS'" :options="terminaOptions" :field="{'terminal':'value','terminalName':'label'}" mode="multiple" v-model:value="terminals" placeholder="请选择访问端" @changeCheck="changeTerminal"></g-select>
    </a-space>
</div>
</template>

<script>
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs } from "vue";
export default defineComponent({
    props:{
        notifyMethod:{
            type:Object,
            default: () =>{
                return {}
            }
        }
    },
    setup(props,{emit}){
        const {proxy} = getCurrentInstance();
        const state = reactive({
            configData:{},
            channelOptions:[],
            terminaOptions:[],
            terminals:[]
        })
        const getMsgChannelConfigs = async () =>{
            const data = await proxy.$api.getMsgChannelConfigs({satMsgDefineCode:"ONE_DEVICE_ALARM"});
            if(data){
                state.channelOptions = data;
                if(state.configData.channelType){
                    const index = state.channelOptions.findIndex(element =>element.channelType === state.configData.channelType);
                    state.terminaOptions = state.channelOptions[index].channelConfigVOS
                }
            }
        }
        onMounted(async() =>{
            state.configData = props.notifyMethod;
            await getMsgChannelConfigs();
            state.terminals = state.configData.terminal.map(item =>item.terminal);
        })
        const changeChannel = (value,option) =>{
            state.terminaOptions = option.channelConfigVOS;
            emit("update:notifyMethod",state.configData);
        }
        const changeTerminal = (value,option) =>{
            state.configData.terminal = option.map(item =>{
                return {terminal:item.value,terminalName:item.label}
            });
            emit("update:notifyMethod",state.configData);
        }
        return{
            ...toRefs(state),
            changeChannel,
            changeTerminal
        }
    }
})
</script>

<style>

</style>