import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

export function usePageName() {
  const route = useRoute();
  const title = ref("");
  title.value = route.meta.title as string;
  return { title };
}
