<template>
  <div
    id="qrcodepanel" class="panel"
    :style="panelStyle"
  >
    <div v-for="(item,index) in designConfig.layers" :key="index">
      <component :is="'avue-echart-'+item.component.name" :item-option="item" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, type StyleValue } from 'vue'
import avueEchartText from './text-box.vue'
import avueEchartImg from './img-box.vue'
import avueEchartQr from './qrcode-box.vue'
export default defineComponent({
  components: { avueEchartText, avueEchartImg, avueEchartQr },
  props: {
    designConfig: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  setup (props) {
    const designConfig = props.designConfig
    const panelStyle = computed((): StyleValue => {
      return {
        width: props.designConfig.width + 'px',
        height: props.designConfig.height + 'px',
        backgroundColor: props.designConfig.backgroundColor,
        backgroundImage: `url(${props.designConfig.backgroundImage})`,
        backgroundSize: '100% 100%',
        position: 'relative'
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
