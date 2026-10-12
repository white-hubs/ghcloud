import { computed, onMounted, ref } from "vue";

interface PageListItem {
  id: string;
  name: string;
}

export function usePageList() {
  const pages = ref<PageListItem[]>([]);

  const options = computed(() => pages.value.map((p) => ({ label: p.name, value: p.id })));

  async function load() {
    try {
      const resp = await fetch("/scada/api/pages/");
      if (!resp.ok) return;
      const data = (await resp.json()) as PageListItem[];
      if (Array.isArray(data)) {
        pages.value = data;
      }
    } catch {
      // Silently ignore — user can still type a page ID manually
    }
  }

  onMounted(() => {
    void load();
  });

  return { pages, options, load };
}
