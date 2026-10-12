declare namespace Plan {
  interface GpsPatrolRule {
    gpsDistanceMeters: number | "";
    gpsStayMinutes: number | "";
  }
  interface FormState {
    keyword: string;
    areaId?: string;
    zq?: string;
    pageNumber: number;
    pageSize: number;
    total: number;
  }
  interface GetList {
    keyword: string;
    executeData: [EventValue<string>, EventValue<string>] | [EventValue<dayjs.Dayjs>, EventValue<dayjs.Dayjs>] | null;
    patrolCycle: string;
    status: string | number;

    pageNumber: number;
    pageSize: number;
    total: number;
  }
  interface AddPlan {
    taskList: unknown[];
    patrolWayList: string[];
    startData: any;
    endData: any;
    patrolCycle: string;
    patrolDataType: string;
    locationIds: { id: string }[];
    planName: string;
    executeData: [EventValue<string>, EventValue<string>] | [EventValue<dayjs.Dayjs>, EventValue<dayjs.Dayjs>] | null;
    patrolData: string | string[] | any;
    onDuty: boolean;
    routeId: string;
    inOrder: boolean;
    status: string;
    conditionParticipate: {
      conditionType: string;
      participateParams: {
        participateType: string;
        targetId: string;
        targetName: string;
      }[];
      abnormalUserList: {
        participateType: string;
        targetId: string;
        targetName: string;
      }[];
    } | null;
    rule: GpsPatrolRule;
    gpsDistanceMeters?: number | "";
    gpsStayMinutes?: number | "";
  }
  interface AddPoint {
    id?: string;
    patrolLocationName: string;
    nfcCode: string;
    remarks: string;
    patrolLongitude: string;
    patrolDimension: string;
    areaIds: ValueType;
    bluetoothCode: string;
    bimCode: string;
    deviceId: string;
  }
}

declare namespace Path {
  interface FormState {
    keyword: string;
    pageNumber: number;
    pageSize: number;
    total: number;
  }
}
declare namespace NFC {
  interface AddNfc {
    id?: string;
    deviceCode: string;
    nfcDimension: number;
    nfcLongitude: number;
    nfcCode: string;
    bluetoothCode: string;
    remarks: string;
  }
}

declare namespace Message {
  interface Info {
    condition: {
      name: string;
      value: number;
    }[];
    moduleType: string;
    msgConfig: {
      params: {
        satMsgChannelConfigModifyParams: {
          terminalName: string;
          channelType: string;
          terminal: string;
        }[];
        effectiveDays?: number;
        msgTmpContent: string;
        notifyExpression: string;
        satMsgDefineCode: string;
        enabled?: string;
      }[];
    };
  }
}

declare namespace PATH {
  interface Addpath {
    id?: string;
    patrolRouteName: string;
    locationIds: string[];
  }
}
declare namespace TASK {
  interface FormState {
    admin: boolean;
    keyword: string;
    // 任务名称
    taskState: string | number;

    // 任务状态
    pageNumber: number;

    pageSize: number;
    total: number;
  }

  interface AddTask {
    taskName: string;
    executeData: [EventValue<string>, EventValue<string>] | [EventValue<dayjs.Dayjs>, EventValue<dayjs.Dayjs>] | null;
    planId?: string;
    locationIds: { id: string }[];
    routeId: string;
    inOrder: boolean;
    taskList: unknown[];
    onDuty: boolean;
    patrolWayList: string[];
    conditionParticipate: {
      conditionType: string;
      participateParams: {
        participateType: string;
        targetId: string;
        targetName: string;
      }[];
      abnormalUserList: {
        participateType: string;
        targetId: string;
        targetName: string;
      }[];
    } | null;
    rule: Plan.GpsPatrolRule;
    gpsDistanceMeters?: number | "";
    gpsStayMinutes?: number | "";
  }
}
declare namespace RecordType {
  interface FormState {
    period: string;
    depId: string;
    keyword: string;
    pageNumber: number;
    pageSize: number;
    total: number;
  }
}

declare namespace Statistics {
  interface FormState {
    period: string;
    pageNumber: number;
    pageSize: number;
    total: number;
  }
}
