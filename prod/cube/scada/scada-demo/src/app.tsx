import { ConfigProvider } from "ant-design-vue";
import zhCN from "ant-design-vue/es/locale/zh_CN";
import { defineComponent } from "vue";
import { RouterView } from "vue-router";

/** 与 `prod/cube/apps/iot-center/app/src/app.tsx` 一致：MF 皮肤主色 + 中文 locale */
function readSkinPrimaryColor(): string {
  try {
    const raw = localStorage.getItem("skinColor");
    if (raw) {
      const parsed = JSON.parse(raw) as { primaryColor?: string };
      if (parsed.primaryColor) {
        return parsed.primaryColor;
      }
    }
  } catch {
    /* ignore */
  }
  return "rgb(0, 186, 139)";
}

export const App = defineComponent({
  setup: () => {
    return (): JSX.Element => (
      <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: readSkinPrimaryColor() } }}>
        <div style={{ width: "100%", height: "100%", minHeight: 0, overflow: "hidden", background: "#f5f5f5" }}>
          <RouterView />
        </div>
      </ConfigProvider>
    );
  },
});
