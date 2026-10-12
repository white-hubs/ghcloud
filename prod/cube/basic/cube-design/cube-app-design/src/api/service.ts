import { getAppAuthStore } from "../utils/index";
import { CubeAlarmCenterService } from "@ghcloud/cube-alarm-center-service";
import { CubeAssetManagementService } from "@ghcloud/cube-asset-management-service";
import { CubeBusinessTagService } from "@ghcloud/cube-business-tag-service";
import { CubeDailyInspectionService } from "@ghcloud/cube-daily-inspection-service";
import { CubeDailyTaskService } from "@ghcloud/cube-daily-task-service";
import { CubeFileService } from "@ghcloud/cube-file-service";
import { GatewayProxy, type ServiceError, CubeGateway, type LegacyServiceError, type CubeAuth } from "@ghcloud/cube-gateway";
import { CubeDeviceCenterInternalService, CubeDeviceCenterService, CubeDeviceIotCenterService } from "@ghcloud/cube-iot-center-service";
import { CubeMaintainService } from "@ghcloud/cube-maintain-service";
import { CubeMdataService } from "@ghcloud/cube-mdata-service";
import { CubeOuaaService } from "@ghcloud/cube-ouaa-service";
import { BASE_API } from "@ghcloud/cube-protocol";
import { CubePropertyService } from "@ghcloud/cube-risk-management-service";
import { CubeSmallEngineeringService } from "@ghcloud/cube-small-engineering-service";
import { CubeFlowService } from "@ghcloud/cube-stream-engine-service";
import { message } from "@ghcloud/cube-ui";

const authStore = getAppAuthStore().authStore;

export class ExtendedCubeDeviceCenterInternalService extends CubeDeviceCenterInternalService {
  private readonly myGateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    super(auth);
    this.myGateway = new CubeGateway(auth);
  }

  /** 设备列表 分页 */
  public async getDevicePage(payload: {
    pageSize?: number;
    pageNumber?: number;
    prodId?: string | undefined;
    deviceNameOrNumber?: string | undefined;
    isMainDeviceOnly?: boolean | undefined;
    deviceIds?: string | undefined;
  }): Promise<{ records: unknown[]; total: number }> {
    const url = `${BASE_API}/device-center/device/mgt/page`;
    const resp = await this.myGateway.get<LegacyServiceError<{ records: unknown[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  /** 设备列表 */
  public async getDeviceList(payload: {
    prodId?: string | undefined;
    prodCategoryId?: string | undefined;
    deviceNameOrNumber?: string | undefined;
    status?: string | number | undefined;
    isMainDeviceOnly?: boolean | undefined;
    deviceIds?: string | undefined;
  }): Promise<unknown[]> {
    const url = `${BASE_API}/device-center/device/mgt/list`;
    const resp = await this.myGateway.get<LegacyServiceError<unknown[]>>({ url, payload });
    return resp.data || resp;
  }
}

/**
 * @deprecated: 旧的实现，后续使用参考 cube-services 下的实现方式
 */
export class ApiProxy extends GatewayProxy {
  private auth: CubeAuth;
  public constructor(auth?: CubeAuth) {
    super();
    this.auth = auth ?? authStore;
  }
  // ouaa服务
  public get cubeOuaaService(): CubeOuaaService {
    return new CubeOuaaService(this.auth);
  }

  public get cubeOuaaServiceProxy(): CubeOuaaService {
    return this.createProxiedInstance(this.cubeOuaaService);
  }
  // alarm-center服务
  public get cubeAlarmCenterService(): CubeAlarmCenterService {
    return new CubeAlarmCenterService(this.auth);
  }

  public get cubeAlarmCenterServiceProxy(): CubeAlarmCenterService {
    return this.createProxiedInstance(this.cubeAlarmCenterService);
  }

  // mdata服务
  public get cubeMdataService(): CubeMdataService {
    return new CubeMdataService(this.auth);
  }

  public get cubeMdataServiceProxy(): CubeMdataService {
    return this.createProxiedInstance(this.cubeMdataService);
  }

  // maintain服务
  public get cubeMaintainService(): CubeMaintainService {
    return new CubeMaintainService(this.auth);
  }

  public get cubeMaintainServiceProxy(): CubeMaintainService {
    return this.createProxiedInstance(this.cubeMaintainService);
  }

  // 巡检服务
  public get cubeDailyInspectionService(): CubeDailyInspectionService {
    return new CubeDailyInspectionService(this.auth);
  }

  public get cubeDailyInspectionServiceProxy(): CubeDailyInspectionService {
    return this.createProxiedInstance(this.cubeDailyInspectionService);
  }

  // 设备中心服务
  public get cubeDeviceCenterService(): CubeDeviceCenterService {
    return new CubeDeviceCenterService(this.auth);
  }

  public get cubeDeviceCenterServiceProxy(): CubeDeviceCenterService {
    return this.createProxiedInstance(this.cubeDeviceCenterService);
  }

  // 设备中心服务
  public get cubeDeviceIotCenterService(): CubeDeviceIotCenterService {
    return new CubeDeviceIotCenterService(this.auth);
  }

  public get cubeDeviceIotCenterServiceProxy(): CubeDeviceIotCenterService {
    return this.createProxiedInstance(this.cubeDeviceIotCenterService);
  }

  // 设备中心服务
  public get cubeDeviceCenterInternalService(): ExtendedCubeDeviceCenterInternalService {
    return new ExtendedCubeDeviceCenterInternalService(this.auth);
  }

  public get cubeDeviceCenterInternalServiceProxy(): ExtendedCubeDeviceCenterInternalService {
    return this.createProxiedInstance(this.cubeDeviceCenterInternalService);
  }

  public get cubeFileServiceProxy(): CubeFileService {
    return new CubeFileService(this.auth);
  }
  public get cubeFlowServiceProxy(): CubeFlowService {
    return new CubeFlowService(this.auth);
  }

  // 资产
  public get cubeAssetManagementService(): CubeAssetManagementService {
    return new CubeAssetManagementService(this.auth);
  }

  public get cubeAssetManagementServiceProxy(): CubeAssetManagementService {
    return this.createProxiedInstance(this.cubeAssetManagementService);
  }

  // 风险源
  public get cubeRiskManagementService(): CubePropertyService {
    return new CubePropertyService(this.auth);
  }

  public get cubeRiskManagementServiceProxy(): CubePropertyService {
    return this.createProxiedInstance(this.cubeRiskManagementService);
  }

  // 小散工程
  public get cubeSmallEngineeringService(): CubeSmallEngineeringService {
    return new CubeSmallEngineeringService(this.auth);
  }

  public get cubeSmallEngineeringServiceProxy(): CubeSmallEngineeringService {
    return this.createProxiedInstance(this.cubeSmallEngineeringService);
  }

  // 业务标签服务
  public get cubeBusinessTagService(): CubeBusinessTagService {
    return new CubeBusinessTagService(this.auth);
  }

  public get cubeBusinessTagServiceProxy(): CubeBusinessTagService {
    return this.createProxiedInstance(this.cubeBusinessTagService);
  }

  // 日常任务服务
  public get cubeDailyTaskService(): CubeDailyTaskService {
    return new CubeDailyTaskService(this.auth);
  }

  public get cubeDailyTaskServiceProxy(): CubeDailyTaskService {
    return this.createProxiedInstance(this.cubeDailyTaskService);
  }

  public override errorNotify(error: ServiceError): void {
    message.error(error.errorMessage);
  }

  public updateAuth(auth: CubeAuth): void {
    this.auth = auth;
  }
}
export const apiProxy = new ApiProxy();
export const cubeOuaaService = apiProxy.cubeOuaaServiceProxy;
export const cubeFileService = apiProxy.cubeFileServiceProxy;
export const cubeMdataService = apiProxy.cubeMdataServiceProxy;
export const cubeMaintainService = apiProxy.cubeMaintainServiceProxy;
export const cubeDailyInspectionService = apiProxy.cubeDailyInspectionServiceProxy;
export const cubeDeviceIotCenterService = apiProxy.cubeDeviceIotCenterServiceProxy;
export const cubeDeviceCenterService = apiProxy.cubeDeviceCenterServiceProxy;
export const cbeDeviceCenterInternalService = apiProxy.cubeDeviceCenterInternalService;
export const cubeFlowService = apiProxy.cubeFlowServiceProxy;
export const cubeAssetManagementService = apiProxy.cubeAssetManagementServiceProxy;
export const cubeRiskManagementService = apiProxy.cubeRiskManagementServiceProxy;
export const cubeSmallEngineeringService = apiProxy.cubeSmallEngineeringServiceProxy;
export const cubeBusinessTagService = apiProxy.cubeBusinessTagServiceProxy;
export const cubeDailyTaskService = apiProxy.cubeDailyTaskServiceProxy;
export const cubeAlarmCenterService = apiProxy.cubeAlarmCenterServiceProxy;
