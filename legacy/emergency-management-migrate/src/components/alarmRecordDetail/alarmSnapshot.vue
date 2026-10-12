<template>
<div class="tab-pane-content">
    <div class="sub-item">
        <div class="sub-item-header">
            <g-vertical-line title="报警快照"></g-vertical-line>
        </div>
        <div class="sub-item-content" v-if="alarmSnaps.length">
            <a-row type="flex" :gutter="[16,16]">
                <a-col v-for="(item,index) in alarmSnaps" :key="index" :span="8">{{item.attributeName}}：{{item.translatedValue?item.translatedValue+item.attributeUnitName:'--'}}</a-col>
            </a-row>
        </div>
        <div v-else>
            <a-empty />
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
        const {id} = route.query;
        const state = reactive({
            alarmSnaps:[]
        })
        onMounted(() =>{
            alarmRecordDetail()
        })
        const alarmRecordDetail = async () =>{
            const data = await proxy.$api.alarmRecordDetail({id:id});
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