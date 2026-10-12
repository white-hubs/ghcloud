<template>
    <flow-table :title="pageTitleText" :flowCode="flowCode" :tableCode="tableCode" :key="componentKey" />
</template>
<script setup lang="ts">
import { useRoute } from "vue-router";
import flowTable from "../../components/common/flowTable.vue";
import { ref, watch } from "vue";
import { usePageName } from '@ghcloud/cube-utils'
const { pageTitle } = usePageName()
const route = useRoute();
const { businessType } = route.query as { businessType: string; };
const flowCode = ref(businessType)
const tableCode = ref(`${businessType ?? 'APPROVAL_LIST'}_TABLE`)
const componentKey = ref(0)
const pageTitleText = ref(pageTitle)

watch(() => route.query, (newQuery) => {
    const { pageTitle } = usePageName()
    pageTitleText.value = pageTitle
    const newBusinessType = (newQuery as { businessType: string }).businessType;
    flowCode.value = newBusinessType;
    tableCode.value = `${newBusinessType ?? 'APPROVAL_LIST'}_TABLE`;
    componentKey.value++;
}, { deep: true });
</script>
<style></style>
