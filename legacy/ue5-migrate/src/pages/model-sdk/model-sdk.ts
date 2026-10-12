export abstract class ModelSDK {
  // 初始化模型
  public abstract initModal (...args): Promise<void>
  // 等待模型加载成功
  public abstract waitModalLoad (): Promise<void>
  // 修改模型时间
  public abstract setTimeOfDay (...args): void
  // 修改模型天气
  public abstract changeModelWeather (...args): void
  // 修改模型视角
  public abstract changeCameraView (...args): void
  // 重置模型
  public abstract resetModel (...args): void
  // 开关环游
  public abstract changRoam (...args): void
  // 开关触摸界面
  public abstract changeTouchInterface (...args): void
  // 模型聚焦（传入actorId）
  public abstract focusActor (...args): void
  // 显示模型外壳
  public abstract showShell (...args): void
  // 隐藏对象
  public abstract hideActor (...args): void
  // 显示对象
  public abstract showActor (...args): void
  // 删除标签(楼栋标签｜设备标签)
  public abstract removePoiByType (...args): void
  // 过滤显示楼层（显示目标楼层并自动隐藏比目标楼层高的所有楼层）
  public abstract showBuildingFloor (...args): void
  // 显示楼栋 恢复楼栋被隐藏的楼层
  public abstract showBuilding (...args): void
  // 获取构件信息
  public abstract getActorByName (...args): Promise<{ id: string; actorId?: string; }>
  // 定位视角
  public abstract positioningPerspective (...args): void
  // 批量文字标签 适用于楼栋标签 房间标签 区域标签
  public abstract addIconTextPoiBatch (...args): void
  // 批量设备标签
  public abstract addIconDevicePoiBatch (...args): void
  // 标签点击事件
  public abstract onIconLabelClick (...args): void
  // 获取视角参数
  public abstract getCameraPosition (): Promise<Record<string, unknown>>
  // 停止动画
  public abstract stopSequenceAll (): void
  // 移除所有特效
  public abstract removeAllEffect (): void
  // 显示停车场车辆
  public abstract updateParkingVehicles (...args): void
  // 分布热力图
  public abstract coordPointsHeatMap (...args): void
  // 清空热力图
  public abstract clearAllCoordPointsHeatMap (): void
}
