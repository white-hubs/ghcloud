import { type CubeAuth, CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";
import { OcrFileProvideType, OcrVehicleRes, VehicleOcrManufacture } from "./type";
import { FileState } from "@ghcloud/cube-utils";

const baseURL = `${BASE_API}`;

export class CubeOcrService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }
  /** 车牌号码识别 */
  public async ocrVehicleNumber (payload?: {
    ocrFileProvideType: OcrFileProvideType;
    vehicleOcrManufacture: VehicleOcrManufacture;
    imgBase64?: string;
    imgFile?: string;
    imgUrl?: string;
    imgFileVO?: FileState;
  }): Promise<OcrVehicleRes> {
    const url = `${baseURL}/ocr-vehicle/ocr/vehicle-number`
    const resp = await this.gateway.create<LegacyServiceError<OcrVehicleRes>>({ url, payload })
    return resp.data || resp
  }
}
