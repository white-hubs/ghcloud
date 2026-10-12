import { computed, defineComponent, ref } from "vue";

import styles from "./scroll-tabs.module.less";

interface Props {
  list: {
    text: string;
    key: string;
  }[];
  showPageBtn?: boolean;
}

export const ScrollTabs = defineComponent({
  props: ["list", "showPageBtn"],
  emits: ["tabClick"],
  setup(props: Props, { emit }) {
    const showPageBtn = props.showPageBtn || false;
    const scrollDom = ref<HTMLDivElement | null>();
    const previewNum = props.list.length > 3 ? 3 : props.list.length;
    const activeIndex = ref(0);
    const previewFirstIndex = ref(0);
    const itemWidth = computed(() => {
      return 100 / previewNum;
    });
    const canBeClick = computed(() => {
      return function (type: "next" | "preview"): boolean {
        return type === "preview" ? previewFirstIndex.value !== 0 : previewFirstIndex.value + previewNum < props.list.length;
      };
    });

    const handleClickPageBtn = (type: "next" | "preview"): void => {
      type === "preview" ? previewFirstIndex.value-- : previewFirstIndex.value++;
      if (scrollDom.value) {
        scrollDom.value.scrollLeft = previewFirstIndex.value * ((itemWidth.value / 100) * scrollDom.value.offsetWidth);
      }
    };

    return (): JSX.Element => (
      <div class={styles["scroll-tabs"]}>
        <div
          class={`${styles["scroll-tabs-preview"]} ${canBeClick.value("preview") ? styles["active"] : ""}`}
          v-show={showPageBtn}
          onClick={() => handleClickPageBtn("preview")}
        ></div>
        <div class={styles["scroll-tabs-list"]} ref={scrollDom.value}>
          {props.list.map((item, index) => {
            return (
              <div
                class={`${styles["scroll-tabs-item"]} ${index === activeIndex.value ? styles.active : ""}`}
                key={item.key}
                style={{ width: `${itemWidth.value}%` }}
                onClick={() => {
                  activeIndex.value = index;
                  emit("tabClick", item);
                }}
              >
                {item.text}
              </div>
            );
          })}
        </div>
        <div
          class={`${styles["scroll-tabs-next"]} ${canBeClick.value("next") ? styles["active"] : ""}`}
          v-show={showPageBtn}
          onClick={() => handleClickPageBtn("next")}
        ></div>
      </div>
    );
  },
});
