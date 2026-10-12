import { Layout } from "ant-design-vue";
import { defineComponent, computed } from "vue";
import { RouterView, useRoute } from "vue-router";

export const App = defineComponent({
  name: "App",
  setup() {
    const route = useRoute();

    const isViewerRoute = computed(() => route.path.startsWith("/viewer"));

    const isInEditor = computed(() => route.path.includes("/pages/") && !route.path.endsWith("/pages/"));

    return () => {
      // Viewer route: render without any chrome so the iframe gets a clean full-page surface
      if (isViewerRoute.value) {
        return (
          <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
            <RouterView />
          </div>
        );
      }

      return (
        <Layout
          style={{
            height: "100vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Layout.Content
            style={{
              flex: 1,
              minWidth: 0,
              height: "100vh",
              overflow: isInEditor.value ? "hidden" : "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <RouterView />
          </Layout.Content>
        </Layout>
      );
    };
  },
});
