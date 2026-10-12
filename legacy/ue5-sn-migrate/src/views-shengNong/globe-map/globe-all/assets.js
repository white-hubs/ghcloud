import { Resource } from "../mini3d"
import { FileLoader } from "three"
const UE5_SN_BASE = '/resource/v1/ue5-sn-migrate/globe-map/assets'
const earthAtmos = "/resource/v1/ue5-sn/earth/earth09-3.jpg"
const earthNight = `${UE5_SN_BASE}/earth/earth-night2.jpg`
const earthClouds = `${UE5_SN_BASE}/earth/earth_clouds_1024.png`
const earthNormal = `${UE5_SN_BASE}/earth/earth_normal_2048.jpg`
const earthBump = `${UE5_SN_BASE}/earth/earth-topology.png`
const earthSpecular = `${UE5_SN_BASE}/earth/earth_specular_2048.jpg`
const highLight = `${UE5_SN_BASE}/earth/高光.jpg`
const globeHuiguang = `${UE5_SN_BASE}/earth/light.png`
const pointLight = `${UE5_SN_BASE}/earth/pointLight.png`
const lightPillar = `${UE5_SN_BASE}/texture/光柱.png`
const flyLine = `${UE5_SN_BASE}/texture/flyLine2.png`
const grid = `${UE5_SN_BASE}/texture/grid2.png`
const gridBlack = `${UE5_SN_BASE}/texture/grid2Black.png`
const pathLine = `${UE5_SN_BASE}/texture/pathLine2.png`
const flowY = `${UE5_SN_BASE}/earth/gradient.png`
const uv = `${UE5_SN_BASE}/texture/uv.png`
const chinaGlow = `${UE5_SN_BASE}/earth/china-glow4.png`
const cloud = `${UE5_SN_BASE}/earth/cloud.png`

// 地图
const topNormal = `${UE5_SN_BASE}/earth/chinaMapTexture2.jpg`
const chinaMapBg = "/resource/v1/ue5-sn/earth/chinaMapBg1.jpg"
const chinaGlowNew = `${UE5_SN_BASE}/earth/china-glow-new.png`
const topFace = `${UE5_SN_BASE}/texture/topFace.png`
const point01 = `${UE5_SN_BASE}/texture/point01.png`
const point02 = `${UE5_SN_BASE}/texture/point02.png`

const triangle01 = `${UE5_SN_BASE}/label/label-triangle-1.png`
const triangle02 = `${UE5_SN_BASE}/label/label-triangle-2.png`
const triangle03 = `${UE5_SN_BASE}/label/label-triangle-3.png`
const triangleBlue = `${UE5_SN_BASE}/label/label-triangle-no.png`
const triangleV1 = `${UE5_SN_BASE}/label/label-icon-v1.png`

// import triangle01 from "../assets/label/triangle-1.png"
// import triangle02 from "../assets/label/triangle-1.png"
// import triangle03 from "../assets/label/triangle-1.png"
// import triangleBlue from "../assets/label/triangle-4.png"

const side4 = `${UE5_SN_BASE}/texture/side4.png`
const guangquan1 = `${UE5_SN_BASE}/texture/guangquan01.png`
const guangquan2 = `${UE5_SN_BASE}/texture/guangquan02.png`
const huiguang = `${UE5_SN_BASE}/texture/huiguang.png`
const side = `${UE5_SN_BASE}/texture/side3.png`
const point = `${UE5_SN_BASE}/texture/point1.png`
const flyLineFocus = `${UE5_SN_BASE}/texture/guangquan01.png`
const blackBg = "/resource/v1/ue5-sn/texture/black_bg4.jpg"
const szbg = "/resource/v1/ue5-sn/texture/sz_bg.png"
const oceanBg = `${UE5_SN_BASE}/texture/oceanBg.jpg`
const grid3 = `${UE5_SN_BASE}/texture/grid3.png`
const rotationBorder1 = `${UE5_SN_BASE}/texture/rotationBorder1.png`
const rotationBorder2 = `${UE5_SN_BASE}/texture/rotationBorder2.png`
const nanhaiqundao = `${UE5_SN_BASE}/texture/nanhaiqundao.png`
const transparentTexture = `${UE5_SN_BASE}/texture/transparentTexture.png`
export class Assets {
  constructor(onLoadCallback = null) {
    this.onLoadCallback = onLoadCallback
    this.init()
  }
  init() {
    this.instance = new Resource()
    // 添加Fileloader
    this.instance.addLoader(FileLoader, "FileLoader")
    // 资源加载进度
    this.instance.on("onProgress", (path, itemsLoaded, itemsTotal) => {
      let progress = (itemsLoaded / itemsTotal) * 100
      let bfb = progress.toFixed(2) + "%!"
    })
    // 资源加载完成事件
    this.instance.on("onLoad", () => {
      this.onLoadCallback && this.onLoadCallback()
    })
    // 资源加载
    let base_url = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL;
    let assets = [
      { type: "Texture", name: "earthAtmos", path: earthAtmos },
      { type: "Texture", name: "earthNight", path: earthNight },
      { type: "Texture", name: "earthClouds", path: earthClouds },
      { type: "Texture", name: "earthNormal", path: earthNormal },
      { type: "Texture", name: "earthBump", path: earthBump },
      { type: "Texture", name: "earthSpecular", path: earthSpecular },
      { type: "Texture", name: "highLight", path: highLight },
      { type: "Texture", name: "globeHuiguang", path: globeHuiguang },
      { type: "Texture", name: "pointLight", path: pointLight },
      { type: "Texture", name: "lightPillar", path: lightPillar },
      { type: "Texture", name: "flyLine", path: flyLine },
      { type: "Texture", name: "gridBlack", path: gridBlack },
      { type: "Texture", name: "grid", path: grid },
      { type: "Texture", name: "pathLine", path: pathLine },
      { type: "Texture", name: "flowY", path: flowY },
      { type: "Texture", name: "uv", path: uv },
      { type: "Texture", name: "chinaGlow", path: chinaGlow },
      { type: "Texture", name: "cloud", path: cloud },

      {
        type: "File",
        name: "world",
        path: base_url + "/globe-map/assets/json/world.json",
      },
      {
        type: "File",
        name: "chinaStorke",
        path: base_url + "/globe-map/assets/json/中华人民共和国-轮廓-地球.json",
      },

      {
        type: "File",
        name: "china",
        path: base_url + "/globe-map/assets/json/中华人民共和国.json",
      },
      {
        type: "File",
        name: "guangdong",
        path: base_url + "/globe-map/assets/json/广东省.json",
      },
      {
        type: "File",
        name: "shenzhen",
        path: base_url + "/globe-map/assets/json/深圳市.json",
      },

      // 地图
      { type: "Texture", name: "huiguang", path: huiguang },
      { type: "Texture", name: "guangquan1", path: guangquan1 },
      { type: "Texture", name: "guangquan2", path: guangquan2 },
      { type: "Texture", name: "side", path: side },
      { type: "Texture", name: "flyLineFocus", path: flyLineFocus },
      { type: "Texture", name: "point", path: point },
      { type: "Texture", name: "blackBg", path: blackBg },
      { type: "Texture", name: "szbg", path: szbg },
      { type: "Texture", name: "oceanBg", path: oceanBg },
      { type: "Texture", name: "grid3", path: grid3 },
      { type: "Texture", name: "rotationBorder1", path: rotationBorder1 },
      { type: "Texture", name: "rotationBorder2", path: rotationBorder2 },
      { type: "Texture", name: "topNormal", path: topNormal },
      { type: "Texture", name: "chinaMapBg", path: chinaMapBg },
      { type: "Texture", name: "chinaGlowNew", path: chinaGlowNew },
      { type: "Texture", name: "topFace", path: topFace },
      { type: "Texture", name: "point01", path: point01 },
      { type: "Texture", name: "point02", path: point02 },
      { type: "Texture", name: "triangle01", path: triangle01 },
      { type: "Texture", name: "triangle02", path: triangle02 },
      { type: "Texture", name: "triangle03", path: triangle03 },
      { type: "Texture", name: "triangleBlue", path: triangleBlue },
      { type: "Texture", name: "triangleV1", path: triangleV1 },
      { type: "Texture", name: "side4", path: side4 },
      { type: "Texture", name: "nanhaiqundao", path: nanhaiqundao },
      { type: "Texture", name: "transparentTexture", path: transparentTexture },
      {
        type: "File",
        name: "SZStorke",
        path: base_url + "/globe-map/assets/json/深圳市-轮廓.json",
      },
    ]
    // 资源加载
    this.instance.loadAll(assets)
  }
}
