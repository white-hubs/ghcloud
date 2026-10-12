import { Cell, Empty, Icon, List, Popup, Search } from "vant";
import { defineComponent, shallowRef, watch, type PropType } from "vue";

import styles from "./index.module.less";

export interface SearchSelectOption {
  text: string;
  value: string;
}

export const SearchSelectPopup = defineComponent({
  name: "SearchSelectPopup",
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: "请输入名称搜索",
    },
    options: {
      type: Array as PropType<SearchSelectOption[]>,
      default: () => [],
    },
    selectedValue: {
      type: String,
      default: "",
    },
    loading: {
      type: Boolean,
      default: false,
    },
    finished: {
      type: Boolean,
      default: true,
    },
    finishedText: {
      type: String,
      default: "没有更多了",
    },
  },
  emits: {
    "update:show": (show: boolean) => typeof show === "boolean",
    search: (keyword: string) => typeof keyword === "string",
    load: () => true,
    select: (option: SearchSelectOption) => Boolean(option.value),
  },
  setup: (props, { emit }) => {
    const keyword = shallowRef("");

    watch(
      () => props.show,
      (show) => {
        if (show) keyword.value = "";
      },
    );

    const close = (): void => {
      emit("update:show", false);
    };

    const search = (): void => {
      emit("search", keyword.value.trim());
    };

    return () => (
      <Popup show={props.show} position="bottom" round onUpdate:show={(show: boolean) => emit("update:show", show)}>
        <div class={styles.popup}>
          <div class={styles.header}>
            <span>{props.title}</span>
            <button class={styles.close} type="button" aria-label="关闭" onClick={close}>
              <Icon name="cross" size="20" />
            </button>
          </div>
          <Search
            class={styles.search}
            v-model={keyword.value}
            placeholder={props.placeholder}
            showAction
            onSearch={search}
            onClear={search}
            v-slots={{
              action: () => (
                <button class={styles.searchAction} type="button" onClick={search}>
                  搜索
                </button>
              ),
            }}
          />
          <div class={styles.list}>
            <List
              key={props.show ? "open" : "closed"}
              loading={props.loading}
              finished={props.finished}
              finishedText={props.options.length > 0 ? props.finishedText : ""}
              onLoad={() => emit("load")}
              onUpdate:loading={() => undefined}
            >
              {props.options.map((option) => {
                const selected = option.value === props.selectedValue;
                return (
                  <Cell
                    class={[styles.cell, selected ? styles.selected : ""]}
                    key={option.value}
                    title={option.text}
                    clickable
                    onClick={() => emit("select", option)}
                    v-slots={{
                      "right-icon": () => (selected ? <Icon name="success" color="var(--van-primary-color)" size="20" /> : null),
                    }}
                  />
                );
              })}
              {!props.loading && props.options.length === 0 ? (
                <Empty class={styles.empty} imageSize={64} description="暂无匹配数据" />
              ) : null}
            </List>
          </div>
        </div>
      </Popup>
    );
  },
});
