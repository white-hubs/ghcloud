<template>
    <div class="avue-text" :style="itemStyle">{{itemOption.text}}</div>
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
                "line-height":props.itemOption.component.height + "px",
                "position":"absolute",
                "top":props.itemOption.component.top + "px",
                "left":props.itemOption.component.left + "px",
                "color":props.itemOption.option.color,
                "background-color":props.itemOption.option.backgroundColor,
                "font-size":props.itemOption.option.fontSize + "px",
                "text-align":props.itemOption.option.textAlign,
                "background-color":props.itemOption.option.backgroundColor,
                "font-weight":props.itemOption.option.fontWeight,
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