import { Icon } from "vant";
import { defineComponent, type PropType, type VNode } from "vue";

import styles from "../ai-center.module.less";

export const SearchBox = defineComponent({
  name: "SearchBox",
  props: {
    value: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      required: true,
    },
    compact: {
      type: Boolean,
      default: false,
    },
    onUpdateValue: {
      type: Function as PropType<(value: string) => void>,
      required: true,
    },
  },
  setup: (props): (() => VNode) => {
    const handleSubmit = (event: SubmitEvent): void => {
      event.preventDefault();
      const input = event.currentTarget instanceof HTMLFormElement ? event.currentTarget.querySelector("input") : null;
      input?.blur();
    };

    return (): VNode => (
      <form class={[styles.searchBox, props.compact ? styles.searchBoxCompact : undefined]} action="" onSubmit={handleSubmit}>
        <Icon name="search" size="16" class={styles.searchIcon} />
        <input
          type="search"
          value={props.value}
          placeholder={props.placeholder}
          enterkeyhint="search"
          onInput={(event) => {
            props.onUpdateValue((event.target as HTMLInputElement).value);
          }}
        />
      </form>
    );
  },
});
