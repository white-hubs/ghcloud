import { defineComponent, ref, watch, type PropType } from "vue";

import { Button, Input, Select, SelectOption } from "@ghcloud/cube-ui";

import { MATERIAL_TYPE_OPTIONS } from "../mock";
import type { MaterialType } from "../types";

import styles from "./material-toolbar.module.less";

export const MaterialToolbar = defineComponent({
  props: {
    keyword: {
      type: String,
      default: "",
    },
    filterType: {
      type: String as PropType<MaterialType | "all">,
      default: "all",
    },
    selectedCount: {
      type: Number,
      default: 0,
    },
    showActions: {
      type: Boolean,
      default: true,
    },
    showBatchActions: {
      type: Boolean,
      default: true,
    },
    showNewFolder: {
      type: Boolean,
      default: true,
    },
    showUpload: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["updateKeyword", "updateFilterType", "newFolder", "upload", "batchDelete", "batchMove"],
  setup(props, { emit }) {
    const localKeyword = ref(props.keyword);

    watch(
      () => props.keyword,
      (val) => {
        localKeyword.value = val;
      },
    );

    let searchTimer: ReturnType<typeof setTimeout> | null = null;

    const triggerSearch = (): void => {
      emit("updateKeyword", localKeyword.value);
    };

    const handleSearch = (): void => {
      triggerSearch();
    };

    const handleInput = (): void => {
      if (searchTimer) clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        triggerSearch();
      }, 300);
    };

    return (): JSX.Element => (
      <div class={styles["toolbar-wrapper"]}>
        {/* 操作按钮 */}
        {props.showActions && (props.showNewFolder || props.showUpload) && (
          <div class={styles["toolbar-actions"]}>
            {props.showNewFolder && (
              <Button type="primary" onClick={() => emit("newFolder")}>
                新建文件夹
              </Button>
            )}
            {props.showUpload && <Button onClick={() => emit("upload")}>上传</Button>}
          </div>
        )}

        {/* 批量操作 */}
        {props.showBatchActions && props.selectedCount > 0 && (
          <div class={styles["toolbar-batch"]}>
            <span class={styles["toolbar-batch-text"]}>已选择 {props.selectedCount} 项</span>
            <Button size="small" onClick={() => emit("batchMove")}>
              批量移动
            </Button>
            <Button size="small" danger onClick={() => emit("batchDelete")}>
              批量删除
            </Button>
          </div>
        )}

        {/* 搜索 + 筛选 */}
        <div class={styles["toolbar-search"]}>
          <Input
            v-model:value={localKeyword.value}
            placeholder="搜索素材"
            style={{ width: "180px" }}
            allowClear
            onPressEnter={handleSearch}
            onChange={handleInput}
          />
          <Select
            value={props.filterType}
            style={{ width: "100px" }}
            onChange={(val: MaterialType | "all") => emit("updateFilterType", val)}
          >
            {MATERIAL_TYPE_OPTIONS.map((opt) => (
              <SelectOption key={opt.value} value={opt.value}>
                {opt.label}
              </SelectOption>
            ))}
          </Select>
        </div>
      </div>
    );
  },
});
