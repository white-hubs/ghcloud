<template>
    <div class="pie" ref="pie"></div>
</template>
<script lang="ts" setup>
import {ref} from 'vue';
import {render,PieData,pieType} from './option'
interface Props {
    pieData:PieData[],
    type?:pieType,
    legend?:boolean,
    seriesName?:string,
    title?:boolean,
    totalName?:string,
    total?:string|number,
    unit?:string
}
const pie = ref();
const props = withDefaults(defineProps<Props>(),{
    pieData: () =>[],
    type:'common',
    legend:true,
    seriesName:'',
    title:false,
    totalName:'',
    total:0,
    unit:'',
})
    if(pie.value){
        render(pie.value,props.pieData,props.type,props.legend,props.seriesName,props.title,props.totalName,props.total,props.unit);
    }
</script>
<style lang="less" scoped>
.pie{
    width: 100%;
    height: 100%;
}
</style>