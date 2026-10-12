export const TopPanelMap={
  综合分析:{
    totalNum:"报警总数",
    notHandlerNum:'未处理报警数',
    noResponseNum:'未响应报警数',
    dangerFilingNum:'危险源建档数',
    maintenanceExpireNum:'消防设备到期数',
    electricVehicleFilingNum:'电动车建档数',
    
  },
  电气安全:{
    totalNum:"电气报警总数",
    handlerNum:'已处理报警数',
  },
  小散工程:{
    totalNum:'小散工程总数',
    underwayNum:'正常工程数',
    abnormalNum:'异常工程数',
  },
  电动车管理:{
    totalNum:'车辆备案总数',
    abnormalNum:'违规充电停放查处起数',
  },
  安防监控:{
    totalNum:"安防报警总数",
    handlerNum:'已处理报警数',
  },
  消防安全:{
    totalNum:"消防报警总数",
    deviceExpireNum:'消防设备到期数',
    handlerNum:'已处理报警数',
  
  },
  用气安全:{
    totalNum:"燃气报警总数",
    handlerNum:'已处理报警数',
  },
  安全管理:{
    projectNum:'进行中的小散工程数',
    hiddenDangerNum:'未处理隐患数',
    safetyTaskNum:'未完成安全任务数'
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
      deviceExpireNum:'消防设备建档数',
    },
    用气安全: {
      deviceExpireNum:"易燃设备建档数",
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
      deviceExpireNum: "建档设备数",
      
    }
  
  }
  export const img={
    综合分析:{
    'list':['报警总数','危险源建档数','电动车建档数', '消防设备到期数'],
    "报警总数":'bjj-b.png',
    '危险源建档数':'wx-b.png',
    '消防设备到期数':'a4-b.png',
    '电动车建档数':'a3-b.png',
    '未响应报警数':'background:#C5A98C;box-shadow: 0px 0px 1px 5px rgba(197,169,140,0.2);',
    '超时报警数':' background: #8db2ef;box-shadow: 0px 0px 1px 5px rgba(141, 178, 239, 0.2);',
    },
    电气安全:{
    'list':['电气报警总数'],
    '电气报警总数':'dq.png',
    '已处理报警数':'background:#67B9C1;box-shadow: 0px 0px 1px 5px rgba(103,185,193,0.2);',
    },
    小散工程:{
      'list':['小散工程总数'],
      '小散工程总数':'xs.png',
      '正常工程数':'background:#67B9C1;box-shadow: 0px 0px 1px 5px rgba(103,185,193,0.2);',
      '异常工程数':'background:#E99494;box-shadow: 0px 0px 1px 5px rgba(197,169,140,0.2);',
    },
    电动车管理:{
      'list':['车辆备案总数','违规充电停放查处起数'],
      '车辆备案总数':'z2.png',
      '违规充电停放查处起数':'z2-w.png',
    },
    安防监控:{
    'list':['安防报警总数'],
    '安防报警总数':'d.png',
    '已处理报警数':'background:#67B9C1;box-shadow: 0px 0px 1px 5px rgba(103,185,193,0.2);',
    },
    消防安全:{
      'list':['消防报警总数','消防设备到期数'],
      '消防报警总数':'huo.png',
      '消防设备到期数':'a4-b.png',
      '已处理报警数':'background:#67B9C1;box-shadow: 0px 0px 1px 5px rgba(103,185,193,0.2);',
    },
    用气安全:{
      'list':['燃气报警总数'],
       "燃气报警总数":'rq.png',
       '已处理报警数':'background:#67B9C1;box-shadow: 0px 0px 1px 5px rgba(103,185,193,0.2);',
  },
    安全管理:{
      'list':['进行中的小散工程数','未处理隐患数','未完成安全任务数'],
    '进行中的小散工程数':'aqm.png',
   '未处理隐患数':'ha.png',
    '未完成安全任务数':'ld.png'
    }
  
  }
  export const color={
    综合分析:{
    "报警总数":'#FFC7C6',
    '危险源建档数':'#A1BFFC',
    '消防设备到期数':'#FFEBC6',
    },
    电气安全:{
    '电气报警总数':'#FFC7C6',
    '报警正确率(%)':'#A1BFFC',
    },
    小散工程:{
      '小散工程总数':'#A1BFFC',
      '正常工程数':'#67B9C1',
      '异常工程数':'#FFC7C6',
    },
    电动车管理:{
      '车辆备案总数':'#A1BFFC',
      '违规充电停放查处起数':'#FFEBC6',
    },
    安防监控:{
    '安防报警总数':'#FFC7C6',
    '报警正确率(%)':"#A1BFFC",
    },
    消防安全:{
      '消防报警总数':'#FFC7C6',
      '报警正确率(%)':'#A1BFFC',
      '消防设备到期数':'#FFEBC6',
    },
    用气安全:{
      'list':['燃气报警总数','报警正确率(%)','易燃设备建档数'],
   "燃气报警总数":'rq.png',
      noResponseNum:'background:#8DB2EF;;box-shadow: 0px 0px 1px 5px rgba(141,178,239,0.2);',
      notHandlerNum:'background:#C5A98C;box-shadow: 0px 0px 1px 5px rgba(197,169,140,0.2);',
  '易燃设备建档数':'yrh.png',
    '报警正确率(%)':"zq.png",
    },
    安全管理:{
    '小散工程数':'#A1BFFC',
   '未处理隐患数':'#FFEBC6',
    '未完成安全任务数':'#67B9C1'
    }
  
  }