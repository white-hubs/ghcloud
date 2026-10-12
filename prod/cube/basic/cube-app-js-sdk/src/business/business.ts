import qs from "qs";

import { CubeIdentityService, type QrcodeEntity } from "@ghcloud/cube-identity-service";

import { cubeAppServiceInstance } from "../js/cube-app.service";
import { getAuthHeaders } from "../main";

/**
 * 经过业务处理的桥接层
 */
export class CubeAppBusinessBridge {
  /**
   * 获取二维码API服务
   * @returns 二维码API服务
   */
  public static getCubeIdentityService(): CubeIdentityService {
    const auth = {
      tenant: "",
      terminal: "bimops-manage-web",
      token: "",
    };
    const authHeaders = getAuthHeaders();
    auth.token = authHeaders.Authorization.slice(7);
    auth.tenant = authHeaders.tenant;
    auth.terminal = authHeaders.terminal;
    return new CubeIdentityService(auth);
  }

  /**
   * 处理原始扫码结果
   * @param scannerShowAlbum 是否展示相册入口，不传时默认为 `true`
   * @returns 处理后的扫码值
   */
  public static async handleBusinessScanCode(scannerShowAlbum?: boolean): Promise<string> {
    const result = await cubeAppServiceInstance.onScanCode(scannerShowAlbum);
    if (!result) {
      return "";
    }
    if (result.includes("http")) {
      if (result.includes("/public/qrcode-direct")) {
        // 找到 # 号的位置
        const hashWithoutPound = result.substring(result.indexOf("#")).substring(1);
        const queryStringStartIndex = hashWithoutPound.indexOf("?");
        const queryString = hashWithoutPound.substring(queryStringStartIndex);
        // 使用 URLSearchParams 解析查询参数
        const params = new URLSearchParams(queryString);
        const id = params.get("id");
        if (id && id.length > 0) {
          try {
            return CubeAppBusinessBridge.getCubeIdentityService().qrcodeOldCodeId(id);
          } catch {
            alert("获取code失败");
          }
        }
      } else if (result.includes("/apps/qrcode-transfer/transfer")) {
        const code = result.split("code=").pop();
        if (code && code.length > 0) {
          return code;
        }
      } else if (result.includes("/chengduMarket/html/customerInfo.html")) {
        return result;
      } else if (result.includes("www.dbc61.com")) {
        const url = new URL(result);
        const code = url.searchParams.get("id");
        if (code && code.length > 0) {
          return code;
        }
      }
    }
    return result;
  }

  /**
   * 业务内扫码
   * @param scannerShowAlbum 是否展示相册入口，不传时默认为 `true`
   * @returns 系统内二维码对象
   */
  public static async handleBusinessScanCodeToObject(scannerShowAlbum?: boolean): Promise<QrcodeEntity | null> {
    const code = await CubeAppBusinessBridge.handleBusinessScanCode(scannerShowAlbum);
    if (!code) {
      return null;
    }
    const scanCode = code.includes("https") ? (qs.parse(code)?.code?.toString() ?? code.toString()) : code.toString();
    try {
      return CubeAppBusinessBridge.getCubeIdentityService().getEntityByCode(encodeURIComponent(scanCode.toString()));
    } catch (error) {
      // alert('未查询到绑定对象')
      return Promise.reject(error);
    }
  }
}
