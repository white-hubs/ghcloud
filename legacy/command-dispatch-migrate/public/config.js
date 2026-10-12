window.config = {
  systemName: "指挥调度平台",
  // 系统名称
  appName: "市场业务管理",
  //底部导航文本
  copyright:
    "Copyright ©2007-2021 All Rights Reserved.成都古河云科技有限公司 技术支持",
  // 产品code
  productionCode: "ibimops-manege",
  // 端id
  terminal: "command-dispatch-app",
  //视频监控地sss
  videoUrl: "192.168.0.211:8080",
  Twoconfiguration: 'https://kaihe-test-scada.guhecloud.com:30000',
  //websoket地址
  // websoketUrl:
  websoketUrl: `${location.protocol === 'http:' ? 'ws' : 'wss'}://${location.host}/api/message/websocket/msg`,
  websoketUrl2: `${location.protocol === 'http:' ? 'ws' : 'wss'}://${location.host}/api/message2/websocket/msg`,
  businessPlatformUrl: "/index",
  feature: {
    usePersonal: true,
    useUploadTemporary: true,
  }
};
