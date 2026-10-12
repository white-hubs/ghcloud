<template>
    <div class="panel" :style="panelStyle" id="qrcodepanel">
        <div v-for="(item,index) in scaleDesignConfig.layers" :key="index">
            <component :is="'avue-echart-'+item.component.name" :itemOption="item"></component>
        </div>
    </div>
</template>

<script>
import { computed, defineComponent, reactive, toRefs ,ref} from "vue";
import avueEchartText from "./textBox.vue"
import avueEchartImg from "./imgBox.vue"
import avueEchartQr from "./qrcodeBox.vue"
import _ from 'lodash'

export default defineComponent({
    components:{avueEchartText,avueEchartImg,avueEchartQr},
    props:{
        designConfig:{
            type:Object,
            default:() =>{
                return {}
            }
        },
        type:{
            type:String,
            default:''
        }
    },
    setup(props){
        const scaleDesignConfig=ref({})
        const panelStyle = computed(() =>{
          scaleDesignConfig.value=_.cloneDeep(props.designConfig)
          if(props.type==='preview'){
            let scale=1
            if((Number(scaleDesignConfig.value.width)+70)>document.documentElement.clientWidth ||(Number(scaleDesignConfig.value.height)+150)>(document.documentElement.clientHeight )){
                const overWidth=Number(scaleDesignConfig.value.width)-document.documentElement.clientWidth
                const overHeight=Number(scaleDesignConfig.value.height)-(document.documentElement.clientHeight )
                if(overWidth>overHeight){
                     scale=(document.documentElement.clientWidth/2)/Number(scaleDesignConfig.value.width)
                }else{
                    scale=(document.documentElement.clientHeight/2)/Number(scaleDesignConfig.value.height)
            
                }
            }
            scaleDesignConfig.value.layers.forEach(x=>{
                x.component.width=x.component.width*scale
                x.component.height=x.component.height*scale
                x.component.left=x.component.left*scale
                x.component.top=x.component.top*scale
                // x.option.fontSize=x.option.fontSize*scale
                if(x.type==='textBox'){
                    x.option.fontSize=x.option.fontSize*scale
                }
            })
            scaleDesignConfig.value.width=Number(scaleDesignConfig.value.width)*scale
            scaleDesignConfig.value.height=Number(scaleDesignConfig.value.height)*scale
          }
            
            return {
                "width":scaleDesignConfig.value.width + 'px',
                "height":scaleDesignConfig.value.height + 'px',
                "background-color":scaleDesignConfig.value.backgroundColor,
                "background-image":`url(${scaleDesignConfig.value.backgroundImage})`,
                "background-size":"100% 100%",
                "position":"relative"
            }
        })
        return {
            panelStyle,
            scaleDesignConfig
        }
    }
})
</script>

<style>
</style>