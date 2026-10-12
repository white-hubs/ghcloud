import { type CubeAuth, CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import type { CubeCustomRequestOptions } from "@ghcloud/cube-gateway/src/gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

import type {
  Product,
  ProductCategoryTree,
  ProductIotCategoryTree,
  ProductModel,
  NorthDeviceProp,
  PageResult,
  UniversalDictionary,
  ProductState,
  DeviceSceneConfig,
  BusinessType,
  DeviceTagPercentage,
  DeviceTagStatusCount,
  DeviceInstancePage,
  NorthProdListDetail,
  NorthDeviceDetail,
  DeviceSamplingHistoryResult,
  DeviceProductPropVoList,
  DeviceTagDetail,
  DeviceMgtSchemaTipsVO,
  TagType,
  DeviceInstanceDetail,
  HistoryGroup,
  NorthDeviceListDetailVO,
  EquipmentAssociationRuleField,
  DeviceGroupPage,
  DeviceGroupDevices,
  DeviceSort,
  DeviceGroup,
  ProductProp,
  CompareType,
  ProductEventDetailModel,
} from "./types";

const baseURL = `${BASE_API}`;

/** 设备中心服务 */
export class CubeDeviceCenterService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  /** 产品列表 分页 */
  public async getProductPage(payload: {
    pageSize: number;
    pageNumber: number;
    prodName?: string | undefined;
    prodCategoryId?: string | undefined;
  }): Promise<{ records: unknown[]; total: number }> {
    const url = `${baseURL}/device-center/things/product/page`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: unknown[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  /** 产品导出 */
  public async exportProduct(payload: { productId: string | number }): Promise<Blob> {
    const url = `${baseURL}/device-center/transfer/product/export/excel`;
    const form = new FormData();
    form.append("productId", payload.productId);
    const resp = await this.gateway.customBlob({
      url,
      payload: form,
      method: "POST",
    });
    return resp;
  }

  /** 产品账导入 */
  public async importBatchProduct(payload: { file: Blob | null }): Promise<unknown> {
    const url = `${baseURL}/device-center/transfer/product/import`;
    const form = new FormData();
    form.append("file", payload.file);
    const resp = await this.gateway.custom({
      url,
      payload: form,
      method: "POST",
    });
    return resp;
  }

  /** 产品-新增 */
  public async addProduct(payload: {
    prodName: string;
    prodCategoryId: string;
    prodBrandId: string;
    nodeType: number;
    accessTypeId: string;
    protocolId: string;
  }): Promise<unknown> {
    const url = `${baseURL}/device-center/things/product`;
    return this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
  }

  /** 产品-更新 */
  public async updateProduct(
    prodId: string,
    payload: {
      prodBrandId: string;
      prodModel: string;
      prodName: string;
      prodIcon: string;
      prodPic: string;
      remark: string;
    },
  ): Promise<void> {
    const url = `${baseURL}/device-center/things/product/${prodId}`;
    return this.gateway.update({ url, payload });
  }

  /** 产品-删除 */
  public async delProduct(prodId: string): Promise<void> {
    const url = `${baseURL}/device-center/things/product/${prodId}`;
    await this.gateway.delete({ url });
  }

  /** 产品详情 */
  public async getProductCategoryDetail(prodId: string): Promise<Product> {
    const url = `${baseURL}/device-center/things/product/${prodId}`;
    const resp = await this.gateway.get<LegacyServiceError<Product>>({ url });
    return resp.data || resp;
  }

  /** 字典-产品品类树 */
  public async getProductCategoryTree(tenant?: string | undefined): Promise<ProductCategoryTree[]> {
    const url = `${baseURL}/device-center/base/prod-category/prod-category-tree`;
    const headers = tenant ? { headers: { tenant } } : {};
    const resp = await this.gateway.custom<LegacyServiceError<ProductCategoryTree[]>>({
      url,
      query: { tenant },
      method: "GET",
      ...headers,
    });
    return resp.data || resp;
  }

  /** 字典-产品品类树  上层应用使用 */
  public async getIotProductCategoryTree(tenant?: string | undefined): Promise<ProductIotCategoryTree[]> {
    const url = `${baseURL}/device-center/iot/product/category-tree`;
    const headers = tenant ? { headers: { tenant } } : {};
    const resp = await this.gateway.custom<LegacyServiceError<ProductIotCategoryTree[]>>({
      url,
      query: { tenant },
      method: "GET",
      ...headers,
    });
    return resp.data || resp;
  }

  /** 获取产品型号 */
  public async getProductModel(categoryCode: string): Promise<ProductModel[]> {
    const url = `${baseURL}/device-center/category/${categoryCode}/product/list`;
    const resp = await this.gateway.get<LegacyServiceError<ProductModel[]>>({ url });
    return resp.data || resp;
  }

  /** 产品品类-删除 */
  public async delProductCategory(prodId: string): Promise<void> {
    const url = `${baseURL}/device-center/base/prod-category/${prodId}`;
    await this.gateway.delete({ url });
  }

  /** 产品品类-更新 */
  public async updateProductCategory(
    prodId: string,
    payload: {
      itemLabel: string;
      itemValue?: string;
    },
  ): Promise<void> {
    const url = `${baseURL}/device-center/base/prod-category/${prodId}`;
    return this.gateway.update({ url, payload });
  }

  /** 设备实例-台账列表 分页 */
  public async getDeviceInstancePage(payload: {
    pageSize: number;
    pageNumber: number;
    departmentId?: string | undefined;
    keyword?: string | undefined;
    lastAreaId?: string | undefined;
    prodId?: string | undefined;
    prodCategoryCode?: string | undefined;
    bizType?: string | undefined;
    tagCode?: string | undefined;
  }): Promise<{ records: unknown[]; total: number }> {
    const url = `${baseURL}/device-center/device-instance/page`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: unknown[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  /** 设备实例-台账列表 上层业务通用 */
  public async getDeviceInstancePageAll(
    payload: {
      anyAreaId?: string | undefined;
      pageSize: number;
      pageNumber: number;
      departmentId?: string | undefined;
      keyword?: string | undefined;
      lastAreaId?: string | undefined;
      prodCategoryCode?: string;
      productId?: string | undefined;
      tagCodes?: string[] | undefined;
      filterTagCodes?: string[];
      filterIds?: string[];
      matchedDeviceIds?: string[];
      categoryCode?: string | undefined;
      deviceSort?: DeviceSort | undefined;
      deviceState?: boolean;
      anyMatchedAreaId?: string;
    },
    tenant?: string | undefined,
  ): Promise<{ records: DeviceInstancePage[]; total: number; pages: number }> {
    const url = `${baseURL}/device-center/device/instance/page`;
    const headers = tenant ? { headers: { tenant } } : {};
    const resp = await this.gateway.custom<LegacyServiceError<{ records: DeviceInstancePage[]; total: number; pages: number }>>({
      url,
      payload,
      method: "POST",
      ...headers,
    });
    return resp.data || resp;
  }

  /** 自定义标签下拉列表 */
  public async getCustomerTagListAll(payload: {
    tenant?: string;
    deviceId?: string | number | undefined;
    pageNumber?: number;
    pageSize?: number;
    period?: string | undefined;
    status?: number;
    tagName?: string;
  }): Promise<DeviceTagDetail[]> {
    this.gateway.updateAuth({ tenant: payload.tenant });
    const url = `${baseURL}/device-center/tag/customer/list`;
    const resp = await this.gateway.get<LegacyServiceError<DeviceTagDetail[]>>({ url, payload });
    return resp.data || resp;
  }

  /** 设备-查询设备的属性、值 （北向） */
  public async getNorthDeviceProp(payload: {
    deviceId?: string;
    propertyCodes?: string;
    notBeforeTs?: string;
  }): Promise<NorthDeviceProp[]> {
    const url = `${baseURL}/iot/north/device/prop`;
    const resp = await this.gateway.get<LegacyServiceError<NorthDeviceProp[]>>({ url, payload });
    return resp.data || resp;
  }

  /** 设备-查询设备详情 （北向） */
  public async getNorthDeviceDetail(payload: {
    deviceId: string;
    withSnapShot?: boolean; // 是否包含属性快照(即实时属性)
    withEventSpec?: boolean; // 是否包含事件
    withCommandSpec?: boolean; // 是否包含命令
    withPropertySpec?: boolean; // 是否包含属性
  }): Promise<NorthDeviceDetail> {
    const url = `${baseURL}/iot/north/device/detail`;
    const resp = await this.gateway.get<LegacyServiceError<NorthDeviceDetail>>({ url, payload });
    return resp.data || resp;
  }

  /** 多设备-实时属性获取 （北向） */
  public async getNorthDeviceListDetail(payload: {
    devIdAndPropCodes?: string; // 设备id和属性code，多个用逗号隔开，设备id和属性code之间用.隔开
    notBeforeTs?: number;
  }): Promise<NorthDeviceListDetailVO[]> {
    const url = `${baseURL}/iot/north/device/prop/multi-prop`;
    const resp = await this.gateway.get<LegacyServiceError<NorthDeviceListDetailVO[]>>({ url, payload });
    return resp.data || resp;
  }

  /** 单设备-采样分页获取 */
  public async getDeviceHistoryPage(payload: {
    deviceId?: string | number | undefined;
    endTs?: number | undefined;
    startTs?: number | undefined;
    maxRecords?: number;
    order?: string;
    pageNumber?: number;
    pageSize?: number;
    prodCategoryId?: string;
    propCodes?: string[];
    samplingTimeInterval?: string; // 采样间隔 INTERVAL_OF_10_MINUTE_ANY :10分钟
  }): Promise<{ records: DeviceSamplingHistoryResult[]; total: number }> {
    const url = `${baseURL}/iot/north/device/prop/device-history-page`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: DeviceSamplingHistoryResult[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  /** 设备台账详情 设备详情 */
  public async getDeviceInstanceDetail(payload: { deviceId: string }): Promise<DeviceInstanceDetail> {
    const url = `${baseURL}/device-center/device/${payload.deviceId}`;
    const resp = await this.gateway.get<LegacyServiceError<DeviceInstanceDetail>>({ url, payload });
    return resp.data || resp;
  }

  /** 历史记录 */
  public async getHistory(payload: { deviceId: string; propCodes: string; startTs: number; endTs: number }): Promise<unknown> {
    const url = `${baseURL}/iot/north/device/prop/history-group`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  /** 设备台账-更新 */
  public async updateDeviceInstance(payload: {
    deviceId: string;
    areaIds: string | string[];
    picture?: string | number | null | undefined;
    departmentId?: string | undefined;
    managerIds?: string[] | number[] | undefined;
    lntAndLat?: string | undefined;
    unitPrice?: number | undefined;
    purchaseDate?: string | undefined;
    productionDate?: string | undefined;
    usefulLife?: number | undefined;
    spatialCoordinates?: string | undefined;
  }): Promise<void> {
    const url = `${baseURL}/device-center/device-instance/device`;
    await this.gateway.update({ url, payload });
  }

  /** 产品分类-新增 */
  public async addProductCategory(payload: { itemLabel: string; itemValue?: string; parentId: string | undefined }): Promise<unknown> {
    const url = `${baseURL}/device-center/base/prod-category`;
    return this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
  }

  /** 字典-产品品类树 */
  public async getProductCategoryPage(payload: {
    pageNumber: number;
    pageSize: number;
    itemLabel: string | undefined;
  }): Promise<PageResult<ProductCategoryTree>> {
    const url = `${baseURL}/device-center/base/prod-category/page`;
    const resp = await this.gateway.get<LegacyServiceError<PageResult<ProductCategoryTree>>>({ url, payload });
    return resp.data || resp;
  }

  /** 字典-产品品牌分页 */
  public async getProductBrandPage(payload: {
    /** 字典类型 */
    dictId?: string;
    /** 过滤字典项名 */
    itemLabel?: string | undefined;
    pageNumber: number;
    pageSize: number;
  }): Promise<PageResult<UniversalDictionary>> {
    const url = `${baseURL}/device-center/base/prod-brand/page`;
    const resp = await this.gateway.get<LegacyServiceError<PageResult<UniversalDictionary>>>({ url, payload });
    return resp.data || resp;
  }

  /** 产品品牌-更新 */
  public async updateProductBrand(
    prodId: string,
    payload: {
      itemLabel: string;
      itemKey?: string | undefined;
      picUrl?: string | undefined;
      itemValue?: string | undefined;
    },
  ): Promise<void> {
    const url = `${baseURL}/device-center/base/prod-brand/${prodId}`;
    await this.gateway.update({ url, payload });
  }

  /** 产品品牌-新增 */
  public async addProductBrand(payload: {
    itemLabel: string;
    picUrl?: string | undefined;
    itemValue?: string | undefined;
  }): Promise<unknown> {
    const url = `${baseURL}/device-center/base/prod-brand`;
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  /** 产品品类-删除 */
  public async delProductBrand(prodId: string): Promise<void> {
    const url = `${baseURL}/device-center/base/prod-brand/${prodId}`;
    await this.gateway.delete({ url });
  }

  /** 字典-消息协议支持接口 */
  public async getProtocolList(): Promise<{ dictId: string; id: string; itemLabel: string; itemValue: string }[]> {
    const url = `${baseURL}/device-center/acc/protocol/list`;
    const resp = await this.gateway.get<LegacyServiceError<{ dictId: string; id: string; itemLabel: string; itemValue: string }[]>>({
      url,
    });
    return resp.data || resp;
  }

  /** 字典-接入方式 */
  public async getAccModel(prodNodeType: number): Promise<UniversalDictionary[]> {
    const url = `${baseURL}/device-center/things/product/${prodNodeType}/acc-model`;
    const resp = await this.gateway.get<LegacyServiceError<UniversalDictionary[]>>({ url });
    return resp.data || resp;
  }

  /** 产品列表-获取全部产品 */
  public async getProductListAll(tenant?: string): Promise<ProductState[]> {
    const url = `${baseURL}/device-center/things/product/list/all`;
    const headers = tenant ? { headers: { tenant } } : {};
    const resp = await this.gateway.custom<LegacyServiceError<ProductState[]>>({
      url,
      method: "GET",
      ...headers,
    });
    return resp.data || resp;
  }

  /** 设备台账-删除 */
  public async delDeviceInstance(payload: { ids: string[] }): Promise<void> {
    const url = `${baseURL}/device-center/device-instance/device/delete`;
    await this.gateway.custom<LegacyServiceError<unknown>>({ method: "POST", url, payload });
  }

  /** 设备台账-查询关联监控 */
  public async getDeviceBind(deviceId: string): Promise<{ deviceId: string; refDeviceIds: string[] }> {
    const url = `${baseURL}/device-center/device-ref/detail/${deviceId}`;
    const resp = await this.gateway.get<LegacyServiceError<{ deviceId: string; refDeviceIds: string[] }>>({ url });
    return resp.data || resp;
  }

  /** 设备台账-修改关联监控 */
  public async updateDeviceBind(
    deviceId: string,
    payload: {
      refDeviceIds?: string[] | undefined;
    },
  ): Promise<unknown> {
    const url = `${baseURL}/device-center/device-ref/ref/${deviceId}`;
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  /** 设施场景配置查询 */
  public async deviceSceneConfig(id: string): Promise<DeviceSceneConfig[]> {
    const url = `${baseURL}/device-center/device-scene-configs/business/${id}`;
    const resp = await this.gateway.get<LegacyServiceError<DeviceSceneConfig[]>>({ url });
    return resp.data || resp;
  }

  /** 设施场景配置 */
  public async submitBusinessSceneConfig(payload: { businessType: BusinessType; businessId: string }): Promise<unknown> {
    const url = `${baseURL}/device-center/device-scene-config`;
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  /** 设备列表-新增 */
  public async addDevice(payload: {
    productId: string;
    parentDeviceId: string | null;
    deviceNumber: string;
    deviceName: string;
    deviceType: number;
    remark?: string;
    nodeType: number | undefined;
    nodeTypeName: string | undefined;
  }): Promise<unknown> {
    const url = `${baseURL}/device-center/device/mgt`;
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  /** 设备批量导入 */
  public async importBatchDevice(payload: {
    productId: string;
    parentDeviceId?: string | null;
    isSubDevice: number;
    excel: Blob | null;
  }): Promise<unknown> {
    const url = `${baseURL}/device-center/device/mgt/batch/import-excel-batch-new`;
    const form = new FormData();
    form.append("excel", payload.excel);
    if (payload.parentDeviceId) {
      form.append("parentDeviceId", payload.parentDeviceId);
    }
    form.append("isSubDevice", payload.isSubDevice);
    form.append("productId", payload.productId);
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      url,
      payload: form,
      method: "POST",
    });
    return resp.data || resp;
  }

  /** 设备导出模版 */
  public async exportDeviceTemplate(): Promise<Blob> {
    const url = `${baseURL}/device-center/device/mgt/batch/export-excel-template`;
    const resp = await this.gateway.customBlob({
      url,
      method: "GET",
    });
    return resp;
  }

  /** 设备台账导入 */
  public async importBatchDeviceInstance(payload: { file: Blob | null }): Promise<unknown> {
    const url = `${baseURL}/device-center/mgt/batch/import-form-template`;
    const form = new FormData();
    form.append("file", payload.file);
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      url,
      payload: form,
      method: "POST",
    });
    return resp.data || resp;
  }

  /** 设备台账导出模版 */
  public async exportDeviceInstanceTemplate(payload: { productId: string }): Promise<Blob> {
    const url = `${baseURL}/device-center/mgt/batch/export-template`;
    return this.gateway.customBlob({ method: "GET", url, payload });
  }

  /** 设备-实时属性最新值 **/
  public async getDevicePropRelVal(payload: { deviceId: string }): Promise<{ propValList: unknown[] }> {
    const url = `${baseURL}/device-center/device/mgt/devRelVal/${payload.deviceId}`;
    const resp = await this.gateway.get<LegacyServiceError<{ propValList: unknown[] }>>({ url, payload });
    return resp.data || resp;
  }

  /** 设备-历史属性 **/
  public async getDeviceHistoryProp(payload: {
    deviceId: string;
    prodCategoryId?: string;
    propCodes?: string[];
    pageNumber: number;
    pageSize: number;
  }): Promise<{ records: unknown[]; total: number }> {
    const url = `${baseURL}/device-center/device/mgt/history/page/prop`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: unknown[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  /** 设备-历史事件 **/
  public async getDeviceHistoryEvent(payload: {
    deviceId: string;
    prodCategoryId?: string;
    propCodes?: string[];
    eventCodes?: string[];
    pageNumber: number;
    pageSize: number;
  }): Promise<{ records: unknown[]; total: number }> {
    const url = `${baseURL}/device-center/device/mgt/history/page/event`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: unknown[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  /** 设备-命令下发记录 */
  public async getDeviceCommandHistoryPage(payload: {
    pageNumber: number;
    pageSize: number;
    deviceId?: number | undefined;
    deviceNameOrNumber?: string | undefined;
    targetIdentifier?: string | undefined;
    downCmd?: string | undefined;
    singleCmdStatus?: string | undefined;
    startTime?: string | undefined;
    endTime?: string | undefined;
  }): Promise<
    PageResult<{
      instanceId?: string;
      cmdSeq?: string;
      downCmd?: string;
      translatedCmdContent?: string;
      singleCmdStatus?: string;
      deviceId?: number;
      startTime?: string;
      endTime?: string;
    }>
  > {
    const url = `${baseURL}/device-center/device/mgt/command-history/page`;
    const resp = await this.gateway.custom<
      LegacyServiceError<
        PageResult<{
          instanceId?: string;
          cmdSeq?: string;
          downCmd?: string;
          translatedCmdContent?: string;
          singleCmdStatus?: string;
          deviceId?: number;
          startTime?: string;
          endTime?: string;
        }>
      >
    >({
      url,
      payload,
      method: "POST",
    });
    return resp.data || resp;
  }

  /** 设备-命令下发记录日志详情 */
  public async getDeviceCommandHistoryLogs(payload: { instanceId: string }): Promise<{ createTime?: string; logContent?: string }[]> {
    const url = `${baseURL}/device-center/device/mgt/command-history/${payload.instanceId}/logs`;
    const resp = await this.gateway.get<LegacyServiceError<{ createTime?: string; logContent?: string }[]>>({ url });
    return resp.data || resp;
  }

  /** 数据类型支持接口 */
  public async getIotDataType(): Promise<unknown[]> {
    const url = `${baseURL}/device-center/base/common-dict/iotDataType`;
    const resp = await this.gateway.get<LegacyServiceError<unknown[]>>({ url });
    return resp.data || resp;
  }

  /** 属性单位支持接口 */
  public async getPropUnit(): Promise<unknown[]> {
    const url = `${baseURL}/device-center/base/common-dict/prop-unit`;
    const resp = await this.gateway.get<LegacyServiceError<unknown[]>>({ url });
    return resp.data || resp;
  }

  /** 产品-属性 按产品查询所有 */
  public async getProductPropList(payload: { prodId: string | number }): Promise<ProductProp[]> {
    const url = `${baseURL}/device-center/things/product-prop/list`;
    const resp = await this.gateway.get<LegacyServiceError<ProductProp[]>>({ url, payload });
    return resp.data || resp;
  }

  /** 产品-属性 详情 */
  public async getProductPropDetail(prodId: string): Promise<unknown> {
    const url = `${baseURL}/device-center/things/product-prop/${prodId}`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url });
    return resp.data || resp;
  }

  /** 产品-属性 新增 */
  public async addProductProp(payload: Record<string, unknown | undefined>): Promise<unknown> {
    const url = `${baseURL}/device-center/things/product-prop`;
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }
  /** 产品-方法 新增 */
  public async addProductMethod(payload: Record<string, unknown | undefined>): Promise<unknown> {
    const url = `${baseURL}/device-center/things/product-method/batch`;
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }
  /** 产品-方法 详情 */
  public async getProductMethod(prodId: string): Promise<unknown> {
    const url = `${baseURL}/device-center/things/product-method/list?prodId=${prodId}`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url });
    return resp.data || resp;
  }

  /** 产品-方法 下发（invoke） */
  public async invokeProductMethod(payload: {
    commandSeq?: string | number;
    deviceId: string | number;
    methodCode: string;
    inputParams: Record<string, unknown>;
  }): Promise<unknown> {
    // 后端接口：/north/product-method/invoke（此处与其它 north 接口保持 /iot/north 前缀一致）
    const url = `${baseURL}/iot/north/product-method/invoke`;
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      url,
      payload,
      method: "POST",
    });
    return resp.data || resp;
  }

  /**
   * 设备-命令下发-属性设值（北向）
   * Apifox: POST /north/device/command/issue，请求体 components/schemas/CommandRequest
   */
  public async issueDeviceCommand(payload: {
    commandSeq?: string | null;
    deviceId?: string | null;
    propCode?: string | null;
    propValue?: string | null;
  }): Promise<unknown> {
    const url = `${baseURL}/iot/north/device/command/issue`;
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      url,
      payload,
      method: "POST",
    });
    return resp.data || resp;
  }

  /** 产品-属性 更新 */
  public async updateProductProp(payload: {
    id: string | number;
    propId?: string | number | undefined;
    name?: string | number | undefined;
    propCode?: string | number | undefined;
    dataType?: string | number | undefined;
    unitId?: string | number | undefined;
    dataWrite?: string | number | undefined;
    precision?: string | number | undefined;
    remark?: string | number | undefined;
    dataConfig?: string | undefined;
  }): Promise<void> {
    const url = `${baseURL}/device-center/things/product-prop/${payload.id}`;
    await this.gateway.update({ url, payload });
  }

  /** 设备列表-删除 */
  public async delProductProp(id: string): Promise<void> {
    const url = `${baseURL}/device-center/things/product-prop/${id}`;
    await this.gateway.delete({ url });
  }

  /** 属性比较符支持接口 */
  public async getCompareType(): Promise<CompareType[]> {
    const url = `${baseURL}/device-center/base/common-dict/compare-type`;
    const resp = await this.gateway.get<LegacyServiceError<CompareType[]>>({ url });
    return resp.data || resp;
  }

  /** 事件类型支持接口 */
  public async getEventType(): Promise<unknown> {
    const url = `${baseURL}/device-center/base/common-dict/event-type`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url });
    return resp.data || resp;
  }

  /** 事件类型支持接口 */
  public async getProductEventList(payload: { prodId: string }): Promise<unknown[]> {
    const url = `${baseURL}/device-center/things/product-event/list`;
    const resp = await this.gateway.get<LegacyServiceError<unknown[]>>({ url, payload });
    return resp.data || resp;
  }

  /** 事件类型支持接口 */
  public async getProductEventDetail(eventId: string): Promise<ProductEventDetailModel> {
    const url = `${baseURL}/device-center/things/product-event/${eventId}`;
    const resp = await this.gateway.get<ProductEventDetailModel>({ url });
    return resp;
  }

  /** 产品-事件 删除 */
  public async delProductEvent(id: string): Promise<void> {
    const url = `${baseURL}/device-center/things/product-event/${id}`;
    await this.gateway.delete({ url });
  }

  /** 产品-事件 新增 */
  public async addProductEvent(payload: {
    propId?: string | number | undefined;
    name?: string | number | undefined;
    eventCode?: string | number | undefined;
    categoryId?: string | number | undefined;
    status?: string | number | undefined;
    remark?: string | number | undefined;
    eventConfig?: { triggerType: string | undefined; eventRelatedProp: never[]; rules: unknown };
  }): Promise<unknown> {
    const url = `${baseURL}/device-center/things/product-event`;
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  /** 产品-事件 更新 */
  public async updateProductEvent(payload: {
    id: string | number;
    propId?: string | number | undefined;
    name?: string | number | undefined;
    eventCode?: string | number | undefined;
    categoryId?: string | number | undefined;
    status?: string | number | undefined;
    remark?: string | number | undefined;
    eventConfig?: { triggerType: string | undefined; eventRelatedProp: never[]; rules: unknown };
  }): Promise<void> {
    const url = `${baseURL}/device-center/things/product-event/${payload.id}`;
    await this.gateway.update({ url, payload });
  }

  /** 设备日志 */
  public async getDeviceLogPage(payload: {
    period?: string;
    deviceInstanceId?: string;
    keyword?: string;
    genreId?: string;
    executeResult?: string | undefined;
    pageNumber: number;
    pageSize: number;
  }): Promise<PageResult<UniversalDictionary>> {
    const url = `${baseURL}/device-center/device/instance/attribute/change/log/page`;
    const resp = await this.gateway.get<LegacyServiceError<PageResult<UniversalDictionary>>>({ url, payload });
    return resp.data || resp;
  }

  /** （手术室）设备监管日志 */
  public async getDeviceLogByTenantPage(payload: {
    period?: string | undefined;
    deviceInstanceId?: string;
    keyword?: string;
    genreId?: string;
    executeResult?: string | undefined;
    tenant?: string | undefined;
    deviceProdCategoryCodeConcat?: string | undefined;
    pageNumber: number;
    pageSize: number;
  }): Promise<PageResult<UniversalDictionary>> {
    const url = `${baseURL}/device-center/device/instance/attribute/change/logByTenant/page`;
    const headers = payload.tenant ? { headers: { tenant: payload.tenant } } : {};
    const resp = await this.gateway.custom<LegacyServiceError<PageResult<UniversalDictionary>>>({
      url,
      query: payload,
      method: "GET",
      ...headers,
    });
    return resp.data || resp;
  }

  /**
   * 设备数量统计-支持标签过滤
   * @param tagCode 1,2,3 不传参数将会全部统计
   * @returns
   */
  public async getDeviceStatusCountByTagCode(tagCode?: number): Promise<unknown> {
    const url = `${baseURL}/device-center/device/tagCode/status/count`;
    const payload = { tagCodes: tagCode };
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  /**
   * 获取设备关联的监控设备列表
   * @param deviceId 设备id
   * @returns
   */
  public async getDeviceAssociatedVideos(deviceId?: number): Promise<unknown> {
    const url = `${baseURL}/device-center/device/associated/videos`;
    const payload = { deviceId };
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  /** 通过标签查设备占比 */
  public async deviceTagPercentage(payload: string[]): Promise<DeviceTagPercentage[]> {
    const url = `${baseURL}/device-center/device/tag/percentage/inner-tag`;
    const resp = await this.gateway.custom<LegacyServiceError<DeviceTagPercentage[]>>({
      url,
      payload,
      method: "POST",
    } as unknown as CubeCustomRequestOptions);
    return resp.data || resp;
  }

  /** 设备状态数量统计-支持标签过滤 */
  public async deviceTagStatusCount(payload: { tagCodes: string[] }): Promise<DeviceTagStatusCount> {
    const url = `${baseURL}/device-center/device/tagCode/status/count`;
    const resp = await this.gateway.get<LegacyServiceError<DeviceTagStatusCount>>({ url, payload });
    return resp.data || resp;
  }

  /** 设备状态数量统计 */
  public async deviceStatusEquipmentStatistics(payload?: unknown): Promise<DeviceTagStatusCount> {
    const url = `${baseURL}/device-center/device/status/count`;
    const resp = await this.gateway.custom<LegacyServiceError<DeviceTagStatusCount>>({
      url,
      payload,
      method: "POST",
    } as unknown as CubeCustomRequestOptions);
    return resp.data || resp;
  }

  /** 设备-历史-属性分页 */
  public async getDevicePropHistoryPage(payload: {
    deviceId?: string;
    /**
     * UTC+8 Millis
     */
    endTs?: number;
    /**
     * 最大返回行数
     */
    maxRecords?: number;
    /**
     * 排序
     */
    order?: string;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页条数
     */
    pageSize?: number;
    /**
     * 按照逗号(,)分割
     */
    propCodes?: string;
    /**
     * UTC+8 Millis
     */
    startTs?: number;
  }): Promise<{ records: unknown[]; total: number }> {
    const url = `${baseURL}/iot/north/device/prop/history/page`;
    const resp = await this.gateway.get<LegacyServiceError<{ records: unknown[]; total: number }>>({ url, payload });
    return resp.data || resp;
  }

  /** 设备-历史-属性分组 */
  public async getDevicePropHistoryGroup(payload: {
    deviceId: string;
    propCodes: string;
    startTs: number;
    endTs: number;
  }): Promise<HistoryGroup[]> {
    const url = `${baseURL}/iot/north/device/prop/history-group`;
    const resp = await this.gateway.get<LegacyServiceError<HistoryGroup[]>>({ url, payload });
    return resp.data || resp;
  }

  /** 产品-详情-批量 */
  public async getProdListDetail(payload: { prodIds: string[] }): Promise<NorthProdListDetail[]> {
    const url = `${baseURL}/iot/north/product/prod-list-detail`;
    const resp = await this.gateway.get<LegacyServiceError<NorthProdListDetail[]>>({ url, payload });
    return resp.data || resp;
  }

  /** 设备属性控制-设配属性控制 */
  public async controlWithPermission(payload: {
    deviceId: string;
    commandSeqOptional?: number;
    propWriteValues: {
      originalValue?: string;
      expectedValue: string;
      code: string;
    }[];
  }): Promise<unknown> {
    const url = `${baseURL}/device-center/device/prop/value/write`;
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  /** 标签-设备标签查询 */
  public async getDeviceTagCode(payload: string[]): Promise<CubeCustomRequestOptions> {
    const url = `${baseURL}/device-center/device/tagCode`;
    const resp = await this.gateway.custom<LegacyServiceError<CubeCustomRequestOptions>>({
      url,
      payload,
      method: "POST",
    } as unknown as CubeCustomRequestOptions);
    return resp.data || resp;
  }

  /** 区域为空设备总数统计 */
  public async areaEmptyDeviceTotal(payload: { keyword?: string; tagCodes?: string[] }): Promise<{ totalNum: number }> {
    const url = `${baseURL}/device-center/device/area-empty/device-total`;
    const resp = await this.gateway.create<LegacyServiceError<{ totalNum: number }>>({ url, payload });
    return resp.data || resp;
  }

  /** 设备场景配置新增 */
  public async addDeviceSceneConfig(payload: {
    keyword?: string | undefined;
    deviceBindWay?: string;
    categoryCode?: string[] | undefined;
    businessIds: string[];
    deviceProdCategoryCodeConcat?: string;
    sceneType: string;
  }): Promise<number> {
    const url = `${baseURL}/device-center/device-scene-config`;
    const resp = await this.gateway.create<number>({ url, payload });
    return resp;
  }

  /** 设施场景配置删除 */
  public async delDeviceConfig(sceneType: string, payload: { businessIds: string[] }): Promise<unknown> {
    const url = `${baseURL}/device-center/device-scene-config/${sceneType}/delete/devices`;
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }

  public async getDeviceCondition(params: {
    prodIds: string | null;
    withPropertySpec: boolean;
  }): Promise<{ data: DeviceProductPropVoList[] }> {
    const url = "/api/iot/north/product/prod-list-detail";
    return this.gateway.get({
      payload: {
        ...params,
      },
      url,
    });
  }

  /** 接入层设备-分页 */
  public async getDeviceMgtPage(payload: {
    devNameLike?: string;
    devNumLike?: string;
    endTime?: string;
    maxRecords?: number;
    pageNumber: number;
    pageSize: number;
    parentDevNum?: string;
    startTime?: string;
    onlyParent?: boolean;
  }): Promise<{ records: DeviceMgtSchemaTipsVO[]; total: number }> {
    const url = `${baseURL}/device-center/device/mgt/schema-tips/page`;
    const resp = await this.gateway.custom<LegacyServiceError<{ records: DeviceMgtSchemaTipsVO[]; total: number }>>({
      method: "POST",
      url,
      payload,
    });
    return resp.data || resp;
  }

  /** 批量同步接入层设备 */
  public async importBatchDeviceMgt(payload: {
    deviceType?: string | number;
    parentDeviceId?: string | number;
    productId?: string | number;
    isSubDevice?: string | number;
    synDevices: {
      deviceName?: string;
      deviceNumber?: string;
    }[];
  }): Promise<unknown> {
    const url = `${baseURL}/device-center/device/mgt/batch/cache-syn`;
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({ method: "POST", url, payload });
    return resp.data || resp;
  }

  /** 获取tag关联设备的所有标签 */
  public async getRefTagList(payload: { tagCode: string; prefix: string }): Promise<TagType[]> {
    const url = `${baseURL}/device-center/${payload.tagCode}/refTag/list`;
    const resp = await this.gateway.get<LegacyServiceError<TagType[]>>({ url, payload });
    return resp.data || resp;
  }

  /** 获取tag关联设备的所有标签 */
  public async getRefDeviceTagList(payload: { tagCode: string; prefixCodes?: string[] }): Promise<TagType[]> {
    const url = `${baseURL}/device-center/${payload.tagCode}/refTags`;
    const resp = await this.gateway.get<LegacyServiceError<TagType[]>>({ url, payload });
    return resp.data || resp;
  }

  public async saveTagRule(payload: {
    // builtin.app::应用code
    code: string;
    // 应用名称
    name: string;
    rules: EquipmentAssociationRuleField[][];
  }): Promise<void> {
    const url = `${baseURL}/device-center/tag/rule`;
    const rule = {
      rules: payload.rules.map((rule) => ({
        ruleFields: rule,
      })),
    };
    await this.gateway.create<void>({
      url,
      payload: {
        code: payload.code,
        name: payload.name,
        rule: JSON.stringify(rule),
      },
    });
  }

  // 获取设备关联规则
  public async getTagRule(
    code: string,
  ): Promise<{ id: string; tagCode: string; rule: { rules: { ruleFields: EquipmentAssociationRuleField[] }[] } }> {
    const url = `${baseURL}/device-center/tag/rule/${code}`;
    const resp = await this.gateway.get<{ id: string; tagCode: string; rule: string }>({ url });
    const res = {
      id: resp.id,
      tagCode: resp.tagCode,
      rule: resp?.rule ? JSON.parse(resp.rule) : { rules: [] },
    };
    return res;
  }

  //
  public async getEquipmentAssociationPage(payload: {
    pageNumber: number;
    pageSize: number;
    rules: EquipmentAssociationRuleField[][];
  }): Promise<{ records: DeviceInstancePage[]; total: number; pages: number }> {
    const url = `${baseURL}/device-center/device/instance/rule-condition/page`;
    const ruleGroup = {
      rules: payload.rules.map((rule) => ({
        ruleFields: rule,
      })),
    };
    const resp = await this.gateway.custom<LegacyServiceError<{ records: DeviceInstancePage[]; total: number; pages: number }>>({
      method: "POST",
      url,
      payload: {
        pageNumber: payload.pageNumber,
        pageSize: payload.pageSize,
        ruleGroup,
      },
    });
    return resp.data || resp;
  }

  // 标签下的设备分组分页列表
  public async deviceGroupPage(payload: {
    pageSize: number;
    pageNumber: number;
    keyword?: string;
  }): Promise<{ records: DeviceGroupPage[]; total: number; pages: number }> {
    const url = `${baseURL}/device-center/tags/device-groups`;
    const resp = await this.gateway.get<{ records: DeviceGroupPage[]; total: number; pages: number }>({ url, payload });
    return resp;
  }
  // 标签下设备分组的设备分页列表
  public async deviceGroupDevices(payload: {
    pageSize: number;
    pageNumber: number;
    id: string;
  }): Promise<{ records: DeviceGroupDevices[]; total: number; pages: number }> {
    const url = `${baseURL}/device-center/tags/device-group/devices`;
    const resp = await this.gateway.get<{ records: DeviceGroupDevices[]; total: number; pages: number }>({ url, payload });
    return resp;
  }
  // 标签下设备分组的设备分页列表
  public async deviceGroupDevicesAll(tagCode: string): Promise<DeviceGroup[]> {
    const url = `${baseURL}/device-center/tags/${tagCode}/device-group-all`;
    const resp = await this.gateway.get<DeviceGroup[]>({ url });
    return resp;
  }

  /** 标签下设备分组新增 */
  public async addDeviceGroup(payload: {
    code: string;
    name: string;
    deviceGroup: {
      name: string;
      remark: string;
    };
  }): Promise<unknown> {
    const url = `${baseURL}/device-center/tags/device-groups`;
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
    return resp.data || resp;
  }
  /** 设备分组关联设备 */
  public async deviceGroupsRefDevice(payload: {
    id: string;
    deviceFilterParam: {
      keywordLike?: string;
      productId?: string;
      categoryCode?: string;
      anyMatchedAreaId?: string;
      matchedDeviceIds?: string[];
    };
  }): Promise<void> {
    const url = `${baseURL}/device-center/device-groups/ref-devices`;
    await this.gateway.create<LegacyServiceError<unknown>>({ url, payload });
  }
  // 修改设备分组
  public async updateDeviceGroup(
    id: string,
    payload: {
      name: string;
      remark: string;
    },
  ): Promise<void> {
    const url = `${baseURL}/device-center/device-groups/${id}`;
    return this.gateway.update({ url, payload });
  }
  /** 设备分组删除 */
  public async deleteDeviceGroup(id: string): Promise<void> {
    const url = `${baseURL}/device-center/device-groups/${id}`;
    await this.gateway.delete({ url });
  }
  /** 设备分组批量删除 */
  public async deleteDeviceGroupBatch(payload: string[]): Promise<void> {
    const url = `${baseURL}/device-center/device-groups/batch-delete`;
    await this.gateway.custom({ method: "POST", url, payload });
  }
  /** 设备分组下关联设备批量删除 */
  public async deleteDeviceByDeviceGroup(id: string, payload: string[]): Promise<void> {
    const url = `${baseURL}/device-center/device-groups/${id}/devices/batch-delete`;
    await this.gateway.custom({ method: "POST", url, payload });
  }

  /** 更新设备空间坐标信息 */
  public async updateDeviceSpatialCoordinates(payload: { code: string; spatialCoordinates: string }): Promise<void> {
    const url = `${baseURL}/device-center/device-instance/device/spatial-coordinates`;
    await this.gateway.update<LegacyServiceError<void>>({ url, payload });
  }

  /** 设备实例-缺失经纬度时更新经纬度 */
  public async updateDeviceLntAndLatIfAbsent(payload: { deviceId: string; lntAndLat: string; locationDes: string }): Promise<void> {
    const url = `${baseURL}/device-center/device/instance/lnt-and-lat`;
    await this.gateway.update<LegacyServiceError<void>>({ url, payload });
  }

  /** North 侧产品分页（`/device-center/north/product/page`） */
  public async getProductListAsNorth(payload: {
    pageNumber: number;
    pageSize: number;
    productId?: string;
  }): Promise<PageResult<NorthProdListDetail>> {
    const url = `${baseURL}/device-center/north/product/page`;
    const resp = await this.gateway.get<LegacyServiceError<PageResult<NorthProdListDetail>>>({
      url,
      payload,
    });
    return resp.data || resp;
  }
}
