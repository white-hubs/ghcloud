import { type Component, defineAsyncComponent } from "vue";

export const parking_car_cards: Record<string, Component> = {
  // 车位总览
  "parking-car-statistics": defineAsyncComponent(
    async () => (await import("@/features/cards/parking-car/cards/parking-car-statistics/parking-car-statistics")).ParkingCarStatistics,
  ),
  // 车位总览
  "parking-car-statistics-detail": defineAsyncComponent(
    async () =>
      (await import("@/features/cards/parking-car/cards/parking-car-statistics-detail/parking-car-statistics-detail"))
        .ParkingCarStatisticsDetail,
  ),
  // 车场监控
  "parking-car-monitor": defineAsyncComponent(
    async () => (await import("@/features/cards/parking-car/cards/parking-car-monitor/parking-car-monitor")).ParkingCarMonitor,
  ),
  // 车辆进出场
  "parking-car-in-out": defineAsyncComponent(
    async () => (await import("@/features/cards/parking-car/cards/parking-car-in-out/parking-car-in-out")).ParkingCarInOut,
  ),
  // 滞留车辆分析
  "parking-car-stay": defineAsyncComponent(
    async () => (await import("@/features/cards/parking-car/cards/parking-car-stay/parking-car-stay")).ParkingCarStay,
  ),
  // 停车收费
  "parking-car-charge": defineAsyncComponent(
    async () => (await import("@/features/cards/parking-car/cards/parking-car-charge/parking-car-charge")).ParkingCarCharge,
  ),
  // 收费方式占比
  "parking-car-charge-interval": defineAsyncComponent(
    async () =>
      (await import("@/features/cards/parking-car/cards/parking-car-charge-interval/parking-car-charge-interval")).ParkingCarChargeInterval,
  ),
  // 收费趋势
  "parking-car-charge-trend": defineAsyncComponent(
    async () =>
      (await import("@/features/cards/parking-car/cards/parking-car-charge-trend/parking-car-charge-trend")).ParkingCarChargeTrend,
  ),
  // 车场分布
  "parking-car-distribution": defineAsyncComponent(
    async () =>
      (await import("@/features/cards/parking-car/cards/parking-car-distribution/parking-car-distribution")).ParkingCarDistribution,
  ),
  // 设备列表
  "parking-car-device-list": defineAsyncComponent(
    async () => (await import("@/features/cards/parking-car/cards/parking-car-device-list/parking-car-device-list")).ParkingCarDeviceList,
  ),
};
