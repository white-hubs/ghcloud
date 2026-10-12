<template>
    <sub-panel-template :title="title">
        <div style="height: 200px; width: 100%;">
            <Pie />
        </div>
    </sub-panel-template>
</template>

<script lang="ts" setup>
import { withDefaults } from "vue"
import Pie from "../public/charts/pie/pie.vue"
import subPanelTemplate from './subPanelTemplate.vue'
interface Props {
    title?: string
}
const props = withDefaults(defineProps<Props>(), {
    title: "标题"
})
</script>

<style lang="less" scoped>

</style>