import { logger } from "./log";
import { createElement } from "react";
import "./event";
import { createRoot, type Root } from "react-dom/client";
import { renderWithQiankun, qiankunWindow } from "vite-plugin-qiankun/dist/helper";

let rootData: Root | null = null;
async function bootstrap(): Promise<void> {
  const container = document.getElementById(__PROJECT_NAME__);

  if (!container) {
    throw new ReferenceError("Unexpected container is null!");
  }
  const root = createRoot(container);
  const { App: app } = await import("./app");
  rootData = root;
  root.render(createElement(app));
}

renderWithQiankun({
  bootstrap: () => {},
  mount: (props) => {
    bootstrap();
  },
  unmount: () => {
    rootData?.unmount();
    (document.getElementById(__PROJECT_NAME__) as unknown as HTMLElement).innerHTML = "";
    // (container as HTMLElement).innerHTML = ''
    // instance.$destroy()
    // instance.$el.innerHTML = ''
    // instance = null
    // router = null
  },
  update: () => {},
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  bootstrap();
}
