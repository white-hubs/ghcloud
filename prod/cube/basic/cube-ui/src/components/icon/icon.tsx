import { defineComponent, onMounted, type PropType } from "vue";

export interface CubeIconProps {
  /** Iconfont 下载包中完整的 Symbol ID，例如 `icon-home`。 */
  iconClass: string;
  /** 图标宽高；数字按 px 处理，默认与当前文字大小一致。 */
  size?: string | number;
  /** 单色图标颜色；未指定时继承当前文字颜色。 */
  color?: string;
}

function normalizeSize(size: string | number): string {
  return typeof size === "number" ? `${size}px` : size;
}

export const CubeIcon = defineComponent({
  name: "CubeIcon",
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
    if (import.meta.env.DEV) {
      onMounted(() => {
        // 本地单独启动微应用时，由首个图标兜底加载；生产环境统一由主应用加载。
        void import("./iconfont-loader.js").then(({ loadCubeIconfont }) => loadCubeIconfont({ cacheBust: false })).catch(() => undefined);
      });
    }

    return () => {
      const { class: className, style: userStyle, "aria-hidden": ariaHidden, ...svgAttrs } = attrs;
      const size = normalizeSize(props.size);
      const explicitAriaHidden =
        ariaHidden === true || ariaHidden === "true" ? "true" : ariaHidden === false || ariaHidden === "false" ? "false" : undefined;
      const resolvedAriaHidden = explicitAriaHidden ?? (attrs["aria-label"] === undefined && attrs.role === undefined ? "true" : undefined);

      return (
        <svg
          {...svgAttrs}
          class={["cube-icon", className, props.iconClass]}
          style={[
            {
              color: props.color,
              display: "inline-block",
              fill: "currentColor",
              flexShrink: 0,
              height: size,
              verticalAlign: "-0.125em",
              width: size,
            },
            userStyle,
          ]}
          aria-hidden={resolvedAriaHidden}
        >
          <use href={`#${props.iconClass}`} />
        </svg>
      );
    };
  },
});
