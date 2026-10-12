<template>
	<view class="container">
		<search-bar @setMapCenter="setMapCenter" @setMapScale="setMapScale"></search-bar>
		<region-bar @setMapCenter="setMapCenter" @setMapScale="setMapScale"></region-bar>
		<map id="myMap" ref="myMap" style="width: 100%; height: 100vh;" @callouttap="handleNav"
			:longitude="state.mapState.center.longitude" :latitude="state.mapState.center.latitude" :show-location="true"
			:markers="state.markers" :scale="state.mapState.scale">
			<cover-view slot="callout">
				<block v-for="(item,index) in state.markers" :key="index">
					<cover-view class="customCallout" :marker-id="item.id">
						<cover-view
							style="display: flex;align-items: flex-start;padding: 12rpx;justify-content: space-between; align-items: center;width: 500rpx;">
							<cover-view class="content">
								<cover-view class="title">
									{{item.name}}
								</cover-view>
								<cover-view class="desc">地址: {{item.address}}</cover-view>
								<cover-view class="desc">介绍:
									{{item.remarks.length>17?`${item.remarks.slice(0,16)}...`:item.remarks}}
								</cover-view>
							</cover-view>
							<cover-view class="nav-handle">
								<cover-image class="nav-png" src="../../static/images/nav.png"></cover-image>
								<cover-view>导航前往</cover-view>
							</cover-view>
						</cover-view>
					</cover-view>
				</block>
			</cover-view>

		</map>
	</view>
</template>

<script setup>
import {
	reactive,
	onMounted,
	nextTick
} from 'vue'
import SearchBar from '../../components/search-bar/index.vue'
import RegionBar from '../../components/region-bar/index.vue'
import {
	onShareAppMessage,
	onLoad
} from '@dcloudio/uni-app';
import { baseService } from '../../service'
import {
	getUsingLayer,
	getPointList
} from '../../apis/index.ts'
let initCenter = ''
const state = reactive({
	mapState: {
		center: {
			longitude: 117.2008,
			latitude: 39.0842
		},
		scale: 17

	},
	markers: [{
		id: 12,
		latitude: 39.0842,
		longitude: 117.2008,
		width: 30,
		height: 38,
		zIndex: '999',
		iconPath: '../../static/images/location.png',
		joinCluster: true,
		remarks: '1212',
		customCallout: {
			display: 'BYCLICK'
		}
	}]
})
const setMapScale = (scale) => {
	state.mapState.scale = scale
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
	const marker = state.markers.find(item => item.id === markerId)
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
const initMapLayer = async () => {
	const data = await getUsingLayer()
	if (!data) return; 
	const mapCtx = uni.createMapContext('myMap')
	setMapCenter(data.center)
	initCenter = data.center
	const southwestLatLong = getLatLong(data.southwest)
	const northeastLatLong = getLatLong(data.northeast)
	mapCtx.addGroundOverlay({
		id: 1,
		src: baseService + data.layerFile,
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
		},
		fail: (err) => {
		},
		complete: (res) => {
		}
	})

}
const getPoints = async () => {
	const 
		data
	 = await getPointList('')
	const records = data.records;
	state.markers = records.map(item => {
		const itemLatLong = getLatLong(item.coordinate)
		return {
			id: Number(item.id),
			latitude: itemLatLong.latitude,
			longitude: itemLatLong.longitude,
			width: 20,
			height: 28,
			zIndex: '999',
			iconPath: '../../static/images/location.png',
			joinCluster: true,
			name: item.name,
			address: item.address,
			areaName: item.areaName,
			remarks: item.remarks,
			customCallout: {
				display: 'BYCLICK'
			}
		}
	})
}
onMounted(() => {
	getPoints()
	initMapLayer()
})
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

	.content {
		display: flex;
		flex-direction: column;
		width: 260rpx;

		.title {
			font-size: 30rpx;
			color: #222;
			font-weight: 600;

		}

		.desc {
			margin-top: 20rpx;
			font-size: 26rpx;
			width: 250rpx;
			display: -webkit-box;
			white-space: normal; //换行
			overflow: hidden;
			text-overflow: ellipsis;
			word-break: break-all;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2; //行数
		}


	}

	.nav-handle {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		margin-left: 80rpx;
		color: #ff6600;
		font-size: 26rpx;

		.nav-png {
			width: 26rpx;
			margin-right: 10rpx;
			height: 26rpx;
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
// }</style>