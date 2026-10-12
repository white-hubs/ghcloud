
<template>
    <flow-table :title="pageTitle" tableCode="OFFICIAL_DOCUMENT_RECEIVED" flowCode="OFFICIAL_DOCUMENT_RECEIVED" />
</template>
<script setup lang="ts">
import flowTable from "../../components/common/flowTable.vue";
import { usePageName } from '@ghcloud/cube-utils'
const { pageTitle } = usePageName()
</script>
<style>
</style>
