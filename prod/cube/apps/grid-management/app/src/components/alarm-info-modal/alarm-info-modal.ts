import { AlarmRecords } from "./alarm-info-modal-components";
import styles from "./alarm-info-modal.module.less";
import { ConfigProvider, Modal } from "@ghcloud/cube-ui";
import { createApp, h } from "vue";

export const showAlarmInfoModal = (areaId?: string): void => {
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
              title: "报警记录",
              width: "80%",
              visible: true,
              footer: null,
              class: styles.alarmInfoModal,
              onCancel: () => {
                app.unmount();
                document.body.removeChild(root);
              },
            },
            h(AlarmRecords, {
              areaId: areaId || "",
            }),
          ),
        );
    },
  });
  app.mount(root);
};
