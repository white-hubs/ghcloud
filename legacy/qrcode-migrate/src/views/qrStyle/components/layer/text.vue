<template>
    <div class="avue-text" :style="boxStyle">{{textItem.text}}</div>
</template>
<script>
import { computed, defineComponent } from "vue";
export default defineComponent({
    props:{
        textItem:{
            type:Object,
            default: () =>{
                return {} 
            }
        }
    },
    setup(props){
        const boxStyle = computed(() =>{
            return {
                "width":props.textItem.component.width +'px',
                "height":props.textItem.component.height + 'px',
                "line-height":props.textItem.component.height + 'px',
                "background":props.textItem.option.backgroundColor,
                "font-size":props.textItem.option.fontSize + 'px',
                "color":props.textItem.option.color,
                "text-align":props.textItem.option.textAlign,
                "font-weight":props.textItem.option.fontWeight,
            }
        })
        return {
            boxStyle,
        }
    }
})
</script>

<style>
</style>