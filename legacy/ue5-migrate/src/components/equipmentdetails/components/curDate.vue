<template>
    <a-date-picker style="background: rgba(216, 216, 216, 0.1);" v-model:value="selectedValue" valueFormat="YYYY-MM-DD" @change="change" :getPopupContainer="(triggerNode) => triggerNode.parentNode"/>
</template>

<script>
import { defineComponent, onMounted, reactive, toRefs } from "vue";
export default defineComponent({
    props:{
        value:{
            type:String,
            default:""
        }
    },
    setup(props,{emit}){
        const state = reactive({
            selectedValue:null
        })
        onMounted(() =>{
            state.selectedValue = props.value
        })
        const change = (value) =>{
            emit("update:value",state.selectedValue);
        }
        return {
            ...toRefs(state),
            change
        }
    }
})
</script>

<style>

</style>