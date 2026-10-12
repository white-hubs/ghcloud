<template>
    <div class="panel" :style="panelStyle" 
                id="qrcodepanel">
        <div v-for="(item,index) in designConfig.layers" :key="index">
            <component :is="'avue-echart-'+item.component.name" :itemOption="item"></component>
        </div>
    </div>
</template>

<script lang="ts">
import {  computed, defineComponent, type StyleValue } from "vue";
import avueEchartText from "./textBox.vue"
import avueEchartImg from "./imgBox.vue"
import avueEchartQr from "./qrcodeBox.vue"
export default defineComponent({
    components:{avueEchartText,avueEchartImg,avueEchartQr},
    props:{
        designConfig:{
            type:Object,
            default:() =>{
                return {}
            }
        }
    },
    setup(props){
        const designConfig=props.designConfig
        const panelStyle = computed((): StyleValue =>{
            return {
                width:'1260px',
                height:'900px',
                backgroundColor:props.designConfig.backgroundColor,
                backgroundImage:`url(${props.designConfig.backgroundImage})`,
                backgroundSize:'100% 100%',
                position:'relative'
            }
        })
        return {
            panelStyle,
            designConfig
        }
    }
})
</script>

<style>
</style>