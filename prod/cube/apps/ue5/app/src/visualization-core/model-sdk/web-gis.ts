import { CubeMapLeaflet } from "@ghcloud/cube-map-plugins";
import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";
import type { CubeWeb3DEvents, ViewAngleParameter } from "@ghcloud/cube-visual-sdk/src/web-3d/web-3d";

import { ModelSDK } from "./model-sdk";

export class WebGisSDK extends ModelSDK {
  private map: CubeMapLeaflet;
  private leafletInstance: any;

  public async waitModalLoad(): Promise<void> {}

  public getMapInstance(): {
    cubeMap: CubeMapLeaflet;
    leafletInstance: any;
  } {
    return {
      cubeMap: this.map,
      leafletInstance: this.leafletInstance,
    };
  }
  /** 标签点击事件 */
  public onIconLabelClick(callback: (eventProps: CubeWeb3DEvents["icon-label-click"]) => void): void {}

  public async initModal(dom: HTMLCanvasElement, modelPath: string): Promise<void> {
    this.map = new CubeMapLeaflet(CubeMfRootGlobalState.getInstance().mfRootState.authInfo);
    await this.map.renderMap("cubeMapContainer", {});

    // This.map.initClusterLayer(
    //   {
    //     MaxClusterRadius: 60,
    //     DisableClusteringAtZoom:10,
    //     SpiderfyOnMaxZoom: true
    //   }
    // )
    try {
      // @ts-expect-error
      document.querySelector(".cube-map-base-tile").style.filter = `url('#purple-sepia')`;
      // @ts-expect-error
      document.querySelector(".cube-map-text-tile").style.filter = `url('#purple-sepia')`;
    } catch {}
    this.leafletInstance = this.map.getMapInstance();
  }

  public setTimeOfDay(): void {}

  public changeModelWeather(): void {}

  public changRoam(value: boolean): void {}

  public resetModel(): void {}

  public changeCameraView(value: ViewAngleParameter): void {}

  public changeTouchInterface(): void {
    // TODO 打开退出驾驶模式
  }

  /** 根据名称获取构件信息 */
  public async getActorByName(name: string): Promise<{ id: string }> {
    return { id: "" };
  }

  /**
   * 批量添加文字标签
   */
  public addIconTextPoiBatch(): void {}

  /** 批量添加设备标签 */
  public addIconDevicePoiBatch(): void {}

  /**
   * 删除标签
   */
  public removePoiByType(): void {}

  /** 定位视角 */
  public positioningPerspective(): void {}

  public showBuildingFloor(): void {}

  public showBuilding(): void {}

  public focusActor(): void {}

  public showActor(): void {}
  public hideActor(): void {}
  public showShell(): void {}

  public async getCameraPosition(): Promise<Record<string, unknown>> {
    return {};
  }

  public stopSequenceAll(): void {
    // Todo: 待完善
  }
  public removeAllEffect(): void {
    // Todo: 待完善
  }
}
