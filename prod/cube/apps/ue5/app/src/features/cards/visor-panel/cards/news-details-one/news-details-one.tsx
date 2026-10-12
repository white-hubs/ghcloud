import { createAnnouncementDetailCard } from "../../_shared/announcement-detail";

import "./news-details-one.module.less";

export const NewsDetailsOne = createAnnouncementDetailCard({
  name: "NewsDetailsOne",
  defaultTitle: "新闻资讯详情",
  firstType: "NEW_INFORMATION",
  panelClass: "visor-news-detail-one-v2-panel",
  offset: 0,
});

export default NewsDetailsOne;
