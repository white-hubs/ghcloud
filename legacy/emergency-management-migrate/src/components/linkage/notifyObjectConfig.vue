<template>
<div>
    <a-space :size="16">
        <g-select url="deptList" v-model:value="configData.departmentId" placeholder="请选择部门" style="width:200px"></g-select>
        <g-select url="position" v-model:value="configData.postId" placeholder="请选择岗位" style="width:200px" @changeCheck="changePost"></g-select>
    </a-space>
</div>

</template>

<script lang="jsx">
import { defineComponent, onMounted, reactive, toRefs } from "vue";
export default defineComponent({
    props:{
        notifyOject:{
            type:Object,
            default: () =>{
                return {}
            }
        }
    },  
    setup(props,{emit}){
        const state = reactive({
            postList:[],
            configData:{}
        })
        const changePost = () =>{
            emit("update:notifyOject",state.configData);
        }
        onMounted(() =>{
            state.configData = props.notifyOject
        })
        return {
            ...toRefs(state),
            changePost
        }
    }
})
</script>

<style>

</style>