<template>
    <img :src="itemOption.url" :style="itemStyle">
</template>

<script>
import { computed, defineComponent } from "vue";
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
        const itemStyle = computed(() =>{
            return {
                "width":props.itemOption.component.width + "px",
                "height":props.itemOption.component.height + "px",
                "position":"absolute",
                "top":props.itemOption.component.top + "px",
                "left":props.itemOption.component.left + "px",
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