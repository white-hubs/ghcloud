<template>
    <img :src="textItem.url" :style="boxStyle">
</template>

<script>
import { defineComponent,computed } from "vue";
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
            }
        })
        return {
            boxStyle
        }
    }
})
</script>

<style>

</style>