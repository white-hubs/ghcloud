<template>
<div class="wrapper">
    <div class="design-header">
        <h3>控件设置</h3>
    </div>
    <div class="design-form">
        <component v-if="activeIndex!==-1" :is="'design-'+contain.configObj.layers[activeIndex].component.name" v-model:value="contain.configObj.layers[activeIndex]"></component>
    </div>
</div>
</template>

<script>
import { computed, defineComponent, inject, reactive, toRefs, watch } from "vue";
import designText from "./options/text.vue";
import designImg from "./options/img.vue";
import designQr from "./options/qrcode.vue";
export default defineComponent({
    components:{designText,designImg,designQr},
    setup(props){
        let activeFlag = inject("activeFlag");
        const contain = inject("contain");
        const activeIndex = computed(() =>{
            let index = -1;
            index = contain.configObj.layers.findIndex(item =>item.index === activeFlag.value[0]);
            return index
        })
        return {
            activeFlag,
            contain,
            activeIndex
        }
    }
})
</script>

<style lang="less" scoped>
.design-form{
    padding: 16px;
}
</style>