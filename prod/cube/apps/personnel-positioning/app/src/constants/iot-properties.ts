/** 人员定位接入的物联属性标识，终端与基站共用。 */
export const IOT_PROPERTIES = {
  x: "x",
  y: "y",
  z: "z",
  floorId: "floor_id",
  validFlag: "valid_flag",
} as const;

export const POSITION_PROPERTY_CODES = [IOT_PROPERTIES.x, IOT_PROPERTIES.y, IOT_PROPERTIES.z, IOT_PROPERTIES.validFlag] as const;
