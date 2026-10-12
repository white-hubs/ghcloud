import { CubeAppBusinessBridge, cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { CubeAppPageOrientationEnum } from '@ghcloud/cube-app-js-sdk/src/js/cube-app.service'
import { closeToast, showDialog, showLoadingToast } from 'vant'

export const bridgeList = [
  {
    name: 'getAppTheme',
    desc: '获取主题色',
    action: async (): Promise<void> => {
      const res = await cubeAppService.getAppTheme()
      showDialog({
        message: res,
      })
    }
  },
  {
    name: 'setPageOrientation',
    desc: '设置横屏',
    params: CubeAppPageOrientationEnum.LANDSCAPE,
    action: async (pageOrientation: CubeAppPageOrientationEnum): Promise<void> => {
      await cubeAppService.setPageOrientation(pageOrientation)
    }
  },
  {
    name: 'setPageOrientation',
    desc: '设置竖屏',
    params: CubeAppPageOrientationEnum.PORTRAIT,
    action: async (pageOrientation: CubeAppPageOrientationEnum): Promise<void> => {
      await cubeAppService.setPageOrientation(pageOrientation)
    }
  },
  {
    name: 'onScanCode',
    desc: '扫码',
    action: async (): Promise<void> => {
      const res = await cubeAppService.onScanCode()
      showDialog({
        title: '扫码结果',
        message: res,
      })
    }
  },
  {
    name: 'handleBusinessScanCode',
    desc: '扫码业务处理',
    action: async (): Promise<void> => {
      const res = await CubeAppBusinessBridge.handleBusinessScanCode()
      showDialog({
        title: '扫码结果',
        message: res,
      })
    }
  },
  {
    name: 'getUser',
    desc: '获取用户信息(id & name)',
    action: async (): Promise<void> => {
      const res = await cubeAppService.getUser()
      showDialog({
        title: '用户信息',
        message: JSON.stringify(res)
      })
    }
  },
  {
    name: 'getRequestHeader',
    desc: '获取开河鉴权信息',
    action: async (): Promise<void> => {
      const res = await cubeAppService.getRequestHeader()
      showDialog({
        title: '鉴权信息',
        message: JSON.stringify(res)
      })
    }
  },
  {
    name: 'closePage',
    desc: '关闭当前webview',
    action: async (): Promise<void> => {
      await cubeAppService.closePage()
    }
  },
  {
    name: 'backPage',
    desc: '返回App路由的上一页',
    action: async (): Promise<void> => {
      await cubeAppService.backPage()
    }
  },
  {
    name: 'onVisibilityNativeAppBar',
    desc: '显示顶部导航栏',
    action: async (): Promise<void> => {
      await cubeAppService.onVisibilityNativeAppBar(true)
    }
  },
  {
    name: 'onVisibilityNativeAppBar',
    desc: '隐藏顶部导航栏',
    action: async (): Promise<void> => {
      await cubeAppService.onVisibilityNativeAppBar(false)
    }
  },
  {
    name: 'uploadImage',
    desc: '上传图片(仅相机)',
    params: {
      maxCount: 3,
    },
    action: async (): Promise<void> => {
      const res = await cubeAppService.uploadImage('3', {
        watermarkTypes: ['timestamp'],
        uploadMethod: ['camera']
      })
      showDialog({
        title: '上传图片(仅相机)',
        message: JSON.stringify(res)
      })
    }
  },
  {
    name: 'uploadImage',
    desc: '上传图片(仅相册)',
    params: {
    },
    action: async (): Promise<void> => {
      const res = await cubeAppService.uploadImage('3', {
        watermarkTypes: ['timestamp'],
        uploadMethod: ['album']
      })
      showDialog({
        title: '上传图片(仅相册)',
        message: JSON.stringify(res)
      })
    }
  },
  {
    name: 'uploadImage',
    desc: '上传图片(相机&相册)',
    params: {
      maxCount: 3,
      expandField: {
        watermarkTypes: ['timestamp'],
        uploadMethod: ['camera']
      }
    },
    action: async (): Promise<void> => {
      const res = await cubeAppService.uploadImage('3')
      showDialog({
        title: '上传图片(相机&相册)',
        message: JSON.stringify(res)
      })
    }
  },
  {
    name: 'openFile',
    desc: '打开远程文件',
    params: {
      url: 'https://qiniu.guhecloud.com/video/官网首页.mp4'
    },
    action: async (params: any): Promise<void> => {
      await cubeAppService.openFile(params.url)
    }
  },
  {
    name: 'uploadFile',
    desc: '上传文件(相册、相机、文件管理)',
    params: {
      uploadNum: '3'
    },
    action: async (params: any): Promise<void> => {
      await cubeAppService.uploadFile(params.uploadNum)
    }
  },
  {
    name: 'getBusinessData',
    desc: '获取APP缓存的数据',
    action: async (): Promise<void> => {
      const res = await cubeAppService.getBusinessData()
      showDialog({
        title: '缓存数据',
        message: JSON.stringify(res)
      })
    }
  },
  {
    name: 'onScanBluetooth',
    desc: '扫描蓝牙设备',
    action: async (): Promise<void> => {
      showLoadingToast({
        message: '扫描中',
        duration: 0
      })
      const res = await cubeAppService.onScanBluetooth()
      closeToast()
      showDialog({
        title: '扫描结果',
        message: JSON.stringify(res)
      })
    }
  },
  {
    name: 'onScanNFC',
    desc: '扫描NFC标签',
    action: async (): Promise<void> => {
      showLoadingToast({
        message: '扫描中',
        duration: 0
      })
      const res = await cubeAppService.onScanNFC()
      closeToast()
      showDialog({
        title: '扫描结果',
        message: JSON.stringify(res)
      })
    }
  },
  {
    name: 'playVideo',
    desc: '播放视频',
    params: {
      videoUrl: 'https://qiniu.guhecloud.com/video/官网首页.mp4',
      videoName: '官网首页'
    },
    action: async (params: any): Promise<void> => {
      await cubeAppService.playVideo({
        videoUrl: params.videoUrl,
        videoName: params.videoName
      })
    }
  },

]
