const panelObj ={
	'安防监控':{
			left:'SecurityMonitoringLeft',
			right:'SecurityMonitoringRight',
			mid:'SecurityMonitoringBottom',
		},
		'综合分析':{
			left:'ComprehensiveLeft',
			right:'ComprehensiveRight',
			// mid:'ComprehensiveMid',
		},
		'安全管理':{
			left:'SafetyManageLeft',
			right:'SafetyManageRight',
			mid:'SafetyManageMid',
		},
		'电气安全':{
			left:'ElectricalLeft',
			right:'ElectricalRight',
			mid:'',
		},
		'用气安全':{
		left:'GasLeft',
		right:'GasRight',
		mid:'',
		},
		'消防安全':{
		left:'FireLeft',
		right:'FireRight',
		mid:'FireMid',
		},
		'小散工程':{
			left:'SmallProjectLeft',
			right:'SmallProjectRight',
			mid:'',
		},
		'电动车管理':{
			left:'ElectricCarLeft',
			right:'ElectricCarRight',
			mid:'',
		},
}
export function setPanel(params:string) {
	if (params) {
		return panelObj[params]
	}
}