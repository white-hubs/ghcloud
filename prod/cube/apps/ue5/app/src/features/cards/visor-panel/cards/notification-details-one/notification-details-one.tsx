import { createAnnouncementDetailCard } from "../../_shared/announcement-detail";

import "./notification-details-one.module.less";

export const NotificationDetailsOne = createAnnouncementDetailCard({
  name: "NotificationDetailsOne",
  defaultTitle: "通知公告详情",
  firstType: "ANNOUNCEMENT",
  panelClass: "visor-notice-detail-one-v2-panel",
  offset: 0,
});

export default NotificationDetailsOne;
