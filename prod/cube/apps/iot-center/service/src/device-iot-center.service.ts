import type {
  PageResult,
  ProductCategoryModel,
  ProductDetailModel,
  ProductBrandModel,
  ProductProp,
  ProductMethodDetailModel,
} from "./types";
import { type CubeAuth, CubeGateway } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

const baseURL = `${BASE_API}/product-model`;

/** 物联设备中心服务 */
export class CubeDeviceIotCenterService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  /** 协议列表 */
  public async getProtocolList(): Promise<{ id: string; itemLabel: string; itemValue: string }[]> {
    const url = `${baseURL}/v3/protocol/list`;
    const resp = await this.gateway.get<{ id: string; itemLabel: string; itemValue: string }[]>({ url });
    return resp;
  }

  /** 产品品类 分页 */
  public async getProductCategoryPage(payload: {
    pageSize: number;
    pageNumber: number;
    itemLabel?: string | undefined;
    withChildren?: boolean | undefined;
    withAssociatedItem?: boolean | undefined;
  }): Promise<PageResult<ProductCategoryModel>> {
    const url = `${baseURL}/v3/product-category/page`;
    const resp = await this.gateway.get<PageResult<ProductCategoryModel>>({ url, payload });
    return resp;
  }

  /** 产品品类 树 */
  public async getProductCategoryTree(): Promise<ProductCategoryModel[]> {
    const url = `${baseURL}/v3/product-category/tree`;
    const resp = await this.gateway.get<ProductCategoryModel[]>({ url });
    return resp;
  }

  /** 产品品类 详情 */
  public async getProductCategoryFullDetail(id: string): Promise<{ path: ProductCategoryModel; detail: ProductCategoryModel }> {
    const url = `${baseURL}/v3/product-category/${id}/full-detail`;
    const resp = await this.gateway.get<{ path: ProductCategoryModel; detail: ProductCategoryModel }>({ url });
    return resp;
  }

  /** 产品品类 新增 */
  public async addProductCategory(payload: {
    itemLabel: string;
    parentId?: string | undefined;
    status?: number | undefined;
    remark?: string | undefined;
  }): Promise<void> {
    const url = `${baseURL}/v3/product-category`;
    return await this.gateway.create<void>({ url, payload });
  }

  /** 产品品类 新增 */
  public async updateProductCategory(payload: {
    id: string;
    itemLabel: string;
    status?: number | undefined;
    remark?: string | undefined;
  }): Promise<void> {
    const url = `${baseURL}/v3/product-category/${payload.id}`;
    return await this.gateway.update<void>({ url, payload });
  }

  /** 产品品类 删除 */
  public async deleteProductCategory(id: string): Promise<void> {
    const url = `${baseURL}/v3/product-category/${id}`;
    return await this.gateway.delete({ url });
  }

  /** 产品品牌 分页 */
  public async getProductBrandPage(payload: {
    pageSize: number;
    pageNumber: number;
    itemLabel?: string | undefined;
  }): Promise<PageResult<ProductBrandModel>> {
    const url = `${baseURL}/v3/product-brand/page`;
    const resp = await this.gateway.get<PageResult<ProductBrandModel>>({ url, payload });
    return resp;
  }

  /** 产品品牌 新增 */
  public async addProductBrand(payload: { itemLabel: string; status?: number | undefined; remark?: string | undefined }): Promise<void> {
    const url = `${baseURL}/v3/product-brand`;
    return await this.gateway.create<void>({ url, payload });
  }

  /** 产品品牌 更新 */
  public async updateProductBrand(payload: {
    id: string;
    itemLabel: string;
    itemValue?: string | undefined;
    status?: number | undefined;
    remark?: string | undefined;
  }): Promise<void> {
    const url = `${baseURL}/v3/product-brand/${payload.id}`;
    return await this.gateway.update<void>({ url, payload });
  }

  /** 产品品牌 删除 */
  public async deleteProductBrand(id: string): Promise<void> {
    const url = `${baseURL}/v3/product-brand/${id}`;
    return await this.gateway.delete({ url });
  }

  /** 产品列表 分页 */
  public async getProductPage(payload: {
    pageSize: number;
    pageNumber: number;
    prodName?: string | undefined;
    prodCategoryId?: string | undefined;
    prodBrandId?: string | undefined;
    status?: number | undefined;
  }): Promise<PageResult<ProductDetailModel>> {
    const url = `${baseURL}/v3/things/product/page`;
    const resp = await this.gateway.get<PageResult<ProductDetailModel>>({ url, payload });
    return resp;
  }

  /** 产品 新增 */
  public async addProduct(payload: {
    prodName: string;
    prodCategoryId: string;
    nodeType: number;
    protocolId: string;
    prodBrandId?: string | undefined;
    prodModel?: string | undefined;
    remark?: string | undefined;
    extendConfig?: string | undefined;
    prodVersion?: string | undefined;
    prodIcon?: string | undefined;
    prodPic?: string | undefined;
    status?: number | undefined;
  }): Promise<void> {
    const url = `${baseURL}/v3/things/product`;
    return await this.gateway.create<void>({ url, payload });
  }

  /** 产品 更新 */
  public async updateProduct(
    prodId: string,
    payload: {
      prodName: string;
      prodCategoryId: string;
      nodeType: number;
      protocolId: string;
      prodBrandId?: string | undefined;
      prodModel?: string | undefined;
      remark?: string | undefined;
      extendConfig?: string | undefined;
      prodIcon?: string | undefined;
      prodPic?: string | undefined;
      status?: number | undefined;
    },
  ): Promise<void> {
    const url = `${baseURL}/v3/things/product/${prodId}`;
    return await this.gateway.update<void>({ url, payload });
  }

  /** 产品 删除 */
  public async deleteProduct(prodId: string): Promise<void> {
    const url = `${baseURL}/v3/things/product/${prodId}`;
    return await this.gateway.delete({ url });
  }

  /** 产品 详情 */
  public async getProductDetail(prodId: string): Promise<ProductDetailModel> {
    const url = `${baseURL}/v3/things/product/${prodId}`;
    const resp = await this.gateway.get<ProductDetailModel>({ url });
    return resp;
  }

  /** 产品 导出 */
  public async exportProduct(prodId: string): Promise<Blob> {
    const url = `${baseURL}/v3/things/product-model/export/${prodId}`;
    const resp = await this.gateway.customBlob({ url, method: "GET" });
    return resp;
  }

  /** 产品导入 验证 */
  public async validateProduct(payload: { importMode: string; modelJson: Blob }): Promise<unknown> {
    const url = `${baseURL}/v3/things/product-model/import/validate`;
    const form = new FormData();
    form.append("importMode", payload.importMode);
    form.append("modelJson", payload.modelJson as Blob);
    const resp = await this.gateway.custom({
      url,
      payload: form,
      method: "POST",
    });
    return resp;
  }

  /** 产品 导入 */
  public async importProduct(payload: { importMode: string; modelJson: Blob }): Promise<unknown> {
    const url = `${baseURL}/v3/things/product-model/import`;
    const form = new FormData();
    form.append("importMode", payload.importMode);
    form.append("modelJson", payload.modelJson as Blob);
    const resp = await this.gateway.custom({
      url,
      payload: form,
      method: "POST",
    });
    return resp;
  }

  /** 产品属性 列表 */
  public async getProductPropList(payload: { prodId: string | number }): Promise<ProductProp[]> {
    const url = `${baseURL}/v3/things/product-prop/list`;
    const resp = await this.gateway.get<ProductProp[]>({ url, payload });
    return resp;
  }

  /** 产品属性 详情 */
  public async getProductPropDetail(id: string): Promise<ProductProp> {
    const url = `${baseURL}/v3/things/product-prop/${id}`;
    const resp = await this.gateway.get<ProductProp>({ url });
    return resp;
  }

  /** 产品属性 新增 */
  public async addProductProp(payload: {
    prodId: string | number;
    name: string;
    propCode: string;
    dataType: string;
    precision?: number;
    unitSymbol?: string;
    dataWrite?: number;
    dataConfig?: string;
    defaultValue?: string;
    remark?: string;
  }): Promise<void> {
    const url = `${baseURL}/v3/things/product-prop`;
    return await this.gateway.create<void>({ url, payload });
  }

  /** 产品属性 更新 */
  public async updateProductProp(payload: {
    id: string | number;
    prodId: string | number;
    name: string;
    propCode: string;
    dataType: string;
    precision?: number;
    unitSymbol?: string;
    dataWrite?: number;
    dataConfig?: string;
    defaultValue?: string;
    remark?: string;
  }): Promise<void> {
    const url = `${baseURL}/v3/things/product-prop/${payload.id}`;
    return await this.gateway.update<void>({ url, payload });
  }

  /** 产品属性 删除 */
  public async deleteProductProp(id: string): Promise<void> {
    const url = `${baseURL}/v3/things/product-prop/${id}`;
    return await this.gateway.delete({ url });
  }

  /** 产品事件 列表 */
  public async getProductEventList(payload: { prodId: string | number }): Promise<unknown[]> {
    const url = `${baseURL}/v3/things/product-event/list`;
    const resp = await this.gateway.get<unknown[]>({ url, payload });
    return resp;
  }

  /** 产品事件 详情 */
  public async getProductEventDetail(id: string): Promise<unknown> {
    const url = `${baseURL}/v3/things/product-event/${id}`;
    const resp = await this.gateway.get<unknown>({ url });
    return resp;
  }

  /** 产品事件 新增 */
  public async addProductEvent(payload: Record<string, unknown>): Promise<void> {
    const url = `${baseURL}/v3/things/product-event`;
    return await this.gateway.create<void>({ url, payload });
  }

  /** 产品事件 更新 */
  public async updateProductEvent(payload: Record<string, unknown>): Promise<void> {
    const url = `${baseURL}/v3/things/product-event/${payload.id}`;
    return await this.gateway.update<void>({ url, payload });
  }

  /** 产品事件 删除 */
  public async deleteProductEvent(id: string): Promise<void> {
    const url = `${baseURL}/v3/things/product-event/${id}`;
    return await this.gateway.delete({ url });
  }

  /** 事件类型列表 */
  public async getProductEventType(): Promise<unknown> {
    const url = `${baseURL}/v3/things/product-event/categories`;
    const resp = await this.gateway.get<unknown>({ url });
    return resp;
  }

  /** 产品方法 列表 */
  public async getProductMethodList(payload: { prodId: string | number }): Promise<unknown[]> {
    const url = `${baseURL}/v3/things/product-method/list`;
    const resp = await this.gateway.get<unknown[]>({ url, payload });
    return resp;
  }

  /** 产品方法 详情 */
  public async getProductMethodDetail(id: string): Promise<ProductMethodDetailModel> {
    const url = `${baseURL}/v3/things/product-method/${id}`;
    const resp = await this.gateway.get<ProductMethodDetailModel>({ url });
    return resp;
  }

  /** 产品方法 新增 */
  public async addProductMethod(payload: Record<string, unknown>): Promise<void> {
    const url = `${baseURL}/v3/things/product-method`;
    return await this.gateway.create<void>({ url, payload });
  }

  /** 产品方法 更新 */
  public async updateProductMethod(payload: Record<string, unknown>): Promise<void> {
    const url = `${baseURL}/v3/things/product-method/${payload.id}`;
    return await this.gateway.update<void>({ url, payload });
  }

  /** 产品方法 删除 */
  public async deleteProductMethod(id: string): Promise<void> {
    const url = `${baseURL}/v3/things/product-method/${id}`;
    return await this.gateway.delete({ url });
  }
}
