<template>
<div class="tab-pane-content">
    <div class="sub-item">
        <div class="sub-item-header">
            <g-vertical-line title="报警快照"></g-vertical-line>
        </div>
        <div class="sub-item-content" v-if="alarmSnaps.length">
            <a-row type="flex" :gutter="[16,16]">
                <a-col v-for="(item,index) in alarmSnaps" :key="index" :span="8">{{item.attributeName}}：{{item.translatedValue}}</a-col>
            </a-row>
        </div>
        <div v-else>
            <a-empty />
        </div>
    </div>
</div>
</template>

<script>
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs } from "vue";
export default defineComponent({
    props:{
        id:[Number,String],
        default:""
    },
    setup(props){
        const {proxy} = getCurrentInstance();
        const state = reactive({
            alarmSnaps:[]
        })
        onMounted(() =>{
            getAlaramDetail()
        })
        const getAlaramDetail = async () =>{
            const data = await proxy.$api.getAlaramDetail({id:props.id});
            if(data && data.snapshot){
                state.alarmSnaps = JSON.parse(data.snapshot)
            }
        }
        return{
            ...toRefs(state)
        }
    }
})
</script>

<style>

</style>