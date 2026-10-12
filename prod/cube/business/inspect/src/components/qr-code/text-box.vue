<template>
  <div class="avue-text" :style="itemStyle">{{ itemOption.text }}</div>
</template>

<script lang="ts">
import { computed, defineComponent, type StyleValue } from 'vue'
export default defineComponent({
  props: {
    itemOption: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  setup (props) {
    const itemStyle = computed((): StyleValue => {
      return {
        width: props.itemOption.component.width + 'px',
        height: props.itemOption.component.height + 'px',
        // lineHeight:props.itemOption.component.height*(900/382) + 'px',
        position: 'absolute',
        top: props.itemOption.component.top + 'px',
        left: props.itemOption.component.left + 'px',
        color: props.itemOption.option.color,
        backgroundColor: props.itemOption.option.backgroundColor,
        fontSize: props.itemOption.option.fontSize + 'px',
        textAlign: props.itemOption.option.textAlign,
        fontWeight: props.itemOption.option.fontWeight,
        fontFamily: 'SourceHanSansSC-Bold',
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
