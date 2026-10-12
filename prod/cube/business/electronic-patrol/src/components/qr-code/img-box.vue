<template>
    <img :src="itemOption.url" :style="itemStyle">
</template>

<script lang="ts">
import { computed, defineComponent, type StyleValue } from "vue";
export default defineComponent({
    props:{
        itemOption:{
            type:Object,
            default:() =>{
                return {}
            }
        }
    },
    setup(props){
        const itemStyle = computed(():StyleValue =>{
            return {
                width:props.itemOption.component.width + 'px',
                height:props.itemOption.component.height +'px',
                position:'absolute',
                top:props.itemOption.component.top + 'px',
                left:'0px',
            }
        })  
        return {
            itemStyle
        }
    }
})
</script>

<style>

</style>