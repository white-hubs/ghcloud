<template>
  <div class="portal-entry">
    <a-spin />
    <span>正在进入系统...</span>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";

import { useChildApplication } from "@/hooks/use-child-application";
import { isWorkbenchEntryEnabled } from "@/utils/portal-entry";

const router = useRouter();
const childApplication = useChildApplication();

onMounted(async () => {
  if (await isWorkbenchEntryEnabled()) {
    await router.replace({ path: "/index" });
    return;
  }

  try {
    const application = await childApplication.findFirstAvailableApplication();
    if (!application) {
      await router.replace({ path: "/no-application" });
      return;
    }
    await childApplication.toChildApplication(application, "/about", { recordMenuVisit: false });
  } catch (_error) {
    await router.replace({ path: "/no-application" });
  }
});
</script>

<style scoped lang="less">
.portal-entry {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  background: #fff;
}
</style>
