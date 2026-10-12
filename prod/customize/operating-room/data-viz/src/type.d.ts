declare interface Window {
  config: {
    terminal: string;
    systemName: string;
    mqttUrl: string;
    copyright: string;
  };
  businessData?: {
    title: string;
    authToken: {
      accessToken: string;
      userID: string;
    };
    userData: {
      id: string;
      name: string;
    };
    authNowEnterprise: {
      code: string;
      name: string;
    };
    areaData: unknown[];
    departmentList: DeptList[];
    ruleAllData: unknown[];
    devicePageData: {
      total: number;
      pages: number;
      records: RoomItem[];
    };
    prodListDetailData: unknown[];
    correctNormSet: GetDictionaryByItem[];
    specialNormSet: GetDictionaryByItem[];
    EXTEND_CONFIG_MQTT_BROKER: string; // mqtt地址 ip:port
    EXTEND_CONFIG_MQTT_USERNAME: string; // 用户名
    EXTEND_CONFIG_MQTT_PASSWORD: string; // 密码
  };
}
