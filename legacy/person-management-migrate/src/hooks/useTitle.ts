import { ref } from "vue";
import { useRoute } from "vue-router";

export function useTitle() {
  const route = useRoute();
  const title = ref("");
  title.value = route.meta.title as string;
  return title ;
}
