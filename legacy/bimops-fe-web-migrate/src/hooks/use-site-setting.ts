import { themeManager, antd3LegacyThemeManager } from '@ghcloud/cube-theme'
import { ConfigProvider } from 'ant-design-vue'
//@ts-ignore
import { MFRootEventNameEnum, publisher } from '../event'
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { inDesktopClient } from './use-environment'

const STORAGE_KEY = 'cube-site-setting'

interface ColorParams{
  color:{
    primaryColor: string;
    btnPrimaryBg: string;
  }
  name: string;
}
interface LayoutParams{
  name: string;
  value: "CLASSIC" | "MIXIN",
  menuFold:boolean,
}
interface CubeSiteSetting{
  skinColor: ColorParams;
  layout: LayoutParams; 
}
/** 主题色列表 */
const SKIN_LIST: ColorParams[] = [
  {
    name: "开河蓝",
    color: {
      primaryColor: "#1890ff",
      btnPrimaryBg: "#1890ff",
    },
  },
  {
    name: "极光绿",
    color: {
      primaryColor: "#00BA8B",
      btnPrimaryBg: "#00BA8B",
    },
  },
  {
    name: "日暮色",
    color: {
      primaryColor: "#fa8c16",
      btnPrimaryBg: "#fa8c16",
    },
  },
  {
    name: "公安蓝",
    color: {
      primaryColor: "#1D1E72",
      btnPrimaryBg: "#1D1E72",
    },
  },
]
/** 布局列表 */
const LAYOUT_LIST: LayoutParams[] = [
  {
    name: "新版",
    value: "MIXIN",
    menuFold: false
  },
  {
    name: "旧版",
    value: "CLASSIC",
    menuFold: false
  }
]

/** 站点设置hook */
export const useSiteSetting = defineStore('siteSetting', () => {

  const cubeSiteSetting = ref<CubeSiteSetting>(generateSiteSetting())

  /** 初始化主题 */
  function initTheme ()  {
    if (window.less && window.less.modifyVars) {
      window.less.modifyVars({
        "primary-color": cubeSiteSetting.value.skinColor.color.primaryColor,
        "btn-primary-bg": cubeSiteSetting.value.skinColor.color.btnPrimaryBg,
      })
    }
    if(cubeSiteSetting.value.skinColor.name === '拂晓蓝'){
      cubeSiteSetting.value.skinColor.name = '开河蓝'
    }
    if(cubeSiteSetting.value.skinColor.name === '暗黑色'){
      cubeSiteSetting.value.skinColor.name = '开河蓝'
    }
    try {
      themeManager.use(cubeSiteSetting.value.skinColor.name as "开河蓝");
      antd3LegacyThemeManager.use(cubeSiteSetting.value.skinColor.name as "开河蓝");
    } catch (error) {
      changeTheme({
        "name": "开河蓝",
        "color": {
            "primaryColor": "#1890ff",
            "btnPrimaryBg": "#1890ff"
        }
      });
      return
    }

    ConfigProvider.config({
      theme: {
        primaryColor: cubeSiteSetting.value.skinColor.color.primaryColor,
      },
    });

    try {
      const iframeDom = document.querySelector("iframe");
      if(iframeDom&&iframeDom.contentWindow){
        iframeDom.contentWindow.postMessage({ type: "clickSkin", data: cubeSiteSetting.value.skinColor },"*");
      }
    } catch (error) {

    }
    publisher.publish(MFRootEventNameEnum.MF_ROOT_CHANGE_SKIN, cubeSiteSetting.value.skinColor.color.primaryColor);

    // 兼容legacy应用
    try {
      const colorMap= antd3LegacyThemeManager.getThemeVarsAll(cubeSiteSetting.value.skinColor.name as "极光绿")
      let styleElement = document.getElementById('legacy-theme-style') as HTMLStyleElement
      if(!styleElement){
        styleElement = document.createElement('style');
        styleElement.id = 'legacy-theme-style'
        document.head.appendChild(styleElement);
      }
      // 遍历 Map 并设置 CSS 变量
      colorMap.forEach((value, key) => {
        if(styleElement.sheet){
          styleElement.sheet.insertRule(`:root { --ant-${key}: ${value} !important; }`, styleElement.sheet.cssRules.length);
          styleElement.sheet.insertRule(`:root { --template-${key}: ${value} !important; }`, styleElement.sheet.cssRules.length);
        }
      });
    } catch (error) {
    }

    // 兼容老的skinColor
    localStorage.setItem('skinColor', JSON.stringify(cubeSiteSetting.value.skinColor.color));
  };
  /** 变更主题 */
  function changeTheme (colorParams: ColorParams) {
    cubeSiteSetting.value.skinColor = colorParams;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cubeSiteSetting.value));
    initTheme();
  }

  /** 变更布局 */
  function changeLayout (layout: LayoutParams) {
    cubeSiteSetting.value.layout = layout;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cubeSiteSetting.value));
  }

  /** 菜单收起/展开 */
  function changeMenuFold () {
    cubeSiteSetting.value.layout.menuFold = !cubeSiteSetting.value.layout.menuFold;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cubeSiteSetting.value));
  }

  return {
    cubeSiteSetting,
    SKIN_LIST,
    LAYOUT_LIST,
    initTheme,
    changeTheme,
    changeLayout,
    changeMenuFold
  }
})



function generateSiteSetting(): CubeSiteSetting {
  let res = {
    skinColor: SKIN_LIST[0],
    layout: LAYOUT_LIST[0]
  }
  if (localStorage.getItem(STORAGE_KEY)) {
    res = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
  }
  if(inDesktopClient){
    res.layout = LAYOUT_LIST[1]
  }
  return res;
}