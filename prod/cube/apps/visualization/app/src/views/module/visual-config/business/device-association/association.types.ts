export type AssociationDataType = "DEVICE" | "STALL" | "PROPERTY" | "RISK_SOURCE";

export const ASSOCIATION_DATA_TYPE_OPTIONS = [
  { label: "设备", value: "DEVICE" as const },
  { label: "档位", value: "STALL" as const },
  { label: "资产", value: "PROPERTY" as const },
  { label: "风险源", value: "RISK_SOURCE" as const },
];

export type AssociationPanelProps = {
  sceneType: string;
  areaOptions: unknown[];
  dataType: AssociationDataType;
  onDataTypeChange: (value: AssociationDataType) => void;
};
