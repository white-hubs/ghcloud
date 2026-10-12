import { TMap } from './t-map'
import { TSize } from './t-size'
import { TIcon } from './t-icon'
import { TMarker } from './t-marker'
import { TLngLat } from './t-lnglat'
import { TPixel } from './t-pixel'
import { TInfoWindow } from './infoWindow'
import { TPolyline } from './t-polyline'
import { TMouseTool } from './t-mouse-tool'
import { TCircle } from './t-circle'
import { GeometryUtil } from './t-geometry-util'
export class MapPlugin {
  static Map = TMap //地图类
  static Size = TSize //尺寸类
  static Icon = TIcon //图标类
  static Marker = TMarker //标记类
  static LngLat = TLngLat //经纬度转换类
  static Pixel = TPixel //像素类
  static InfoWindow = TInfoWindow //信息窗类
  static Polyline = TPolyline //线类
  static MouseTool = TMouseTool //鼠标工具类
  static Circle = TCircle //圆类
  static GeometryUtil = GeometryUtil //几何工具类
  constructor() {
  }
}