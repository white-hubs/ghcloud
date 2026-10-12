import { TaskRecords } from "./task-info-modal-components";
import styles from "./task-info-modal.module.less";
import { ConfigProvider, Modal } from "@ghcloud/cube-ui";
import { createApp, h } from "vue";

export const showTaskInfoModal = (areaId: string): void => {
  const root = document.createElement("div");
  document.body.appendChild(root);

  const app = createApp({
    setup() {
      return () =>
        h(
          ConfigProvider,
          {
            prefixCls: "grid-management",
          },
          h(
            Modal,
            {
              title: "网格任务",
              width: "80%",
              visible: true,
              footer: null,
              class: styles.taskInfoModal,
              onCancel: () => {
                app.unmount();
                document.body.removeChild(root);
              },
            },
            h(TaskRecords, {
              areaId,
              onClose: () => {
                app.unmount();
                document.body.removeChild(root);
              },
            }),
          ),
        );
    },
  });
  app.mount(root);
};
