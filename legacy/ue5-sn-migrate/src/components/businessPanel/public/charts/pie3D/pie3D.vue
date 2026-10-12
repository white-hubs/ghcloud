<template>
    <div class="pie" ref="pieRef"></div>
</template>
<script lang="ts" setup>
import { ref, onMounted, withDefaults, defineProps, nextTick, watch } from "vue"
import { getOption, PieData } from "./option"
import { render } from "./chart"
import "echarts-gl";
interface Props {
    dataValue: PieData[],
    internalDiameterRatio: number,
    autoRotate: boolean
}
const props = withDefaults(defineProps<Props>(), {
    dataValue: () => {
        return []
    }, 
    internalDiameterRatio: 0.7,
    autoRotate: true
})
watch(
    () => [...props.dataValue],
    newVal => {
        render(pieRef.value, getOption(newVal, props.internalDiameterRatio, props.autoRotate))
    },
);
const pieRef = ref();
onMounted(() => {
    nextTick(() => {
        render(pieRef.value, getOption(props.dataValue, props.internalDiameterRatio, props.autoRotate))
    })
})
</script>
<style scoped>
.pie {
    width: 100%;
    height: 100%;
}
</style>