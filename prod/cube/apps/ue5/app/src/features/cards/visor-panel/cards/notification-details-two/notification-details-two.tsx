import { createAnnouncementDetailCard } from "../../_shared/announcement-detail";

import "./notification-details-two.module.less";

export const NotificationDetailsTwo = createAnnouncementDetailCard({
  name: "NotificationDetailsTwo",
  defaultTitle: "通知公告详情",
  firstType: "ANNOUNCEMENT",
  panelClass: "visor-notice-detail-two-v2-panel",
  offset: 1,
});

export default NotificationDetailsTwo;
