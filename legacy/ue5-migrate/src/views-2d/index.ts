import { requestDeviceList } from "@/utils/requestData/basicData"
import { DeviceTypeIcon, DeviceStatusCode } from "@/utils/enumeratie"
import { getAssetsImage } from "@/utils/getImage";
import gearData from "@/utils/gear.json"
import {UeClient} from "@ghcloud/cube-visual-sdk";

const ueClient = UeClient.getInstance();

/** 批量打设备图标 */
export async function batchAddDeviceIcon() {
	ueClient.send('removePoiByProps', {
		props: {
			iconType: 'device',
		}
	});
	let deviceList = []
	await Promise.all([
		requestDeviceList({ businessType: 'DEVICE_TYPE' }).then((res) => { deviceList = [...deviceList, ...res] }),
		requestDeviceList({ businessType: 'DEVICE' }).then((res) => { deviceList = [...deviceList, ...res] })
	])
	let list = [...new Set(deviceList)];
	const groupList = setBatchgroup(list);
	if (groupList.length) {
		let deviceListPio = groupList[0].map((item: { code: any; genreName: string | number; status: any; id: any; genreId: any })=>{
			return {
				targetActorId: item.code,
				icon: DeviceTypeIcon[item.genreName],
				color: DeviceStatusCode[item.status??'NORMAL'],
				scale: window.config?.iconScale?window.config.iconScale:1,
				props: {
					iconType: 'device',
					actorId:item.code,
					id: item.id,
					code: item.code,
					genreId: item.genreId,
				}
			}
		})
		ueClient.send("addIconPoiBatch", { pois: deviceListPio })
	}
}
/** 批量打档位图标 */
export function batchAddGearIconPio(modalNames: string) {
	ueClient.send('removePoiByProps', {
		props: {
			iconType: 'gear',
		}
	});
	let list = gearData.gearArray.filter(item => item.area === modalNames);
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
					name: item.name
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

const bgImgData = {
	'儿童医院':{
		parkDay:getAssetsImage('overView59.png'),
		parkNight:getAssetsImage('overView62.png'),
    buildingDay:getAssetsImage('overView58.png'),
    buildingNight:getAssetsImage('overView61.png'),
	},
	'中亿丰':{
		parkDay:getAssetsImage('overView67.png'),
		parkNight:getAssetsImage('overView67.png'),
    buildingDay:getAssetsImage('overView67.png'),
    buildingNight:getAssetsImage('overView67.png'),
	},
	'高县':{
		parkDay:getAssetsImage('overView68.png'),
		parkNight:getAssetsImage('overView68.png'),
    buildingDay:getAssetsImage('overView68.png'),
    buildingNight:getAssetsImage('overView68.png'),
	},
	'南沙':{
		parkDay:getAssetsImage('overView69.png'),
		parkNight:getAssetsImage('overView69.png'),
    buildingDay:getAssetsImage('overView69.png'),
    buildingNight:getAssetsImage('overView69.png'),
	},
	'鹏程小学':{
		parkDay:getAssetsImage('overView70.png'),
		parkNight:getAssetsImage('overView70.png'),
    buildingDay:getAssetsImage('overView70.png'),
    buildingNight:getAssetsImage('overView70.png'),
	},
	'福州广汇':{
		parkDay:getAssetsImage('overView71.png'),
		parkNight:getAssetsImage('overView71.png'),
    buildingDay:getAssetsImage('overView71.png'),
    buildingNight:getAssetsImage('overView71.png'),
	},
	'太子湾':{
		parkDay:getAssetsImage('overView72.png'),
		parkNight:getAssetsImage('overView72.png'),
    buildingDay:getAssetsImage('overView72.png'),
    buildingNight:getAssetsImage('overView72.png'),
	},
	'白鹅潭':{
		parkDay:getAssetsImage('overView74.png'),
		parkNight:getAssetsImage('overView74.png'),
    buildingDay:getAssetsImage('overView73.png'),
    buildingNight:getAssetsImage('overView73.png'),
	}
}

export function getBgImg(params:string) {
	if (params) {
		return bgImgData[params]
	}
}