<template>
    <div class="avue-text" :style="itemStyle">{{itemOption.text}}</div>
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
                width:props.itemOption.component.width*(1260/514) + 'px',
                height:props.itemOption.component.height*(900/382) + 'px',
                // lineHeight:props.itemOption.component.height*(900/382) + 'px',
                position:'absolute',
                top:props.itemOption.component.top*(900/382) + 'px',
                left:props.itemOption.component.left*(1260/514) + 'px',
                color:props.itemOption.option.color,
                backgroundColor:props.itemOption.option.backgroundColor,
                fontSize:props.itemOption.option.fontSize*(900/382) + 'px',
                textAlign:props.itemOption.option.textAlign,
                fontWeight:props.itemOption.option.fontWeight,
                fontFamily: "SourceHanSansSC-Bold",
                overflowWrap: 'break-word'
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