<template>
    <flow-table :title="pageTitle" tableCode="OFFICIAL_KEY_WORK" flowCode="OFFICIAL_KEY_WORK"/>
</template>
<script setup lang="ts">
import { usePageName } from '@ghcloud/cube-utils'
import flowTable from "../../components/common/flowTable.vue";
const { pageTitle } = usePageName()
</script>
<style>
</style>
