import type { Pagination } from "@ghcloud/cube-service-interface/base";

import type {
  AreaEmptyDeviceTotal,
  BindVisualDevicesParams,
  CountAreaEmptyDevicesParams,
  ListDeviceInstanceOfRuleConditionParams,
  ListVisualBoundDevicesParams,
  QueryDeviceIdsByAreaOrGroupAndTagParams,
  UnbindVisualDevicesParams,
} from "./request";
import type { DeviceInstance, DeviceInstancePageResult, DeviceTagRule } from "./response";

export interface DeviceCenterGateway {
  listDeviceInstanceOfRuleCondition: (params: ListDeviceInstanceOfRuleConditionParams) => Promise<Pagination<DeviceInstance>>;
  getDeviceTagRule: (tagCode: string) => Promise<DeviceTagRule>;
  queryDeviceIdsByAreaOrGroupAndTag: (params: QueryDeviceIdsByAreaOrGroupAndTagParams) => Promise<string[]>;

  /** 可视化场景已关联设备分页 */
  listVisualBoundDevices: (params: ListVisualBoundDevicesParams) => Promise<DeviceInstancePageResult>;

  /** 绑定设备到场景菜单 */
  bindVisualDevices: (params: BindVisualDevicesParams) => Promise<unknown>;

  /** 解绑场景菜单下的设备 */
  unbindVisualDevices: (params: UnbindVisualDevicesParams) => Promise<unknown>;

  /** 统计标签下区域为空的设备数 */
  countAreaEmptyDevices: (params: CountAreaEmptyDevicesParams) => Promise<AreaEmptyDeviceTotal>;
}
