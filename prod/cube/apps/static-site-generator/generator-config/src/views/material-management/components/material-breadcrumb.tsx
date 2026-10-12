import { Breadcrumb, BreadcrumbItem } from "@ghcloud/cube-ui";
import { defineComponent, type PropType } from "vue";
import type { MaterialFolder } from "../types";
import styles from "./material-breadcrumb.module.less";

export const MaterialBreadcrumb = defineComponent({
  props: {
    path: {
      type: Array as PropType<MaterialFolder[]>,
      required: true,
    },
  },
  emits: ["navigate"],
  setup(props, { emit }) {
    const handleClick = (index: number): void => {
      emit("navigate", index);
    };

    const handleRootClick = (): void => {
      emit("navigate", -1);
    };

    return (): JSX.Element => (
      <div class={styles["breadcrumb-wrapper"]}>
        <Breadcrumb
          separator={<span class={styles["breadcrumb-separator"]}>/</span>}
        >
          <BreadcrumbItem>
            <span
              class={props.path.length === 0 ? styles["breadcrumb-item-active"] : styles["breadcrumb-item"]}
              onClick={handleRootClick}
            >
              全部素材
            </span>
          </BreadcrumbItem>
          {props.path.map((folder, index) => {
            const isLast = index === props.path.length - 1;
            return (
              <BreadcrumbItem key={folder.id}>
                {isLast ? (
                  <span
                    class={styles["breadcrumb-item-active"]}
                    onClick={() => handleClick(index)}
                  >
                    {folder.name}
                  </span>
                ) : (
                  <span
                    class={styles["breadcrumb-item"]}
                    onClick={() => handleClick(index)}
                  >
                    {folder.name}
                  </span>
                )}
              </BreadcrumbItem>
            );
          })}
        </Breadcrumb>
      </div>
    );
  },
});
