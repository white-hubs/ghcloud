import { createAnnouncementDetailCard } from "../../_shared/announcement-detail";

import "./news-details-two.module.less";

export const NewsDetailsTwo = createAnnouncementDetailCard({
  name: "NewsDetailsTwo",
  defaultTitle: "新闻资讯详情",
  firstType: "NEW_INFORMATION",
  panelClass: "visor-news-detail-two-v2-panel",
  offset: 1,
});

export default NewsDetailsTwo;
