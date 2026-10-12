<template>
	<view class="container">
		<search-bar @search="handleSearch"></search-bar>
		<type-select-bar @checkedType="handleChangeType"></type-select-bar>
		<map :min-scale="15.5" id="myMap" ref="myMap" style="width: 100%; height: 100vh;" @callouttap="handleNav"
			:longitude="state.mapState.center.longitude" :latitude="state.mapState.center.latitude"
			:show-location="true" @labeltap="handleClickMarker" @markertap="handleClickMarker" :markers="state.markers"
			:scale="state.mapState.scale">
			<!--  -->
			<cover-view slot="callout">
				<block v-for="(item,index) in state.pointMarkers" :key="index">
					<cover-view class="customCallout" :marker-id="item.id">
						<cover-view
							style="display: flex;align-items: center;padding: 12rpx;justify-content: space-between; align-items: center;width: 600rpx;">
							<cover-image class="merchant-png" v-if="item.filePath" :src="item.filePath"></cover-image>
							<cover-image v-else src="../../static/images/default-merchant.png"
								class="merchant-png"></cover-image>
							<cover-view class="content">
								<cover-view class="title">
									{{item.name}}
								</cover-view>
								<cover-view class="desc">
									<cover-image class="icon" src="../../static/images/area-icon.png"></cover-image>
									<cover-view>{{item.areaName}}</cover-view>
								</cover-view>
								<cover-view class="desc">
									<cover-image class="icon" src="../../static/images/address-icon.png"></cover-image>
									<cover-view>{{item.address}}</cover-view>
								</cover-view>
							</cover-view>
							<cover-view class="nav-handle">
								<cover-image class="nav-png" src="../../static/images/nav.png"></cover-image>
								<cover-view>到这去</cover-view>
							</cover-view>
						</cover-view>
					</cover-view>
				</block>
			</cover-view>

		</map>
		<bottom-container @backMapCenter="handleBackMapCenter" @changeRegion="handleChangeRegion"
			@checkedPoint="handleCheckedPoint"></bottom-container>
	</view>
</template>

<script setup>
	import {
		reactive,
		onMounted,
		nextTick
	} from 'vue'
	import SearchBar from '../../components/search-bar/index.vue'
	import {
		serviceUrl
	} from '../../service/index'
	import {
		onShareAppMessage,
		onLoad
	} from '@dcloudio/uni-app';
	import {
		getUsingLayer,
		getPointList,
		getRegionTreeList,
	} from '../../apis/index.ts'
	import {
		globalData,
		findParentsById
	} from '../../utils/index.js'
	import TypeSelectBar from '../../components/type-select-bar/index.vue'
	import BottomContainer from '../../components/bottom/bottom-container.vue'
	import {
		useCommonStore
	} from '../../store/index.js'
	let initCenter = ''
	let keyword = ''
	const commonStore = useCommonStore()
	const state = reactive({
		mapState: {
			center: {
				longitude: 104.020175,
				latitude: 30.564616
			},
			scale: 17
		},
		minScale: 15.5,
		region: '',
		mapCtx: null,
		hasOverLay: false,
		typeId: '',
		regionSelected: {
			region: null,
			regions: [],
		},
		markers: [{
			id: 12,
			latitude: 30.564616,
			longitude: 104.020175,
			width: 30,
			height: 38,
			zIndex: '999',
			iconPath: '../../static/images/location.png',
			joinCluster: false,
			remarks: '1212',
			customCallout: {
				display: 'BYCLICK'
			}
		}],
		pointMarkers: [{
			id: 12,
			latitude: 30.564616,
			longitude: 104.020175,
			width: 30,
			height: 38,
			zIndex: '999',
			iconPath: '../../static/images/location.png',
			joinCluster: false,
			remarks: '1212',
			customCallout: {
				display: 'BYCLICK'
			}
		}]
	})
	const setMapScale = (scale) => {
		state.mapState.scale = scale
	}
	const handleCheckedPoint = (point) => {
		setMapCenter(point.coordinate)
		setMapScale(20)
		state.markers = state.markers.map(item => {
			return {
				...item,
				customCallout: {
					display: item.originId === point.id ? 'ALWAYS' : 'BYCLICK'
				}
			}
		})
	}
	const handleBackMapCenter = () => {
		const region = commonStore.currentRegion.value
		state.mapCtx.getCenterLocation({
			success: (res) => {
				state.mapState.center = {
					latitude: res.latitude,
					longitude: res.longitude
				}
				nextTick(() => {
					if (!region) return;
					if (region.id === state.region) {
						setMapCenter()
					} else {
						setMapCenter(region.coordinate)
						setMapScale(region.scale)
					}
				})
			}
		})


	}
	const handleSearch = (value) => {
		keyword = value
		commonStore.setCurrentPoint(-1);
		commonStore.setCheckedPoint({
			id: ''
		})
		getPoints()
	}
	const handleClickMarker = (e) => {
		const markerId = e.detail.markerId
		const area = state.markers.find(item => item.id === markerId)
		if (area.type === 'area') {
			const firstRegion = commonStore.regionTreeList.value[0]
			if (!firstRegion) return
			const region = firstRegion.children.find(item => item.id === area.originId)
			if (!region) return;
			const parents = findParentsById(commonStore.regionTreeList.value, region.id)
			const regions = parents ? [...parents, region] : [region]
			state.regionSelected = {
				region,
				regions
			}
			handleChangeRegion({
				region
			})
		}
	}
	const handleChangeRegion = async (selected) => {
		if (state.region === selected.region.id) return;
			state.region = selected.region.id
		await getPoints()
		await initMapLayer(selected.region)
		commonStore.setCurrentRegion(selected.region)
		setMapScale(selected.region.zoom)
		setMapCenter(selected.region.coordinate)
	}
	const handleChangeType = (item) => {
		if (state.typeId === item.id) return;
		state.typeId = item.id
		getPoints()
	}
	onShareAppMessage((res) => {
		if (res.from === 'button') {
			const item = res.target.dataset.info
			return {
				title: `点位${item.name}`,
				path: `/pages/index/index?coordinate=${item.coordinate}`
			}
		}
	});
	onLoad((Option) => {
		const {
			coordinate
		} = Option
		if (coordinate) {
			setTimeout(() => {
				setMapScale(20)
				setMapCenter(coordinate)
			}, 2000)
		}
	})
	const handleNav = (e) => {
		const {
			markerId
		} = e.detail
		const marker = state.pointMarkers.find(item => item.id === markerId)
		uni.openLocation({
			latitude: Number(marker.latitude),
			longitude: Number(marker.longitude),
			name: marker.name,
			scale: 15,
			address: marker.address
		})
	}
	const setMapCenter = (centerString) => {
		const centerLatLong = centerString ? getLatLong(centerString) : getLatLong(initCenter)
		state.mapState.center.latitude = centerLatLong.latitude
		state.mapState.center.longitude = centerLatLong.longitude
	}
	const getLatLong = (latLongString) => {
		return {
			latitude: latLongString.split(/[\t\r\f\n\s]*/g).join('').split(',')[0],
			longitude: latLongString.split(/[\t\r\f\n\s]*/g).join('').split(',')[1]
		}
	}
	const initMapLayer = async (region) => {
		const data = await getRegionLayer(region)
		if (!data) return;
		const mapCtx = !state.mapCtx ? uni.createMapContext('myMap') : state.mapCtx
		state.mapCtx = mapCtx
		setMapCenter(data.center)
		setMapBoundary()
		initCenter = data.center
		const southwestLatLong = getLatLong(data.southwest)
		const northeastLatLong = getLatLong(data.northeast)
		if (!state.hasOverLay) {
			mapCtx.addGroundOverlay({
				id: 1,
				src: data.layerFile,
				zIndex: 10,
				bounds: {
					southwest: {
						longitude: southwestLatLong.longitude,
						latitude: southwestLatLong.latitude
					},
					northeast: {
						longitude: northeastLatLong.longitude,
						latitude: northeastLatLong.latitude
					}
				},
				success: (res) => {
					state.hasOverLay = true
				},
				fail: (err) => {
				},
				complete: (res) => {
				}
			})
		} else {
			mapCtx.updateGroundOverlay({
				id: 1,
				src: data.layerFile,
				zIndex: 10,
				bounds: {
					southwest: {
						longitude: southwestLatLong.longitude,
						latitude: southwestLatLong.latitude
					},
					northeast: {
						longitude: northeastLatLong.longitude,
						latitude: northeastLatLong.latitude
					}
				},
				success: (res) => {
					state.hasOverLay = true
				},
				fail: (err) => {
				},
				complete: (res) => {
				}
			})
		}



	}
	const setMapBoundary = () => {
		const northeast = {
			longitude: 104.033211,
			latitude: 30.570677
		}
		const southwest = {
			longitude: 104.009815,
			latitude: 30.558826
		}
		state.mapCtx.setBoundary({
			southwest,
			northeast,
			success: () => {
			},
			fail: (error) => {
			}
		})
	}
	const getRegionLayer = async (region) => {
		const data = await getUsingLayer({
			areaId: region.id
		})
		if (!data) {
			if (!region.parentId) {
				return null
			}
			const parentRegion = findItemById(commonStore.regionTreeList.value, region.parentId)
			return await getRegionLayer(parentRegion)
		}
		return data
	}
	const findItemById = (data, id) => {
		for (let i = 0; i < data.length; i++) {
			let item = data[i];
			if (item.id === id) {
				return item;
			} else {
				// item.children 不等于 undefined && item.children.length 大于 0 时
				if (item.children && item.children.length > 0) {
					let res = findItemById(item.children, id);
					// 当 res = undefined 时不会进入判断中
					// 也就是不会return
					if (res) return res;
				}
			}
		}
	};
	const getPoints = async () => {
		const data = await getPointList({
			keyword,
			areaId: state.region,
			typeId: state.typeId
		})
		const records = data.records;
		const pointList = records.map(item => {
			return {
				...item,
				filePath: (!item.filePath.includes('http') && item.filePath) ? serviceUrl + item
					.filePath : item
					.filePath,
				typeFilePath: (!item.typeFilePath.includes('http') && item.typeFilePath) ? serviceUrl +
					item
					.typeFilePath : item
					.typeFilePath,
			}
		})
		const pointMarkers = records.map(item => {
			const itemLatLong = getLatLong(item.coordinate)
			return {
				id: Number(item.id),
				latitude: itemLatLong.latitude,
				longitude: itemLatLong.longitude,
				width: 24,
				height: 24,
				zIndex: '999',
				originId: item.id,
				type: 'point',
				label: {
					content: item.name,
					anchorX: 10,
					anchorY: -25,
					padding: 5
				},
				iconPath: (!item.typeFilePath.includes('http') && item.typeFilePath) ? serviceUrl +
					item
					.typeFilePath : item
					.typeFilePath,
				joinCluster: false,
				name: item.name,
				address: item.address,
				areaName: item.areaName,
				filePath: (!item.filePath.includes('http') && item.filePath) ? serviceUrl + item
					.filePath : item
					.filePath,
				remarks: item.remarks,
				customCallout: {
					display: 'BYCLICK'
					// display: 'ALWAYS'
				}
			}
		})
		state.pointMarkers = [...pointMarkers];
		const firstRegion = commonStore.regionTreeList.value[0]
		// 全部区域没有直接return
		if (!firstRegion) {
			state.markers = [...pointMarkers]
			commonStore.setPointList([...pointList])
			return
		};
		// 不为全部不获取区域点位放入markers
		if (state.region !== firstRegion.id || state.typeId !== '') {
			state.markers = [...pointMarkers]
			commonStore.setPointList([...pointList])
			return
		}
		const areaMarkers = firstRegion.children.map(item => {
			const itemLatLong = getLatLong(item.coordinate)
			return {
				id: Number(item.id),
				latitude: itemLatLong.latitude,
				longitude: itemLatLong.longitude,
				originId: item.id,
				width: 24,
				height: 24,
				zIndex: '999',
				type: 'area',
				label: {
					content: item.name,
					anchorX: 10,
					anchorY: -25,
					padding: 5
				},
				iconPath: 'https://minio-test.guhecloud.com:30000/guhecloud-prod-mdata/1838466564291039234.png',
				joinCluster: false,
				name: item.name,
			}
		})
		state.markers = [...pointMarkers, ...areaMarkers]
		commonStore.setPointList([...pointList])
	}
</script>

<style lang="less">
	page {
		height: 100%;
	}


	.container {
		height: 100%;
	}

	.customCallout {
		background: #fff;
		padding: 10rpx 12rpx;
		border-radius: 8rpx;
		display: flex;
		align-items: center;

		.flex {
			display: flex;
			align-items: flex-start;
		}

		.merchant-png {
			width: 120rpx;
			height: 120rpx;
			flex-shrink: 0;
			margin-right: 20rpx;
		}

		.content {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			width: 260rpx;

			.title {
				font-size: 30rpx;
				color: #222;
				font-weight: 600;

			}

			.desc {
				display: flex;
				margin-top: 12rpx;
				align-items: center;
				font-size: 24rpx;
				font-family: Source Han Sans CN, Source Han Sans CN-Regular;
				font-weight: Regular;
				text-align: justify;
				color: #7c8380;

				.icon {
					width: 20rpx;
					margin-right: 8rpx;
					height: 20rpx;
				}

			}


		}

		.nav-handle {
			display: flex;
			flex-shrink: 0;
			align-items: center;
			margin-left: 80rpx;
			padding: 16rpx;
			background: #006B3A;
			border-radius: 12rpx;
			color: #fff;
			font-size: 24rpx;


			.nav-png {
				width: 20rpx;
				margin-right: 10rpx;
				height: 24rpx;
				vertical-align: middle;
			}
		}

		// box-sizing: border-box;
		// background-color: #fff;
		// border: 1px solid #ccc;
		// border-radius: 30px;
		// width: 150px;
		// height: 40px;
		// display: inline-flex;
		// padding: 5px 20px;
		// justify-content: center;
		// align-items: center;
	}

	// .content {
	// 	flex: 0 1 auto;
	// 	margin: 0 10px;
	// 	font-size: 14px;
	// }
</style>