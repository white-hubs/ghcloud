import { requestDeviceList } from "@/utils/requestData/basicData"
import { DeviceTypeIcon, DeviceStatusCode } from "@/utils/enumeratie"
import gearData from "@/utils/gear.json"
import {UeClient} from "@ghcloud/cube-visual-sdk";
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from "@/piniaStore/menu";
import { stallSceneStall } from '@/api/mdata'
import { propertySceneStall, riskSceneStall } from '@/api/property'
import { storeMarket } from '@/piniaStore/other'

const piniaStoreArea = storeArea();
const piniaStoreMenu = storeMenu();
const piniaStoreMarket = storeMarket();
const ueClient = UeClient.getInstance(); 

/** 批量打设备图标 */
export async function batchAddDeviceIcon() {
	dataTypeList.forEach(item=>{
		ueClient.send('removePoiByProps', {
		 props: {
			 iconType: item.key,
		 }
	 });
	})
	let stallS = []
	let property = []
	let risk = []
	try {
		 stallS = await getStallSceneStall()
		 property = await getPropertySceneStall()
		 risk = await getRiskSceneStall()
	} catch (error) {
		
	}
	 const device = await getDeviceList()
	 if ([...device,...stallS,...property,...risk].length) {
		 sessionStorage.setItem('deviceList',JSON.stringify([...device,...stallS,...property,...risk]))
		 piniaStoreMarket.showLabel ==='开' && ueClient.send("addIconPoiBatch", { pois: [...device,...stallS,...property,...risk] })
	 }
}
/** 批量打档位图标 */
export function batchAddGearIconPio(modalNames: string) {
	ueClient.send('removePoiByProps', {
		props: {
			iconType: 'gear',
		}
	});
	let list = gearData.gearArray.map(item => item.area === modalNames);
	const groupList = setBatchgroup(list);
	if (groupList.length) {
		let gearListPio = groupList[0].map((item: { name: string; code: string; area: string })=>{
			return {
				text: item.name,
				color: 4,
				targetActorId: item.code,
				scale: 1,
				props: {
					iconType: 'gear',
					actorId:item.code,
					code: item.code,
					area: item.area,
					name: item.name,
					deviceData : item
				}
			}
		})
		ueClient.send("addTextPoiBatch", { pois: gearListPio })
	}
}

/**
 * 设置批量分组
 */
function setBatchgroup(array: string | any[]) {
	const subGroupLength = 10000
	let index = 0;
	let newArray = [];
	while (index < array.length) {
		newArray.push(array.slice(index, (index += subGroupLength)));
	}
	return newArray
} 
/**
 * 获取档位列表数据
 */
const getStallSceneStall = async () => {
	const params = {
		sceneType:piniaStoreMenu.currentMenu,
		areaId:piniaStoreArea.currentAreaId,
		pageSize:500,
		pageNumber:1
	}
	const res =	await stallSceneStall(params)
	let deviceListPio = []
	let deviceList = res.records
	const list = [...new Set(deviceList)];
	const groupList = setBatchgroup(list);
	if (groupList.length) {
		 deviceListPio = groupList[0].map((item: {
			area:string; visualizationCode: any; code: any; genreName: string | number; status: any; id: any; genreId: any;product:{modelName:string} 
	})=>{
		if (piniaStoreArea.currentAreaId === item?.area.split(",")[item.area.split(",").length-1]) {
			return {
				targetActorId: item.visualizationCode,
				icon: '64',
				color: 0,
				scale: window.config.otherConfig.iconScale?window.config.otherConfig.iconScale:1,
				props: {
					iconType: 'stall',
					actorId:item.visualizationCode.trim(),
					id: item.id,
					code: item.visualizationCode.trim(),
					genreId: item.genreId,
				}
			}
		}
		})
	}
	return deviceListPio.filter(item=>item)
}
/**
 * 获取资产列表数据
 */
const getPropertySceneStall = async () => {
	const params = {
		sceneType:piniaStoreMenu.currentMenu,
		areaId:piniaStoreArea.currentAreaId,
		pageSize:500,
		pageNumber:1
	}
	const res =	await propertySceneStall(params)
	let deviceListPio = []
	let deviceList = res.records
	const list = [...new Set(deviceList)];
	const groupList = setBatchgroup(list);
	if (groupList.length) {
		 deviceListPio = groupList[0].map((item: {
			areaId:string;	deviceNumber: any; code: any; genreName: string | number; status: any; propertyId: any; genreId: any;product:{modelName:string} 
	})=>{
		item.deviceNumber = item.deviceNumber.trim()
		if (piniaStoreArea.currentAreaId === item?.areaId.split(",")[item.areaId.split(",").length-1]) {
			return {
				targetActorId: item.deviceNumber,
				icon: '72',
				color: 0,
				scale: window.config.otherConfig.iconScale?window.config.otherConfig.iconScale:1,
				props: {
					type:'',
					iconType: 'property',
					actorId:item.deviceNumber,
					id: item.propertyId,
					code: item.deviceNumber,
					genreId: item.genreId,
				}
			}
		}
		})
	}
	return deviceListPio.filter(item=>item)
}
/**
 * 获取风险源列表数据
 */
const getRiskSceneStall = async () => {
	const params = {
		sceneType:piniaStoreMenu.currentMenu,
		areaId:piniaStoreArea.currentAreaId,
		pageSize:500,
		pageNumber:1
	}
	const res =	await riskSceneStall(params)
	let deviceListPio = []
	let deviceList = res.records
	const list = [...new Set(deviceList)];
	const groupList = setBatchgroup(list);
	if (groupList.length) {
		 deviceListPio = groupList[0].map((item: {
			 typeName: any
			areaId:string;bimCode: any; code: any; genreName: string | number; status: any; riskSourceId: any; genreId: any;product:{modelName:string} 
	})=>{
		item.bimCode = item.bimCode.trim()
		if (piniaStoreArea.currentAreaId === item?.areaId.split(",")[item.areaId.split(",").length-1]) {
			return {
				targetActorId: item.bimCode,
				icon: DeviceTypeIcon[item.typeName.split("/")[item.typeName.split("/").length-1] ],
				color: 0,
				scale: window.config.otherConfig.iconScale?window.config.otherConfig.iconScale:1,
				props: {
					iconType: 'risk_source',
					actorId:item.bimCode,
					id: item.riskSourceId,
					code: item.bimCode,
					genreId: item.bimCode,
				}
			}
		}
		})
	}
	return deviceListPio.filter(item=>item)
}
/**
 * 流式请求设备列表接口
*/
const flowRequest = async():Promise<any> => {
	return	new Promise(async(resolve, reject) => {
		const param = {
			pageSize:500,
			pageNumber:1
		}
		let deviceList = []
		 const res = await requestDeviceList(param)
		 deviceList.push(...res.records)	
		 if (res.total>param.pageSize) {
			const total = Math.ceil(res.total/param.pageSize)
			for (let i = 2; i <= total; i++) {
				const res = await requestDeviceList({
					pageSize:500,
					pageNumber:i
				})
			deviceList.push(...res.records)	
				if (i===total) {
					resolve(deviceList)
				}
			}
		 }else{
			resolve(deviceList)
		 }
	})
}
const getDeviceList = async () => {
	let deviceListPio = []
	let deviceList = await flowRequest()
	
	const list = [...new Set(deviceList)];
	const groupList = setBatchgroup(list);
	let deviceAreaNameList = []
	if (groupList.length) {
		 deviceListPio = groupList[0].map((item: {area:{id:string,pathId:string,pathName:string}; code: any; genreName: string | number; status: any; id: any; genreId: any;product:{modelName:string} })=>{
		item.code = item.code.trim()
		item.area && deviceAreaNameList.push(item.area.pathName)
		
		// if (piniaStoreArea.currentAreaId === item?.area?.key||piniaStoreArea.currentAreaLeave===1 && item.prodCategory) {
		if (piniaStoreArea.currentAreaId === item?.area?.id || (piniaStoreArea.currentAreaLeave === 3 && item?.area?.pathId?.includes(piniaStoreArea.currentAreaId))) {
		return {
				targetActorId: item.code,
				icon: DeviceTypeIcon[item.prodCategory.name],
				color: DeviceStatusCode[item.status.onlineState?'NORMAL':'OFFLINE'],
				scale: window.config.otherConfig.iconScale?window.config.otherConfig.iconScale:1,
				props: {
					iconType: 'device',
					actorId:item.code,
					id: item.id,
					code: item.code,
					genreId: item.genreId,
					prodCategory:item.prodCategory.name,
					onlineState:item.status.onlineState,
					deviceData : item
				}
			}
		}
		})
		if (piniaStoreArea.currentAreaLeave>2) {
			piniaStoreMarket.deviceAreaNameList = []
		}else{
			piniaStoreMarket.deviceAreaNameList = [...new Set(deviceAreaNameList)]
		}
	}
	return deviceListPio.filter(item=>item)
}
/**
 * 管网视角枚举
 */

export const EnumParkView = {
	'空气源':'成都六院-空调水系统主管道',
	'冷热源':'成都六院-空调水系统主管道',
	'锅炉系统':'成都六院-空调水系统主管道',
	'净化系统':'成都六院-净化空调',
	'净水系统':'成都六院-净水管道系统',
}
export const dataTypeList = [
	{ key: 'device', name: '设备', applicationCode: 'DEVICECENTER' },
	{ key: 'stall', name: '档位', applicationCode: 'DWGL' },
	{ key: 'property', name: '资产', applicationCode: 'PROPERTY_MANAGEMENT' },
	{ key: 'risk_source', name: '风险源', applicationCode: 'RISK_SOURCE' },
]
// 光明电梯定制需求
export const setElevatorView = () =>{
	ueClient.send("getActorByName", { name: '办公楼' }, (res) => {
		ueClient.send("getBimtree", { id: res.id }, function (children) {
			const floor = ['标高_上标头_6F','标高_上标头_5F']
			children.forEach(item=>{
				floor.forEach(e=>{
					if (item.name === e) {
						ueClient.send('changePerspectivity', {
							id: item.id,
							translucent: true,               // true代表半透明，false代表不透明
							color:'#9fd5ed',  // 颜色
							opacity: 0.1               // 不透明度
					});
					}
				})
			})
			const hideList = ['BGL-5F-DT-001','BGL-5F-DT-002','BGL-5F-DT-003']
			hideList.forEach(e=>{
				// level 取值1、2、3、4，代表红、橙、黄、蓝
				ueClient.send('startFlash', {id: e, level: 3});
			})

			ueClient.send('changePerspectivityBatch', {
				ids: hideList,
				translucent: false,               // true代表半透明，false代表不透明
			});
			
			['diantijing03','diantijing04','diantijing05'].forEach(e=>{
				ueClient.send('changePerspectivity', {
					id: e,
					color:{r: 255, g: 255, b: 255},
					opacity: 0.5,
					translucent: true,               // true代表半透明，false代表不透明
				});
			})
			
		})
	})
	ueClient.send("getActorByName", { name: '宿舍楼' }, (res) => {
		ueClient.send('hideActor', {id: res.id,translucent: true});
	})


 const diantiCamera = {"location":{"x":12561.345740912899,"y":8030.55802020378,"z":4807.424392900029},"rotation":{"pitch":334.0349426269531,"yaw":92.44442401826382,"roll":0},"springArmLength":6290}
 ueClient.send("changeCameraView", {...diantiCamera,pawnToCamera: false });
}
// 管廊特殊需求 
export const hidePipeGallery = () =>{
	['标高_上标头_TF','标高_上标头_RF'].forEach(e=>{
		ueClient.send('getActorByName', {name: e}, function(actor) {
			ueClient.send('hideActor', {id: actor.id});
		});
	})
}
// 平湖特殊需求
export const showEmergencyAccess = (flag,time=3000)=>{
	return
	if (!flag) {
		setTimeout(() => {
			for (let index = 1; index < 22; index++) {
				ueClient.send('hideActor', {id: `taoshengluxian${index}`});
			}
		}, time);
	}else{
		for (let index = 1; index < 22; index++) {
			ueClient.send('showActor', {id: `taoshengluxian${index}`});
		}
	}
}
// 模型打文本标签
export const addLabelText = ()=>{
	window.config.ueLabelList && window.config.ueLabelList.forEach(e=>{
	if (e.type === 'textLabel') {
		if (e.location === 'default'&&e?.area?.aliasName) {
			ueClient.send("getActorByName",{ name: e.area.aliasName },(data) => {
					ueClient.send('addTextPoi', {
						text: e.contentParam,
						color: e.labelColor,
						targetActorId: data.id,
						props: {
							iconType: "textLabel",
						},
					})
				})
		}else{
			const locationParam = JSON.parse(e.locationParam)
			ueClient.send('addTextPoi', {
				text: e.contentParam,
				color: e.labelColor,
				location: locationParam.location,
				props: {
					iconType: "textLabel",
					locationParam:locationParam
				},
			})
		}
	}
 })
}
// 六医院管线隐藏
export const hiddenPipeline = ()=>{
	const hideActors = ['成都六院-净水管道系统','成都六院-净化空调','成都六院-空调水系统主管道']
	hideActors.forEach((item) => {
		ueClient.send("getActorByName", { name: item }, (res) => {
			ueClient.send("hideActor", { id: res.actorId || res.id });
		});
	});
}
// 小微产业园隐藏
export const hiddenXwPanel = ()=>{
	const hideActors = ['CYY','YFXX','SQC','PCS','FRX','XQZ',
		'CYY_WK','YFXX_WK','SQC_WK','PCS_WK','XQZ_WK','CYY_2','XQZ_2',
		'YFXX_2','SQC_2','PCS_2','FRX_2','QZ_2','SLL','YWJ','XYL',
		'YFXX_1','SQC_1','PCS_1','FRX_1','XQZ_1'
	]
	hideActors.forEach(e=>{
		ueClient.send('hideActor', {id: e});
	})
}
// 设备定位视角定义
export const setSpecialCamera = async (cameraName:string,code:string)=>{
  await ueClient.saveNowViewPoint();
	let specialCamera = {}
  if (cameraName === '灭火器') {
    specialCamera = {minDistance: 10,angle: -20}
  } else  if (cameraName === '照明') {
    specialCamera = {minDistance: 500,angle: -40}
	}else if(cameraName === '摄像机'){
    specialCamera = {minDistance: 500,angle: -0}
	}else if(cameraName === '配电柜/箱'){
    specialCamera = {minDistance: 10,angle: -20}
	}else if(cameraName === '消防水压传感器'){
    specialCamera = {minDistance: 50,angle: 0}
	}else if(cameraName === '门禁'){
    specialCamera = {minDistance: 50,angle: 0,startDistance:220}
	}
  ueClient.send("focusActor", { id: code , ...specialCamera});
	ueClient.send("showShell", { id: code});

}
// 判断当前区域是否存在设备
export const determineExistenceArea = (item):boolean=>{
	const { sort } = piniaStoreMenu;
	const { deviceAreaNameList } = piniaStoreMarket;
	if (sort === 1 || window.config?.otherConfig?.isFilterArea === 'display') {
			return false;
	}
	if (deviceAreaNameList.length === 0 || 
			deviceAreaNameList.some(area => area.includes(item.name))) {
			return false;
	}
	return true;
}