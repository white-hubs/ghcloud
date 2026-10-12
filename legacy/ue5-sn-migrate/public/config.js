window.config = {
  systemName: "",
  pageLoopRequestTime: 60000,
  terminal: "bimops-manage-web",
  webSocketUrl: `${location.protocol === 'http:' ? 'ws' : 'wss'}://${location.host}/api/message/websocket/msg`,
  floorLabelFlag: true,
  buildingLabelFlag: true,
  ue5InteractiveFlag: true,
  systemStartTime: '2022-01-01',
  tenantConfig: [
    { tenant: 21481321, csMode: false, entry: 'views-shengNong' },
    { tenant: 24894805, csMode: false, entry: 'views-shengNong' },
    { tenant: 62220897, csMode: false, entry: 'views-shengNong' },
  ],
  systemNameConfig: [

  ],
  // 鸟瞰视角
  modelPerspective: [

  ],
  // 视角
  perspective: [

  ],
  connectLines: [
    
  ],
	feature: {
    // hideGears:true,
    outsideTenants: [
      { name: "成都海吉星可视化平台",  path: 'http://112.19.169.2:40201/apps-legacy/ue5/?access_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRzIjpbIjU4MTk3MjYwIiwiNTgxOTcyNjAiXSwicGFzc3dvcmRfZXhwaXJlZCI6ZmFsc2UsInVzZXJfbmFtZSI6IjE3MzExMzY5NzgyIiwiYWRtaW4iOmZhbHNlLCJwYXNzd29yZF9mb3JjZWQiOmZhbHNlLCJhdXRob3JpdGllcyI6WyIxNjUxODQ2NzkxNjkzNDE0NDAxIiwiUk9MRV9BQ1RJVklUSV9VU0VSIl0sImNsaWVudF9pZCI6ImNsaWVudF8yIiwicGFzc3dvcmRfZXhwaXJhdGlvbl9yZW1pbmRlZCI6ZmFsc2UsImFkbWluaXN0cmF0ZWRfdGVuYW50cyI6WyI1ODE5NzI2MCJdLCJzY29wZSI6WyJzZWxlY3QiXSwibmFtZSI6Iui2hee6p-euoeeQhuWRmCIsInBhc3N3b3JkX2V4cGlyYXRpb25fZGF0ZSI6MTcxNzE0MTc1NzAwMCwiaWQiOjE0Nzg2MzY4ODY5ODQ1MjM3NzcsImV4cCI6MTc5NzcxMTM2MiwianRpIjoiMDRjMWUzMjktNmU4OC00OTgzLWE5ZGItYzBjNWJiMGQxYzQwIn0.O_SoNhnZrMQ2iXdMbY4ckoqXyHGrCWVsIZMgjtSb-1JPtO2eCcQ15ERG3jhszbwIzxWLaCNQPzB3FcZSA-5KC5gdg_RqFtA2S5VCBOgbUR3uffIAEVgovfcMVgeLnEWdKPnCd202LqFzYS6bmdmSY8CpIj_6E7JYbaM_YLuHc6GH_CFf78GDeInjjL2QqdHV5ZFU1clsgi72SEAylxDii-cgDhwyO5PQ0vMN1XRzjon3wm_9xkQS8tTKGY-jGE6Xgfbo8HsX5aervtJKnjleXPboZKq9qN59CI8BXAD1vamwFSWU4MGbsTcDeKv-9JAEH6BULefQXXG7euHFjAdtsw&name=%E8%B6%85%E7%BA%A7%E7%AE%A1%E7%90%86%E5%91%98&nowEnterprise={%22id%22:%221527470128244015106%22,%22code%22:58197260,%22name%22:%22%E5%AE%89%E5%85%A8%E6%8C%87%E6%8C%A5%E8%B0%83%E5%BA%A6%E7%B3%BB%E7%BB%9F%22,%22address%22:%22%22,%22location%22:%22%22,%22building%22:10,%22areaCovered%22:100,%22logoId%22:null,%22file%22:%22%22,%22remark%22:%22%22,%22enabled%22:true,%22admin%22:true,%22recentLogin%22:false,%22mainEnterprise%22:true,%22floorArea%22:null,%22files%22:[]}'},
    ],
    subMarketList: [
      { tenant:'91017246',projectId:'1902326184254959618' }, //惠州
      { tenant:'13587423',projectId:'1902347927938928641' }, //平湖
      { tenant:'17490811',projectId:'1902346741176397826' }, //天津
      { tenant:'68547128',projectId:'1902335657562931203' }, //光明
      { tenant:'19638246',projectId:'1902345423567781890' }, //西安
      { tenant:'58197260',projectId:'1902336897263341570' }, //成都
      { tenant:'96130361',projectId:'1902344154245074946' }, //福田
      { tenant:'30720523',projectId:'1902336132286840834' }, //柳州
      { tenant:'78813538',projectId:'1902335824865837059' }, //长沙
      { tenant:'16779692',projectId:'1902351042589405186' }, //上海
      { tenant:'79054341',projectId:'1902332921736933379' }, //南宁
    ],
    subMarketV1: [
      { tenant: '12324111' },      // 集贸
      { tenant: '465' },           // 果菜
      { tenant: '66666' },         // 南昌
      { tenant: '7777' },          // 九江
      { tenant: '88888' },         // 蚌埠
      { tenant: '6666' },          // 宁夏
      { tenant: '123123100' },     // 布吉市场
      { tenant: '7777721' },       // 南山农批
      { tenant: '999999999' },      // 沈阳海吉星
      { tenant: '123123123' },     // 长春海吉星
      { tenant: '96130361' },     // 福田公司
      { tenant: '520144' },         // 武汉海吉星
      { tenant: '2222' },          // 岳阳
      { tenant: '3333' }           // 安庆
    ],
  },
  // 面板UI模版
  panelTemplate: 'custom', // 空，表示使用默认模板； custom: 定制模板（新版UI)
  // 面板轮播配置
  panelLoop: {
    loop: true,
    interval: 60 * 1000,
  }
}
