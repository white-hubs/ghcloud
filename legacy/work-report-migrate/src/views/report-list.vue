<template>
  <FlowTable :title="pageTitle" flowCode="REPORT" />
</template>
<script setup lang="ts">
import { usePageName } from '@ghcloud/cube-utils'
import FlowTable from '../components/common/flowTable.vue'
const { pageTitle } = usePageName()
</script>
<style>
</style>
