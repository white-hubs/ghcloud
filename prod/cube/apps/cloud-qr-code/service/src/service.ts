import { PageResult, QrCodeTypeEntity, QrCodeEntity, CreateQrCodeCommand, UpdateQrCodeCommand } from "./types";
import { type CubeAuth, CubeGateway } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

const baseURL = `${BASE_API}/cloudQrCode`;

export class CubeCloudQrCodeService {
  private readonly gateway: CubeGateway;
  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  /** 二维码类型列表分页 */
  public async getQrCodeTypes(payload?: {
    keyword?: string;
    pageNumber?: number;
    pageSize?: number;
    grantClientCode?: string;
  }): Promise<PageResult<QrCodeTypeEntity>> {
    const url = `${baseURL}/cloud-qr-code-type/page`;
    const resp = await this.gateway.get<PageResult<QrCodeTypeEntity>>({ url, payload });
    return resp;
  }

  /** 新增二维码类型 */
  public async createQrCodeType(payload: { code: string; name: string; remark?: string; grantClientCode: string }): Promise<string> {
    const url = `${baseURL}/cloud-qr-code-type`;
    const resp = await this.gateway.create<string>({ url, payload });
    return resp;
  }

  /** 编辑二维码类型 */
  public async updateQrCodeType(payload: {
    id: string | number;
    code: string;
    name: string;
    remark?: string;
    grantClientCode: string;
  }): Promise<boolean> {
    const url = `${baseURL}/cloud-qr-code-type/${payload.id}`;
    const resp = await this.gateway.update<boolean>({ url, payload });
    return resp;
  }

  /** 删除二维码类型 */
  public async deleteQrCodeType(id: string | number): Promise<void> {
    const url = `${baseURL}/cloud-qr-code-type/${id}`;
    const resp = await this.gateway.delete({ url });
    return resp;
  }

  /** 获取二维码类型详情 */
  public async getQrCodeTypeDetail(id: string | number): Promise<QrCodeTypeEntity> {
    const url = `${baseURL}/cloud-qr-code-type/${id}`;
    const resp = await this.gateway.get<QrCodeTypeEntity>({ url });
    return resp;
  }

  /** 二维码列表分页 */
  public async getQrCodes(payload?: {
    keyword?: string;
    pageNumber?: number;
    pageSize?: number;
    grantClientCode?: string;
    enabled?: boolean;
  }): Promise<PageResult<QrCodeEntity>> {
    const url = `${baseURL}/cloud-qr-code/page`;
    const resp = await this.gateway.get<PageResult<QrCodeEntity>>({ url, payload });
    return resp;
  }

  /** 获取二维码详情 */
  public async getQrCodeDetail(id: string | number): Promise<QrCodeEntity> {
    const url = `${baseURL}/cloud-qr-code/${id}`;
    const resp = await this.gateway.get<QrCodeEntity>({ url });
    return resp;
  }

  /** 新增二维码 */
  public async createQrCode(payload: CreateQrCodeCommand): Promise<string> {
    const url = `${baseURL}/cloud-qr-code`;
    const resp = await this.gateway.create<string>({ url, payload });
    return resp;
  }

  /** 编辑二维码 */
  public async updateQrCode(payload: UpdateQrCodeCommand): Promise<string> {
    const url = `${baseURL}/cloud-qr-code/${payload.id}`;
    const resp = await this.gateway.update<string>({ url, payload });
    return resp;
  }

  /** 删除二维码 */
  public async deleteQrCode(id: string | number): Promise<void> {
    const url = `${baseURL}/cloud-qr-code/${id}`;
    const resp = await this.gateway.delete({ url });
    return resp;
  }

  /** 预览二维码 */
  public async previewQrCode(id: string | number): Promise<string> {
    const url = `${baseURL}/cloud-qr-code/preview/${id}`;
    const resp = await this.gateway.create<string>({ url });
    return resp;
  }

  /** 启用/禁用二维码 */
  public async enableQrCode(id: string | number, enabled: boolean): Promise<void> {
    const url = `${baseURL}/cloud-qr-code/enabled/${id}/${enabled}`;
    const resp = await this.gateway.update<void>({ url });
    return resp;
  }

  /** 项目列表分页 */
  public async getProjects(payload?: {
    keyword?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PageResult<import("./project-types").ProjectEntity>> {
    const url = `${baseURL}/cloud-qr-code-projects/page`;
    const resp = await this.gateway.get<PageResult<import("./project-types").ProjectEntity>>({ url, payload });
    return resp;
  }

  /** 获取项目详情 */
  public async getProjectDetail(id: string): Promise<import("./project-types").ProjectEntity> {
    const url = `${baseURL}/cloud-qr-code-projects/${id}`;
    const resp = await this.gateway.get<import("./project-types").ProjectEntity>({ url });
    return resp;
  }

  /** 新增项目 */
  public async createProject(payload: import("./project-types").CreateProjectCommand): Promise<string> {
    const url = `${baseURL}/cloud-qr-code-projects`;
    const resp = await this.gateway.create<string>({ url, payload: payload as unknown as Record<string, unknown> });
    return resp;
  }

  /** 编辑项目 */
  public async updateProject(payload: import("./project-types").UpdateProjectCommand): Promise<void> {
    const url = `${baseURL}/cloud-qr-code-projects/${payload.id}`;
    const resp = await this.gateway.update<void>({ url, payload: payload as unknown as Record<string, unknown> });
    return resp;
  }

  /** 删除项目 */
  public async deleteProject(id: string): Promise<void> {
    const url = `${baseURL}/cloud-qr-code-projects/${id}`;
    const resp = await this.gateway.delete({ url });
    return resp;
  }
}
