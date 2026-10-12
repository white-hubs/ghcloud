<template>
	<view :class="['bottom-touch',state.popupUp&&'popup-up']">
		<view class="content-top-tabs" @touchstart.capture="touchStart" @touchmove.capture="touchMove"
			@touchend.capture="touchEnd">
			<view class="strip-bar"></view>
			<v-tabs :lineScale="0.3" @change="handleChangeFirst" :tabs="commonStore.firstLevelList.value"
				bgColor="#fbfbfb" field="name" v-model="state.activeTab"></v-tabs>
		</view>
		<view class="content-bottom">
			<scroll-view @scroll.stop v-show="commonStore.secondLevelList.value.length" class="left-select"
				scroll-y="true">
				<view @click="handleChangeSecond(item)"
					:class="['left-select-item',commonStore.secondActive.value===item.id&&'active']"
					v-for="item in commonStore.secondLevelList.value" :key="item.id">
					{{item.name}}
				</view>
			</scroll-view>
			<view class="content-right">
				<floor-select @change="handleChangeThirdRegion"
					v-if="commonStore.thirdLevelList.value.length"></floor-select>
				<view class="content-list">
					<scroll-view :scroll-into-view="commonStore.currentPointId.value" scroll-y="true" class="point-list"
						v-if="commonStore.pointList.value.length">
						<view class="list-item" :id="`point-${index}`" @click="checkedPoint(item,index)"
							v-for="(item,index) in commonStore.pointList.value" :key="item.id">
							<point-item :pointItem="item"></point-item>
						</view>
					</scroll-view>
					<view class="empty" v-else>
						<image src="http://192.168.0.243:40201/resource/cube/app-icons/empty.png"
							mode=""></image>
						<text>暂无数据</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import VTabs from '../v-tabs/v-tabs.vue'
	import {
		onMounted,
		reactive
	} from 'vue';
	import FloorSelect from './components/floor-select.vue'
	import PointItem from './components/point-item.vue'
	import {
		getRegionTreeList
	} from '../../apis/index'
	import {
		useCommonStore
	} from '../../store/index.js'
	import {
		nextTick,
	} from 'vue';
	const state = reactive({
		data: [],
		tabs: [{
				id: 1,
				name: '全部'
			},
			{
				id: 2,
				name: '蔬菜区'
			},
			{
				id: 3,
				name: '蔬菜区12'
			},
			{
				id: 4,
				name: '蔬菜区22'
			},
			{
				id: 5,
				name: '蔬菜区33'
			},
			{
				id: 6,
				name: '蔬菜区44'
			}
		],
		popupUp: false,
		firstLevelOptions: [],
		secondLevelOptions: [],
		thirdLevelOptions: [],
		activeTab: "",
	})
	const commonStore = useCommonStore()
	const emit = defineEmits(['changeRegion', 'checkedPoint'])
	const touchData = {
		startX: 0,
		startY: 0,
		endX: 0,
		endY: 0,
		touchStart: false,
		touchEnd: false,
	}
	const touchStart = (event) => {
		touchData.startX = event.touches[0].pageX
		touchData.startY = event.touches[0].pageY;
		touchData.touchStart = true
	}
	const handleChangeFirst = (item, index) => {
		commonStore.setSecondLevelList(item.children)
		commonStore.setCurrentPoint(index)
		commonStore.setFirstActive(item.id)
		commonStore.setSecondActive('')
		commonStore.setCheckedPoint({
			id: ''
		})
		emitChangeRegion(item)
	}
	const handleChangeSecond = (item) => {
		commonStore.setThirdLevelList(item.children)
		commonStore.setThirdActive('')
		commonStore.setSecondActive(item.id)
		commonStore.setCheckedPoint({
			id: ''
		})
		emitChangeRegion(item)
	}
	const handleChangeThirdRegion = (item) => {
		commonStore.setCheckedPoint({
			id: ''
		})
		emitChangeRegion(item)
	}
	//todo: tab切换动画三秒 加上延时否则卡顿严重
	const emitChangeRegion = (region) => {

		setTimeout(() => {
			emit('changeRegion', {
				region
			})
		}, 500)
	}
	const checkedPoint = (item, index) => {
		commonStore.setCheckedPoint(item)
		commonStore.setCurrentPoint(index)
		emit('checkedPoint', item)
	}
	const getList = async () => {
		const data = await getRegionTreeList()
		if (!data || !data.length) return;
		const firstItem = {
			...data[0],
			children: []
		}
		const firstLevelList = [
			firstItem,
			...data[0].children
		]
		commonStore.setFirstActive(firstItem.id)
		commonStore.setRegionTreeList(data)
		commonStore.setFirstLevelList(firstLevelList)
		emitChangeRegion(firstItem)
		nextTick(() => {
			state.activeTab = 0
		})
	}
	onMounted(() => {
		getList()
	})
	const touchMove = (event) => {
		touchData.endX = event.touches[0].pageX;
		touchData.endY = event.touches[0].pageY;
		touchData.touchEnd = true
	}
	const touchEnd = (event) => {
		if (!touchData.touchEnd) {
			return
		}
		if (!touchData.touchStart) {
			return
		}
		let direction = getSwipeDirection()

		if (direction === 'up') {
			state.popupUp = true
		} else {
			state.popupUp = false
		}
	}
	const getSwipeDirection = () => {
		const threshold = 30; // 设定一个阈值，用于判断是否是滑动
		const deltaY = touchData.endY - touchData.startY;
		touchData.touchEnd = false;
		touchData.touchStart = false
		// 如果垂直方向的位移大于水平方向，且垂直方向的位移大于阈值，则认为是垂直滑动
		if (Math.abs(deltaY) > threshold) {
			return deltaY > 0 ? 'down' : 'up';
		}
		// 其他情况视为无效滑动
		return 'none';
	}
</script>

<style lang="less" scoped>
	.bottom-touch {
		height: 600rpx;
		background: #fff;
		border-radius: 24rpx 24rpx 0 0;
		transition: height 0.2s ease;
		background: #fbfbfb;

		.content-right {
			height: 500rpx;

			.content-list {
				margin-top: 20rpx;
				padding: 0 28rpx;
				height: 400rpx;
				padding-bottom: 100rpx;

				::-webkit-scrollbar {
					display: none;
					width: 0;
					height: 0;
					color: transparent;
				}

				.point-list {
					height: 400rpx;

					.list-item {
						&:last-child {
							margin-bottom: 100rpx;
						}
					}
				}

				.empty {
					margin-top: 50rpx;
					padding: 30rpx;
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
					gap: 10rpx;
					font-size: 26rpx;

					image {
						width: 120rpx;
						height: 120rpx;
					}
				}
			}


		}

		// transform: ;
		// transition: ;
		.strip-bar {
			width: 80rpx;
			height: 8rpx;
			background: #dbdbdb;
			border-radius: 4rpx;
			margin: 0 auto;
			margin-bottom: 8rpx;
		}

		.content-top-tabs {
			padding: 24rpx 0;
		}

		.content-bottom {
			height: 500rpx;
			display: flex;
			background: #fff;

			.content-right {
				position: relative;
				flex: 1;
			}

			.left-select {
				width: 168rpx;
				text-align: center;
				flex-shrink: 0;
				height: calc(100% - 50rpx);
				background: #F2F2F2;
				padding-bottom: 50rpx;

				.left-select-item {
					padding: 26rpx 32rpx;
					color: #1f3140;
					font-size: 26rpx;

					&.active {
						background: #006b3a;
						color: #FFF;
					}
				}
			}
		}
	}

	.popup-up {
		height: 1000rpx;

		.content-bottom {
			height: 900rpx;

			::-webkit-scrollbar {
				display: none;
				width: 0;
				height: 0;
				color: transparent;
			}

			.content-list {

				.point-list {
					height: 800rpx;
					height: 800rpx;
				}
			}
		}
	}
</style>