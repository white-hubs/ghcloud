import { defineComponent, type PropType } from "vue";

import "./card-title-icon.module.less";

export type CardTitleIconName =
  | "access-control-device"
  | "access-control-alarm"
  | "access-control-trend"
  | "access-control-people"
  | "access-control-analysis"
  | "access-control-records"
  | "asset-management-overview"
  | "asset-management-department"
  | "asset-management-region"
  | "asset-management-status"
  | "asset-management-classification"
  | "asset-management-outbound"
  | "air-conditioning-realtime"
  | "air-conditioning-trend"
  | "air-conditioning-rate"
  | "air-conditioning-distribution"
  | "air-conditioning-alarm"
  | "air-conditioning-records"
  | "supply-exhaust-realtime"
  | "supply-exhaust-trend"
  | "supply-exhaust-rate"
  | "supply-exhaust-distribution"
  | "supply-exhaust-offline"
  | "supply-exhaust-alarm-area"
  | "boiler-overview"
  | "boiler-temperature"
  | "boiler-water"
  | "boiler-energy"
  | "boiler-device"
  | "boiler-over-temperature"
  | "boiler-alarm"
  | "broadcast-ranking"
  | "broadcast-trend"
  | "broadcast-records"
  | "child-hospital-device"
  | "child-hospital-alarm"
  | "child-hospital-trend"
  | "overview-safe-days"
  | "overview-alarm"
  | "overview-device"
  | "overview-patrol"
  | "overview-monitor"
  | "overview-personnel"
  | "overview-management"
  | "overview-hidden-danger"
  | "overview-work-order"
  | "meeting-availability"
  | "meeting-period"
  | "meeting-utilization"
  | "delivery-order"
  | "delivery-order-trend"
  | "delivery-user"
  | "delivery-user-trend"
  | "delivery-revenue"
  | "delivery-revenue-trend"
  | "delivery-evaluation"
  | "meat-ranking"
  | "meat-transaction"
  | "meat-supply"
  | "meat-food-safety"
  | "meat-batch"
  | "meat-device"
  | "meat-audit"
  | "merchant-stat"
  | "merchant-list"
  | "merchant-area"
  | "merchant-questionnaire"
  | "merchant-honesty"
  | "merchant-contract"
  | "medical-gas-overview"
  | "medical-gas-ranking"
  | "medical-gas-trend";

const iconPaths: Record<CardTitleIconName, string> = {
  "access-control-device": "M5 5h14v10H5V5Zm3 13h8M12 15v3M8 9h2m2 0h4",
  "access-control-alarm": "M12 4 3.5 19h17L12 4Zm0 5v4m0 3h.01",
  "access-control-trend": "M4 17 9 12l3 3 7-8M15 7h4v4",
  "access-control-people": "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm6-1a2.5 2.5 0 1 0 0-5M4 19v-2a5 5 0 0 1 10 0v2m1-6a4 4 0 0 1 5 4v2",
  "access-control-analysis": "M12 4a8 8 0 1 0 8 8h-8V4Zm3 0v5h5A8 8 0 0 0 15 4Z",
  "access-control-records": "M6 4h12v16H6V4Zm3 4h6M9 12h6m-6 4h4",
  "asset-management-overview": "M5 4h14v16H5V4Zm3 4h3v3H8V8Zm5 0h3v3h-3V8Zm-5 5h3v3H8v-3Zm5 0h3v3h-3v-3Z",
  "asset-management-department": "M4 20V8l8-4 8 4v12M8 20v-6h8v6M9 9h1m4 0h1",
  "asset-management-region": "M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  "asset-management-status": "M12 3a9 9 0 1 0 9 9h-9V3Zm3 1.2A9 9 0 0 1 19.8 9H15V4.2Z",
  "asset-management-classification": "M4 5h6v6H4V5Zm10 0h6v6h-6V5ZM4 15h6v4H4v-4Zm10 0h6v4h-6v-4Z",
  "asset-management-outbound": "M4 19h16M6 16l4-4 3 2 5-7M15 7h3v3",
  "air-conditioning-realtime": "M4 5.5h16v11H4zM8 20h8M12 16.5V20M8 9h8M8 12.5h5",
  "air-conditioning-trend": "M4 18V6M4 18h16M7 14l3-3 3 2 5-6M16 7h2v2",
  "air-conditioning-rate": "M7.5 8.5h.01M16.5 15.5h.01M7 17 17 7M12 3.5a8.5 8.5 0 1 1-8.5 8.5",
  "air-conditioning-distribution":
    "M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8M12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7",
  "air-conditioning-alarm": "M12 4 3.5 19h17zM12 9v4M12 16h.01",
  "air-conditioning-records": "M6 4h12v16H6zM9 8h6M9 12h6M9 16h4",
  "supply-exhaust-realtime": "M4 5.5h16v11H4zM8 20h8M12 16.5V20M8 9h8M8 12.5h5",
  "supply-exhaust-trend": "M4 18V6M4 18h16M7 14l3-3 3 2 5-6M16 7h2v2",
  "supply-exhaust-rate": "M7.5 8.5h.01M16.5 15.5h.01M7 17 17 7M12 3.5a8.5 8.5 0 1 1-8.5 8.5",
  "supply-exhaust-distribution":
    "M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8M12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7",
  "supply-exhaust-offline": "M5 5h14v10H5V5Zm3 13h8M12 15v3M8 9h2m2 0h4M6 4l12 16",
  "supply-exhaust-alarm-area": "M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Zm0-13v4m0 3h.01",
  "boiler-overview": "M5 4h14v16H5V4Zm3 4h3v3H8V8Zm5 0h3v3h-3V8Zm-5 5h3v3H8v-3Zm5 0h3v3h-3v-3Z",
  "boiler-temperature": "M10 5a2 2 0 0 1 4 0v8.3a4 4 0 1 1-4 0V5Zm2 3v7",
  "boiler-water": "M12 3s6 6.1 6 11a6 6 0 0 1-12 0c0-4.9 6-11 6-11Zm-3 12a3 3 0 0 0 3 2",
  "boiler-energy": "M13.5 2 5 13h6l-.5 9L19 10h-6l.5-8Z",
  "boiler-device": "M5 5h14v10H5V5Zm3 13h8M12 15v3M8 9h2m2 0h4",
  "boiler-over-temperature": "M10 5a2 2 0 0 1 4 0v8.3a4 4 0 1 1-4 0V5Zm2 3v7M18 5v4m0 3h.01",
  "boiler-alarm": "M6 17h12l-1.5-2V10a4.5 4.5 0 0 0-9 0v5L6 17Zm4 2h4",
  "broadcast-ranking": "M5 18h14M7 14h3v4H7v-4Zm4-5h3v9h-3V9Zm4-4h3v13h-3V5Z",
  "broadcast-trend": "M4 18V6M4 18h16M7 14l3-4 3 2 5-7M16 5h3v3",
  "broadcast-records": "M6 4h12v16H6V4Zm3 4h6M9 12h6M9 16h4M18 8l2-2m0 0-2-2m2 2h-4",
  "child-hospital-device": "M5 5h14v10H5V5Zm3 13h8M12 15v3M8 9h2m2 0h4",
  "child-hospital-alarm": "M12 4 3.5 19h17L12 4Zm0 5v4m0 3h.01",
  "child-hospital-trend": "M4 18V6M4 18h16M7 14l3-3 3 2 5-6M16 7h2v2",
  "overview-safe-days": "M7 3v3M17 3v3M4 8h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm4 8 2 2 4-5",
  "overview-alarm": "M12 4 3.5 19h17L12 4Zm0 5v4m0 3h.01",
  "overview-device": "M5 5h14v10H5V5Zm3 13h8M12 15v3M8 9h2m2 0h4",
  "overview-patrol": "M12 3l7 4v5c0 4.4-2.9 7.1-7 9-4.1-1.9-7-4.6-7-9V7l7-4Zm-3 9 2 2 4-5",
  "overview-monitor": "M4 5h16v11H4V5Zm5 14h6M12 16v3M8 9h8v3H8V9Z",
  "overview-personnel": "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm6-1a2.5 2.5 0 1 0 0-5M4 19v-2a5 5 0 0 1 10 0v2m1-6a4 4 0 0 1 5 4v2",
  "overview-management": "M5 5h14v4H5V5Zm0 6h14v8H5v-8Zm3 3h3m3 0h2M8 17h5",
  "overview-hidden-danger": "M12 4 3.5 19h17L12 4Zm0 5v4m0 3h.01M7 19h10",
  "overview-work-order": "M7 4h10l2 2v14H5V4h2Zm2 5h6M9 13h6M9 17h4M16 4v3h3",
  "meeting-availability": "M7 3v3M17 3v3M4 8h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3 8h2m2 0h2M9 16h2",
  "meeting-period": "M12 4a8 8 0 1 0 8 8h-8V4Zm3 0v5h5M4 20h16",
  "meeting-utilization": "M4 18V6M4 18h16M7 14l3-3 3 2 5-6M16 7h3v3",
  "delivery-order": "M7 4h10l2 3v13H5V4h2Zm1 5h8M8 13h8M8 17h5M16 4v4h3",
  "delivery-order-trend": "M4 18V6M4 18h16M7 14l3-3 3 2 5-6M16 7h3v3",
  "delivery-user": "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm6-1a2.5 2.5 0 1 0 0-5M4 19v-2a5 5 0 0 1 10 0v2m1-6a4 4 0 0 1 5 4v2",
  "delivery-user-trend": "M4 18V6M4 18h16M7 15l3-4 3 2 5-7M15 6h4v4M8 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  "delivery-revenue": "M6 5h12M8 5v14m8-14v14M6 10h12M9 14h6M11 18h2",
  "delivery-revenue-trend": "M4 18V6M4 18h16M7 14l3-3 2 2 6-8M15 5h4v4M8 8h8",
  "delivery-evaluation": "M5 5h14v11H8l-3 3V5Zm4 4h6M9 13h4M17 8l1 1 2-3",
  "meat-ranking": "M5 18h14M7 14h3v4H7v-4Zm4-5h3v9h-3V9Zm4-4h3v13h-3V5Z",
  "meat-transaction": "M6 5h12M8 5v14m8-14v14M6 10h12M9 14h6M11 18h2",
  "meat-supply": "M4 17h16M6 17V8l6-4 6 4v9M9 17v-5h6v5M8 9h.01M16 9h.01",
  "meat-food-safety": "M12 3l7 4v5c0 4.4-2.9 7.1-7 9-4.1-1.9-7-4.6-7-9V7l7-4Zm-3 9 2 2 4-5",
  "meat-batch": "M5 5h14v14H5V5Zm4 4h6M9 12h6M9 15h3M6 3h12M8 21h8",
  "meat-device": "M5 5h14v10H5V5Zm3 13h8M12 15v3M8 9h2m2 0h4M17 8h.01",
  "meat-audit": "M7 4h10l2 2v14H5V4h2Zm2 5h6M9 13h4m-4 4h3M15 16l1.5 1.5L20 14",
  "merchant-stat": "M5 5h14v14H5V5Zm3 4h8M8 13h3m3 0h2M8 17h8",
  "merchant-list": "M6 5h12v14H6V5Zm3 4h6M9 12h6M9 15h4",
  "merchant-area": "M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  "merchant-questionnaire": "M6 4h12v13H9l-3 3V4Zm4 4h5M10 12h3M16 12h.01",
  "merchant-honesty": "M12 3l7 4v5c0 4.4-2.9 7.1-7 9-4.1-1.9-7-4.6-7-9V7l7-4Zm-3 9 2 2 4-5",
  "merchant-contract": "M7 4h10l2 2v14H5V4h2Zm2 5h6M9 13h6M9 17h4M16 4v3h3",
  "medical-gas-overview": "M8 4h8v5.2l3.5 5.1A4 4 0 0 1 16.2 20H7.8a4 4 0 0 1-3.3-5.7L8 9.2V4Zm2 0h4M8 14h8M9 17h6",
  "medical-gas-ranking": "M5 18h14M7 14h3v4H7v-4Zm4-5h3v9h-3V9Zm4-4h3v13h-3V5ZM4 5l2 2m0-2L4 7",
  "medical-gas-trend": "M4 18V6M4 18h16M7 14l3-4 3 2 5-7M16 5h3v3M7 5h4",
};

export const CardTitleIcon = defineComponent({
  name: "CardTitleIcon",
  props: {
    name: {
      type: String as PropType<CardTitleIconName>,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <span class="panel-card-title-icon v2-title-icon" aria-hidden="true">
        <svg class="panel-card-title-icon__glyph v2-title-icon-svg" viewBox="0 0 24 24" fill="none">
          <path d={iconPaths[props.name]} stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    );
  },
});

export default CardTitleIcon;
