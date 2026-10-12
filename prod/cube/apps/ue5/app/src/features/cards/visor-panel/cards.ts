import { type Component, defineAsyncComponent } from "vue";

export const visor_panel_cards: Record<string, Component> = {
  // 预约数据总览
  "reserve-data-view": defineAsyncComponent(
    async () => (await import("@/features/cards/visor-panel/cards/reserve-data-view/reserve-data-view")).ReserveDataView,
  ),
  // 最新预约记录
  "new-reserve-records": defineAsyncComponent(
    async () => (await import("@/features/cards/visor-panel/cards/new-reserve-records/new-reserve-records")).NewReserveRecords,
  ),
  // 访客通行趋势
  "visitor-transit-trend": defineAsyncComponent(
    async () => (await import("@/features/cards/visor-panel/cards/visitor-transit-trend/visitor-transit-trend")).VisitorTransitTrend,
  ),
  // 预约使用情况
  "use-reserve-stat": defineAsyncComponent(
    async () => (await import("@/features/cards/visor-panel/cards/use-reserve-stat/use-reserve-stat")).UseReserveStat,
  ),
  // 通知公告详情一
  "notification-details-one": defineAsyncComponent(
    async () =>
      (await import("@/features/cards/visor-panel/cards/notification-details-one/notification-details-one")).NotificationDetailsOne,
  ),
  // 通知公告详情二
  "notification-details-two": defineAsyncComponent(
    async () =>
      (await import("@/features/cards/visor-panel/cards/notification-details-two/notification-details-two")).NotificationDetailsTwo,
  ),
  // 通知公告列表
  "notice-announcement-list": defineAsyncComponent(
    async () =>
      (await import("@/features/cards/visor-panel/cards/notice-announcement-list/notice-announcement-list")).NoticeAnnouncementList,
  ),
  // 新闻资讯列表
  "news-announcement-list": defineAsyncComponent(
    async () => (await import("@/features/cards/visor-panel/cards/news-announcement-list/news-announcement-list")).NewsAnnouncementList,
  ),
  // 新闻资讯详情一
  "news-details-one": defineAsyncComponent(
    async () => (await import("@/features/cards/visor-panel/cards/news-details-one/news-details-one")).NewsDetailsOne,
  ),
  // 新闻资讯详情二
  "news-details-two": defineAsyncComponent(
    async () => (await import("@/features/cards/visor-panel/cards/news-details-two/news-details-two")).NewsDetailsTwo,
  ),
  // 黑名单预警
  "blacklist-alarm-list": defineAsyncComponent(
    async () => (await import("@/features/cards/visor-panel/cards/blacklist-alarm-list/blacklist-alarm-list")).BlacklistAlarmList,
  ),
};
