export const TopPanelMap={
  综合分析:{
    totalNum:"今年报警总数(个)",
    notHandlerNum:'今年未处理报警数(个)',
    noResponseNum:'今年未响应报警数(个)',
    dangerFilingNum:'危险源建档数(个)',
    maintenanceExpireNum:'消防设备到期数(个)',
    electricVehicleFilingNum:'电动车建档数(个)',
    
  },
  电气安全:{
    totalNum:"今年电气报警总数(个)",
    unConfirmedNum:'今年未响应报警数(个)',
    timeoutNum:'今年超时报警数(个)',
    notHandlerNum:'今年未处理报警数(个)',
    actualRatio:'报警正确率(%)'
  },
  小散工程:{
    totalNum:'工程总数(个)',
    underwayNum:'正在施工数(个)',
  },
  电动车管理:{
    totalNum:'车辆备案总数',
    abnormalNum:'本月违规充电停放查处起数',
  },
  安防监控:{
    totalNum:"今年安防报警总数(个)",
    unConfirmedNum:'今年未响应报警数(个)',
    notHandlerNum:'今年未处理报警数(个)',
    timeoutNum:'今年超时报警数(个)',
    actualRatio:'报警正确率(%)'
  },
  消防安全:{
    totalNum:"今年消防报警总数(个)",
    noResponseNum:'今年未响应报警数(个)',
    timeoutNum:'今年超时报警数(个)',
    deviceFilingNum:'消防设备到期数(个)',
    accuracyRatio:'报警正确率(%)',
  
  },
  用气安全:{
    totalNum:"今年燃气报警总数(个)",
    noResponseNum:'今年未响应报警数(个)',
    timeoutNum:'今年超时报警数(个)',
    deviceFilingNum:'易燃设备建档数',
    accuracyRatio:'报警正确率(%)',
  
  },
  安全管理:{
    projectNum:'今年小散工程数(个)',
    hiddenDangerNum:'今年未处理隐患数(个)',
    safetyTaskNum:'今年未完成安全任务数(个)'
  }
  
  }
  export const MapPanelRatio={
    综合分析:{
      fireAlarmNum:'fireAlarmRatio',
      electricalAlarmNum:'electricalAlarmRatio',
      securityAlarmNum:"securityAlarmRatio",
      gasAlarmNum:"gasAlarmRatio",
    }
  
  }
  export const MapPanelMap={
    综合分析:{
      // riskIndex:"风险指数",
      flammableEquipmentNum:'易燃设备建档数',
      powderProjectNum:'小散工程数',
      fireFightingEquipmentFilingNum:'消防设备建档数',
      electricVehicleFilingNum:'电动车建档数',
    },
    消防安全:{
      deviceFilingNum:'消防设备建档数',
      deviceExpireNum:'消防设备到期数',
    },
    用气安全: {
      deviceFilingNum:"易燃设备建档数",
    },
    安全管理:{
      // safetyTaskNum:"安全任务数",
      alarmTaskNum:"今日报警任务数",
      hiddenTaskNum:"今日隐患任务数",
      inspectTaskNum:"今日巡检任务数",
      patrolTaskNum:"今日巡更任务数",
      educationTaskNum:"今日安全教育任务数",
      projectNum:"今日小散工程数",
      planFileNum:"预案文件数",
      deviceFilingNum: "建档设备数",
      
    }
  
  }
  export const img={
    综合分析:{
    'list':['今年报警总数(个)','危险源建档数(个)','电动车建档数(个)', '消防设备到期数(个)'],
    "今年报警总数(个)":'bjj-b.png',
    '危险源建档数(个)':'wx-b.png',
    '消防设备到期数(个)':'a4-b.png',
    '电动车建档数(个)':'a3-b.png',
    '今年未响应报警数(个)':'background:#C5A98C;box-shadow: 0px 0px 1px 5px rgba(197,169,140,0.2);',
    '今年超时报警数(个)':' background: #8db2ef;box-shadow: 0px 0px 1px 5px rgba(141, 178, 239, 0.2);',
    },
    电气安全:{
    'list':['今年电气报警总数(个)','报警正确率(%)'],
    '今年电气报警总数(个)':'dq.png',
    '报警正确率(%)':'zq.png',
    '今年未响应报警数(个)':'background:#8DB2EF;;box-shadow: 0px 0px 1px 5px rgba(141,178,239,0.2);',
    '今年超时报警数(个)':'background:#C5A98C;box-shadow: 0px 0px 1px 5px rgba(197,169,140,0.2);',
    '今年未处理报警数(个)':'background:#67B9C1;box-shadow: 0px 0px 1px 5px rgba(103,185,193,0.2);',
    },
    小散工程:{
      'list':['工程总数(个)','正在施工数(个)'],
      '工程总数(个)':'xs.png',
      '正在施工数(个)':'xs-w.png',
    },
    电动车管理:{
      'list':['车辆备案总数','本月违规充电停放查处起数'],
      '车辆备案总数':'z2.png',
      '本月违规充电停放查处起数':'z2-w.png',
    },
    安防监控:{
    'list':['报警正确率(%)','今年安防报警总数(个)'],
    '今年安防报警总数(个)':'d.png',
    '报警正确率(%)':"zq.png",
    '今年未响应报警数(个)':'background:#C5A98C;box-shadow: 0px 0px 1px 5px rgba(197,169,140,0.2);',
    '今年超时报警数(个)':' background: #8db2ef;box-shadow: 0px 0px 1px 5px rgba(141, 178, 239, 0.2);',
    '今年未处理报警数(个)':'background:#67B9C1;box-shadow: 0px 0px 1px 5px rgba(103,185,193,0.2);',
    },
    消防安全:{
      'list':['今年消防报警总数(个)','报警正确率(%)','消防设备到期数(个)'],
      '今年消防报警总数(个)':'huo.png',
      '报警正确率(%)':'zq.png',
      '消防设备到期数(个)':'a4-b.png',
      '今年未响应报警数(个)':'background:#C5A98C;box-shadow: 0px 0px 1px 5px rgba(197,169,140,0.2);',
      '今年超时报警数(个)':' background: #8db2ef;box-shadow: 0px 0px 1px 5px rgba(141, 178, 239, 0.2);',
    },
    用气安全:{
      'list':['今年燃气报警总数(个)','报警正确率(%)','易燃设备建档数'],
       "今年燃气报警总数(个)":'rq.png',
      noResponseNum:'background:#8DB2EF;;box-shadow: 0px 0px 1px 5px rgba(141,178,239,0.2);',
      notHandlerNum:'background:#C5A98C;box-shadow: 0px 0px 1px 5px rgba(197,169,140,0.2);',
    '易燃设备建档数':'yrh.png',
    '报警正确率(%)':"zq.png",
    '今年未响应报警数(个)':'background:#C5A98C;box-shadow: 0px 0px 1px 5px rgba(197,169,140,0.2);',
    '今年超时报警数(个)':' background: #8db2ef;box-shadow: 0px 0px 1px 5px rgba(141, 178, 239, 0.2);',
  },
    安全管理:{
      'list':['今年小散工程数(个)','今年未处理隐患数(个)','今年未完成安全任务数(个)'],
    '今年小散工程数(个)':'aqm.png',
   '今年未处理隐患数(个)':'ha.png',
    '今年未完成安全任务数(个)':'ld.png'
    }
  
  }
  export const color={
    综合分析:{
    "今年报警总数(个)":'#FFC7C6',
    '危险源建档数(个)':'#A1BFFC',
    '消防设备到期数(个)':'#FFEBC6',
    },
    电气安全:{
    '今年电气报警总数(个)':'#FFC7C6',
    '报警正确率(%)':'#A1BFFC',
    },
    小散工程:{
      '工程总数(个)':'#A1BFFC',
      '正在施工数(个)':'#FFEBC6',
    },
    电动车管理:{
      '车辆备案总数':'#A1BFFC',
      '本月违规充电停放查处起数':'#FFEBC6',
    },
    安防监控:{
    '今年安防报警总数(个)':'#FFC7C6',
    '报警正确率(%)':"#A1BFFC",
    },
    消防安全:{
      '今年消防报警总数(个)':'#FFC7C6',
      '报警正确率(%)':'#A1BFFC',
      '消防设备到期数(个)':'#FFEBC6',
    },
    用气安全:{
      'list':['今年燃气报警总数(个)','报警正确率(%)','易燃设备建档数'],
   "今年燃气报警总数(个)":'rq.png',
      noResponseNum:'background:#8DB2EF;;box-shadow: 0px 0px 1px 5px rgba(141,178,239,0.2);',
      notHandlerNum:'background:#C5A98C;box-shadow: 0px 0px 1px 5px rgba(197,169,140,0.2);',
  '易燃设备建档数':'yrh.png',
    '报警正确率(%)':"zq.png",
    },
    安全管理:{
    '今年小散工程数(个)':'#A1BFFC',
   '今年未处理隐患数(个)':'#FFEBC6',
    '今年未完成安全任务数(个)':'#67B9C1'
    }
  
  }