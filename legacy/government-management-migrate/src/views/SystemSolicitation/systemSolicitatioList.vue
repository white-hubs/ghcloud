<template>
  <flow-table :title="pageTitle" tableCode="OFFICIAL_REGULATION" flowCode="OFFICIAL_REGULATION" />
</template>
<script setup lang="ts">
import { usePageName } from '@ghcloud/cube-utils'
import flowTable from "../../components/common/flowTable.vue";
const { pageTitle } = usePageName()
</script>
<style></style>
