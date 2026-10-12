<template>
<div class="sub-panel">
    <div class="sub-panel-header flex-between">
        <div class="title" :style="{color}">{{title}}</div>
        <div class="close flex-center" @click="close">
            <CloseOutlined />
        </div>
    </div>
    <div class="sub-panel-content">
        <slot/>
    </div>
</div>
</template>
<script lang="ts" setup>
import {CloseOutlined} from '@ant-design/icons-vue'
import bus from "@/utils/bus"
interface Props {
  	title:string;
    color:string;
}
const props = withDefaults(defineProps<Props>(), {
    title:"设备名称",
    color:''
});
const close = () =>{
    bus.emit('closeDevicePanel')
}
</script>
<style lang="less" scoped>
.sub-panel{
    width: 1000px;
    background: rgba(4,17,32,0.8);
    border: 1px solid #2989FF;
    &-header{
        height: 48px;
        border-bottom: 1px #2989FF solid;
        padding: 0 12px;
        .close{
            width: 24px;
            height: 24px;
            color: #FFFFFF;
            background: #101010;
            cursor: pointer;
        }
        .title{
            font-size: 20px;
            color: #fff;
        }
    }
    &-content{
        padding: 12px;
        min-height: 400px;
    }
}
</style>