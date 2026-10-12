import { defineComponent, onMounted, shallowRef, watch, type PropType } from "vue";

import { CubeIcon, loadCubeIconfont } from "@ghcloud/cube-ui";

import { hasLocalSvgIcon, SvgIcon } from "./svg-icon";

import "./workbench-icon.less";

function normalizeSize(size: string | number): string {
  return typeof size === "number" ? `${size}px` : size;
}

/** 新库注入的是 <symbol id="...">；本地 SvgIcon 是 <svg id="...">，用 tagName 区分。 */
function hasCubeIconSymbol(iconClass: string): boolean {
  if (!iconClass || typeof document === "undefined") return false;
  const node = document.getElementById(iconClass);
  return node?.tagName.toLowerCase() === "symbol";
}

export default defineComponent({
  name: "WorkbenchIcon",
  inheritAttrs: false,
  props: {
    iconClass: {
      type: String,
      required: true,
    },
    size: {
      type: [String, Number] as PropType<string | number>,
      default: "1em",
    },
    color: {
      type: String,
      default: undefined,
    },
  },
  setup(props, { attrs }) {
    const source = shallowRef<"pending" | "cube" | "local">("pending");

    const resolveSource = async (): Promise<void> => {
      if (!props.iconClass) {
        source.value = "cube";
        return;
      }

      try {
        await loadCubeIconfont({ cacheBust: false });
      } catch {
        // ignore — fall through to local check
      }

      if (hasCubeIconSymbol(props.iconClass)) {
        source.value = "cube";
        return;
      }

      source.value = hasLocalSvgIcon(props.iconClass) ? "local" : "cube";
    };

    onMounted(() => {
      void resolveSource();
    });

    watch(
      () => props.iconClass,
      () => {
        source.value = "pending";
        void resolveSource();
      },
    );

    return (): JSX.Element | null => {
      if (!props.iconClass) return null;

      const size = normalizeSize(props.size);

      if (source.value === "pending") {
        return <span class={["workbench-icon", attrs.class]} style={{ display: "inline-block", width: size, height: size }} />;
      }

      if (source.value === "local") {
        return (
          <span
            class={["workbench-icon", "workbench-icon--local", attrs.class]}
            style={{
              fontSize: size,
              color: props.color,
              ...(typeof attrs.style === "object" && attrs.style ? attrs.style : {}),
            }}
          >
            <SvgIcon iconName={props.iconClass} />
          </span>
        );
      }

      return <CubeIcon {...attrs} iconClass={props.iconClass} size={props.size} color={props.color} />;
    };
  },
});
