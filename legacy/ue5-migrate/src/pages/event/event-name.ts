/** 事件名称定义 */
export type EventName =
'changeModelTime' |
'changeModelWeather' |
'changeModelGlobalCameraView' |
'changeModelQuality' |
'changeModelTourAroundStatus' |
'changeTouchInterface' |
'handelClickBuild' |
'switchBusinessPanel' |
"setFirstPerspective" |
"setBirdViewPerspective" |
"refreshAlarmBadge" | // 刷新告警角标
"openDeviceFloor" | // 尝试打开设备所在的楼层
"locateToDevice" | // 模型定位到设备
"createBuildIcon" | // 打楼栋区域标签
"resetModel" | // 模型重置
"backPreAreaLevel" |// 返回上一级区域
"verifyModelStatus" | // 校验模型状态
"alarmPlaneUnmounted" |// 报警面板组件卸载
"removeAllEffect" | // 移除所有粒子效果
"deviceDetailPanelBack" |// 设备详情面板点击返回
"addGisMarker"|
"addClusteredGisMarker"
