<template>
  <a-spin />
</template>

<script>
import {
  defineComponent,
  onMounted,
} from "vue";
import { useRouter, useRoute } from "vue-router";

export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    onMounted(() => {
      const toPath = sessionStorage.getItem("transitionPageTo");
      const fromPath = sessionStorage.getItem("transitionPageFrom");
      if (toPath && toPath !== fromPath) {
        sessionStorage.setItem(
          "transitionPageTo",
          sessionStorage.getItem("transitionPageFrom")
        );
        setTimeout(() => {
          router.push({
            path: toPath,
            query: { ...route.query },
          });
        }, 50);
      } else if (toPath === fromPath) {
        sessionStorage.removeItem("transitionPageTo");
        sessionStorage.removeItem("transitionPageFrom");
        router.replace(toPath);
      }
    });
    return {};
  },
});
</script>

<style></style>
