# 桥接能力

```typescript
interface ResponseData {
  Authorization: string; // "Bearer " + access_token
  tenant: string; // 租户code
  terminal: string; // 访问端code
}

// 获取开河鉴权信息能力
getRequestHeader: () => ResponseData;

/** 
 * params 关闭页面时返回给App的参数
 * 关闭当前webView页面并携带参数
 */
closePage: (params: string) => void;

/** 
 * params 返回上一个webview页面携带的参数
 * 返回上一个webview页面并携带参数
 */
backPage: (params: string) => void;

/** 
 * visible 控制原生Bar的可见性
 * 控制原生Bar的显示
 */
onVisibilityNativeAppBar: (visible: boolean) => void;

// 桥接入参
interface UploadImageParams {
  maxCount: number; // 最大数量
  watermarkTypes?: string[]; // 水印类型
  uploadMethod?: string[]; // 上传方式
  customWaterMark?: string; // 自定义水印
  sceneCode?: string; // 场景code
}

interface UploadImageResponse {
  id: string; // 文件存储id
  name: string; // 文件名称
  path: string; // 文件回显路径
  size: number; // 文件大小
  type: string; // 文件后缀
  sceneCode?: string; // 场景code
}

/** 
 * maxCount 最大上传数量
 * expandField 扩展字段
 */
uploadImage: (maxCount: string, expandField?: UploadImageParams) => UploadImageResponse[];

/** 
 * url 文件远程路径
 * 唤起手机系统内自身预览文件的能力
 */
openFile: (url: string) => void;

/** 
 * 二维码扫码
 * return 返回扫码字符结果
 */
onScanCode: () => string;

/** 
 * 设置屏幕方向
 * portrait 竖屏
 * landscape 横屏
 */
setScreenOrientation: (orientation: 'portrait' | 'landscape') => void;

interface MapConfig {
  type: 'route' | 'marker'; // route导航 marker地图标点
  address: string; // 地点文字描述
  longitude: string; // 经度
  latitude: string; // 纬度
}

/**
 * 打开app地图导航或者地图标记
 * @param config.type 'route' | 'marker' 地图类型 
 * @param config.address 地址
 * @param config.longitude 经度
 * @param config.latitude 纬度
 */
openTripartiteMap: (config: MapConfig) => void;

// 获取APP缓存的业务数据，返回给H5后清空该数据
getBusinessData: () => {
  return {};
};

// 刷新原生数据
refreshNativeData: () => void;

// 打开业务详情页
openBusinessDetailsPage: () => void;

// 扫描蓝牙设备
onScanBluetooth: () => string[] | null;

// NFC扫描
onScanNFC: () => string;
```

## 结语

通过本文档，开发者可以了解如何在移动端与内嵌H5之间实现桥接通讯，并调用原生APP的能力。希望本文档能为开发者在实现开河标准桥接协议时提供帮助。