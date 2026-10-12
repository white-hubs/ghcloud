<template>
    <div class="ringChart" ref="ringChart"></div>
</template>
<script lang="ts" setup>
import { ref, onMounted, watch ,defineExpose} from "vue"
import { PieData, render } from './chart'
const ringChart = ref();
const props = defineProps<{
  pieData: PieData[],
  seriesName?: string,
  total?: string | number,
  unit?: string
}>()
watch(
    () => [...props.pieData],
    newVal => {
        if (ringChart.value) {
            render(ringChart.value, newVal, props.seriesName, props.total, props.unit)
        }
    },
);
watch(
    () => props.total,
    newVal => {
        if (ringChart.value) {
            render(ringChart.value, props.pieData, props.seriesName, newVal, props.unit)
        }
    },
);
onMounted(() => {
    if (ringChart.value) {
        render(ringChart.value, props.pieData, props.seriesName, props.total, props.unit)
    }
})
</script>
<style lang="less" scoped>
.ringChart {
    width: 100%;
    height: 100%;
}
</style>