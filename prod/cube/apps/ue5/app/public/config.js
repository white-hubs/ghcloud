window.config = {
  systemName: "",
  pageLoopRequestTime: 60000,
  terminal: "three-dimensional-visualization",
  webSocketUrl: `${location.protocol === 'http:' ? 'ws' : 'wss'}://${location.host}/api/message/websocket/msg`,
  floorLabelFlag: true,
  buildingLabelFlag: true,
  ue5InteractiveFlag: true,
  systemStartTime: '2022-01-01',
  tenantConfig: [
    { tenant: 21481321, csMode: false, entry: 'views-shengNong' },
    { tenant: 24894805, csMode: false, entry: 'views-shengNong' },
    { tenant: 62220897, csMode: false, entry: 'views-shengNong' },
    { tenant: 60074083, name: '福州广汇', csMode: false, entry: 'views-2d' },
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
      { name: "成都",  path: 'http://112.19.169.2:40201'},
      { name: "上海",  path: 'https://sn-sh.guheyun.cn:40201'},
      { name: "平湖",  path: 'https://sn-ph.guheyun.cn:40201'},
      { name: "西安",  path: 'https://sn-xa.guheyun.cn:40201'},
      { name: "福田",  path: 'https://sn-ft.guheyun.cn:40201'},
      { name: "光明",  path: 'https://safe.higreen-gm.com:30000'},
      { name: "深圳",  path: 'https://sn-ph.guheyun.cn:40201'},
      { name: "天津海吉星",  path: 'https://sn-tj.guheyun.cn:40201'},
    ]
  },
}
