<template>
    <flow-table :title="pageTitle" tableCode="OFFICIAL_URGENT_WORK" flowCode="OFFICIAL_URGENT_WORK"/>
</template>
<script setup lang="ts">
import flowTable from "../../components/common/flowTable.vue";
import { usePageName } from '@ghcloud/cube-utils'
const { pageTitle } = usePageName()
</script>
<style>
</style>
