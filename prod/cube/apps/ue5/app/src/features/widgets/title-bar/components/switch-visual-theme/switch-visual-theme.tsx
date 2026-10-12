import { Dropdown } from "ant-design-vue";
import { defineComponent } from "vue";

import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import styles from "./switch-visual-theme.module.less";

/** 可视化主题切换：科技蓝 / 极简白 */
export const SwitchVisualTheme = defineComponent({
  name: "SwitchVisualTheme",
  setup() {
    const { currentTheme, currentThemeLabel, switchVisible, visualThemeOptions, setVisualTheme } = useVisualTheme();

    return (): JSX.Element | null => {
      if (!switchVisible.value) {
        return null;
      }

      return (
        <Dropdown
          getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
          v-slots={{
            overlay: () => (
              <div class={styles.list}>
                {visualThemeOptions.map((item) => (
                  <div
                    class={[styles["list-item"], item.value === currentTheme.value ? styles.active : ""]}
                    key={item.value}
                    onClick={() => setVisualTheme(item.value)}
                  >
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            ),
          }}
        >
          <div class={styles.box}>
            <span>{currentThemeLabel.value}</span>
          </div>
        </Dropdown>
      );
    };
  },
});
