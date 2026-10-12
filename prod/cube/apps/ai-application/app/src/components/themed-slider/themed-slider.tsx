import { defineComponent, onBeforeUnmount, ref } from "vue";

import styles from "./themed-slider.module.less";

function countDecimals(n: number): number {
  const s = String(n);
  if (!s.includes(".")) {
    return 0;
  }
  return s.split(".")[1]?.length ?? 0;
}

function clampSnap(raw: number, min: number, max: number, step: number): number {
  const clamped = Math.min(Math.max(raw, min), max);
  const steps = Math.round((clamped - min) / step);
  const next = min + steps * step;
  const decimals = Math.max(countDecimals(step), countDecimals(min), countDecimals(max));
  return Number(next.toFixed(Math.min(decimals, 12)));
}

export const ThemedSlider = defineComponent({
  name: "ThemedSlider",
  props: {
    value: { type: Number, required: false, default: 0 },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    disabled: { type: Boolean, default: false },
  },
  emits: ["update:value", "change"],
  setup: (props, { emit }) => {
    const rootRef = ref<HTMLDivElement | null>(null);
    const dragging = ref(false);

    /** 父级清空或非法时避免 NaN，防止手柄、填充宽度跑出轨道 */
    const effectiveValue = (): number => {
      const v = Number(props.value);
      if (!Number.isFinite(v)) {
        return props.min;
      }
      return Math.min(Math.max(v, props.min), props.max);
    };

    const ratio = (): number => {
      const span = props.max - props.min;
      if (span <= 0) {
        return 0;
      }
      return (effectiveValue() - props.min) / span;
    };

    const percent = (): number => {
      const p = ratio() * 100;
      return Number.isFinite(p) ? Math.min(100, Math.max(0, p)) : 0;
    };

    const clientXToValue = (clientX: number): number => {
      const el = rootRef.value;
      if (!el) {
        return props.value;
      }
      const rect = el.getBoundingClientRect();
      const w = rect.width;
      if (w <= 0) {
        return props.value;
      }
      const x = Math.min(Math.max(clientX - rect.left, 0), w);
      const r = x / w;
      return clampSnap(props.min + r * (props.max - props.min), props.min, props.max, props.step);
    };

    const updateFromClientX = (clientX: number): void => {
      const next = clientXToValue(clientX);
      if (next !== props.value) {
        emit("update:value", next);
        emit("change", next);
      }
    };

    const onPointerMove = (e: PointerEvent): void => {
      if (!dragging.value) {
        return;
      }
      updateFromClientX(e.clientX);
    };

    const onPointerUp = (): void => {
      dragging.value = false;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };

    const onPointerDown = (e: PointerEvent): void => {
      if (props.disabled) {
        return;
      }
      e.preventDefault();
      dragging.value = true;
      updateFromClientX(e.clientX);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp, { once: true });
      window.addEventListener("pointercancel", onPointerUp, { once: true });
    };

    const onKeyDown = (e: KeyboardEvent): void => {
      if (props.disabled) {
        return;
      }
      const big = (props.max - props.min) / 10;
      let delta = 0;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        delta = props.step;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        delta = -props.step;
      } else if (e.key === "PageUp") {
        delta = big;
      } else if (e.key === "PageDown") {
        delta = -big;
      } else if (e.key === "Home") {
        e.preventDefault();
        emit("update:value", props.min);
        emit("change", props.min);
        return;
      } else if (e.key === "End") {
        e.preventDefault();
        emit("update:value", props.max);
        emit("change", props.max);
        return;
      } else {
        return;
      }
      e.preventDefault();
      const next = clampSnap(effectiveValue() + delta, props.min, props.max, props.step);
      if (next !== effectiveValue()) {
        emit("update:value", next);
        emit("change", next);
      }
    };

    onBeforeUnmount(() => {
      onPointerUp();
    });

    return (): JSX.Element => {
      const fillW = percent();
      return (
        <div
          ref={rootRef}
          class={[styles.root, props.disabled && styles.disabled]}
          style={{ "--ts-fill": `${fillW}%` }}
          tabIndex={props.disabled ? -1 : 0}
          role="slider"
          aria-valuemin={props.min}
          aria-valuemax={props.max}
          aria-valuenow={effectiveValue()}
          aria-disabled={props.disabled}
          onPointerdown={onPointerDown}
          onKeydown={onKeyDown}
        >
          <div class={styles.rail} />
          <div class={styles.fill} />
          <div class={styles.handle} />
        </div>
      );
    };
  },
});
