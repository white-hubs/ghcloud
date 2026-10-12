import store from "./store";
import * as api from "@/api/index";
import { installComponent } from "@/components";
import "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/style.css";
import routes from "@/router";
import { createFromIconfontCN } from "@ant-design/icons-vue";
import Antd, { message } from "ant-design-vue";
import { type App, createApp } from "vue";
import SlideVerify from "vue-monoplasty-slide-verify";
import { createRouter, createWebHistory } from "vue-router";
import "@/styles/antd.less";
// import "ant-design-vue/dist/antd.less";
import "@/styles/index.less";

interface RenderProps {
  container?: Element | string;
  // base path，default：`/`
  base?: string;
}

export class Application {
  #app?: App<Element>;

  private get app(): App<Element> {
    if (!this.#app) {
      throw new Error("app not initialized!");
    }
    return this.#app;
  }

  public constructor(private readonly props: RenderProps) {}

  public async install(): Promise<void> {
    const { default: component } = await import("./App.vue");
    const app = createApp(component);
    app.use(store);
    app.config.globalProperties.$api = api;
    app.use(Antd);
    app.use(SlideVerify);
    app.component("IconFont", createFromIconfontCN());
    installComponent(app);
    Object.assign(app.config.globalProperties.$message, message);
    this.installRouter(app);
    this.mount(app);
    this.#app = app;
  }

  public async uninstall(): Promise<void> {
    this.app.unmount();
  }

  private installRouter(app: App<Element>): void {
    const { base = "" } = this.props;
    const router = createRouter({
      history: createWebHistory(base),
      routes,
    });
    app.use(router);
  }

  private mount(app: App<Element>): void {
    // TODO(danke): 由于当前 qiankun 传下的 props.contaniner 内包含 qiankun-head 头，如果直接用 container 渲染会导致 qiankun-head 被覆盖（当中承载样式等信息）遂暂用 id 的方式绑定容器
    app.mount("#BusinessApp");
  }
}
