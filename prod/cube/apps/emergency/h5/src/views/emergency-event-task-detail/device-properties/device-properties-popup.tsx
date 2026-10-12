import dayjs from "dayjs";
import { Button, Field, Loading, Popup } from "vant";
import { computed, defineComponent, toRef, type PropType } from "vue";

import { displayPropertyValue, propertyOptions } from "./property-value";
import { useDeviceProperties, type LinkedDevice } from "./use-device-properties";

import styles from "./device-properties.module.less";

export const DevicePropertiesPopup = defineComponent({
  props: { device: Object as PropType<LinkedDevice> },
  emits: ["close"],
  setup(props, { emit }) {
    const state = useDeviceProperties(toRef(props, "device"));
    const options = computed(() => (state.editor.value ? propertyOptions(state.editor.value) : []));
    const enumInput = computed(() => ["enum", "boolean"].includes(state.editor.value?.dataType ?? ""));
    return () => (
      <Popup
        show={!!props.device}
        position="bottom"
        round
        closeOnPopstate
        closeOnClickOverlay={!state.submitting.value}
        onUpdate:show={(show) => {
          if (!show && !state.submitting.value) {
            emit("close");
          }
        }}
        class={styles.popup}
      >
        <header class={styles.header}>
          <div>
            <h2>{props.device?.deviceName || "设备详情"}</h2>
            <small>{props.device?.deviceCode || ""}</small>
          </div>
          <button class={styles.close} aria-label="关闭设备详情" disabled={state.submitting.value} onClick={() => emit("close")}>
            ×
          </button>
        </header>
        <div class={styles.toolbar}>
          <strong>实时参数</strong>
          <Button
            size="small"
            loading={state.refreshing.value}
            disabled={state.loading.value || state.submitting.value}
            onClick={() => void (state.error.value ? state.load() : state.refresh())}
          >
            刷新
          </Button>
        </div>
        {state.error.value && (
          <p class={styles.error} role="alert">
            {state.error.value}
          </p>
        )}
        {state.loading.value ? (
          <div class={styles.empty}>
            <Loading vertical>正在加载属性</Loading>
          </div>
        ) : (
          <div class={styles.grid}>
            {state.properties.value.map((property) => {
              const value = state.valueMap.value.get(property.propCode ?? "");
              const unit = property.unitName?.replace(/^-{1,2}$/u, "");
              return (
                <article class={styles.card} key={property.propCode}>
                  <div class={styles.name}>{property.name || property.propCode}</div>
                  <div class={styles.value}>
                    {displayPropertyValue(property, value?.value)}
                    <small>{unit}</small>
                  </div>
                  <div class={styles.time}>{value?.ts ? dayjs(value.ts).format("MM-DD HH:mm:ss") : "暂无采集时间"}</div>
                  {property.dataWrite === 1 ? (
                    <Button
                      size="small"
                      type="primary"
                      plain
                      disabled={!!state.error.value || state.submitting.value}
                      onClick={() => state.edit(property)}
                    >
                      操作
                    </Button>
                  ) : (
                    <span class={styles.readonly}>只读</span>
                  )}
                </article>
              );
            })}
          </div>
        )}
        {!state.loading.value && !state.error.value && state.properties.value.length === 0 && (
          <p class={styles.empty}>该设备暂无物模型属性</p>
        )}
        {state.editor.value && (
          <Popup
            show
            position="bottom"
            round
            teleport="body"
            closeOnClickOverlay={!state.submitting.value}
            onUpdate:show={(show) => {
              if (!show && !state.submitting.value) {
                state.editor.value = undefined;
              }
            }}
          >
            <section class={styles.editor} role="dialog" aria-label="设置设备属性">
              <h3>设置 · {state.editor.value.name || state.editor.value.propCode}</h3>
              <p class={styles.hint}>设备：{props.device?.deviceName || props.device?.deviceCode}，下发后将修改设备属性。</p>
              {enumInput.value ? (
                <label class={styles.selectLabel}>
                  属性值
                  <select
                    value={state.input.value}
                    disabled={state.submitting.value}
                    onChange={(event) => {
                      state.input.value = (event.target as HTMLSelectElement).value;
                    }}
                  >
                    <option value="" disabled>
                      请选择
                    </option>
                    {options.value.map((option) => (
                      <option key={String(option.value)} value={String(option.value)}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <Field
                  label="属性值"
                  modelValue={state.input.value}
                  disabled={state.submitting.value}
                  placeholder="请输入目标值"
                  onUpdate:modelValue={(value) => {
                    state.input.value = value;
                  }}
                />
              )}
              {state.editor.value.unitName && <p class={styles.hint}>单位：{state.editor.value.unitName}</p>}
              {state.editorError.value && (
                <p class={styles.error} role="alert">
                  {state.editorError.value}
                </p>
              )}
              <div class={styles.actions}>
                <Button
                  disabled={state.submitting.value}
                  onClick={() => {
                    state.editor.value = undefined;
                  }}
                >
                  取消
                </Button>
                <Button type="primary" loading={state.submitting.value} onClick={() => void state.submit()}>
                  确认下发
                </Button>
              </div>
            </section>
          </Popup>
        )}
      </Popup>
    );
  },
});
