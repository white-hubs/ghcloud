<template>
	<view class="search-bar">
		<view class="container">
			<image src="/static/images/search.png" mode=""></image>
			<input type="text" v-model="state.keyword" placeholder="搜索">
			<view class="search-button" @click.stop="handleSearch">
				搜索
			</view>
		</view>
		<popup ref="popupRef" type="bottom" radius="20rpx">
			<image src="../../static/images/close.png" mode="" class="close" @click.stop="handleClose"></image>
			<scroll-view scroll-y="true" :lower-threshold="30" @scrolltolower="scrollBottom"
				style="max-height: 600rpx;">
				<view class="search-list" v-if="state.pointList.length">
					<view class="item" v-for="item in state.pointList" :key="item.id" @click="handleClickItem(item)">
						<view class="content">
							<view class="title">
								{{item.name}}
							</view>
							<view class="address">
								<text>地址:</text>
								<text>{{item.address}}</text>
							</view>
							<view class="address">
								<text>介绍:</text>
								<text>{{item.remarks}}</text>
							</view>
						</view>
						<view class="right">
							<button open-type="share" :data-info="item">分享</button>
							<view class="nav" @click="handleNav(item)">
								<view class="text">
									导航前往
								</view>
							</view>
						</view>

					</view>

				</view>
				<view class="empty" v-else>
					<image
						src="https://gw.alipayobjects.com/mdn/miniapp_social/afts/img/A*pevERLJC9v0AAAAAAAAAAABjAQAAAQ/original"
						mode=""></image>
					<text>暂无数据</text>
				</view>


			</scroll-view>
		</popup>
	</view>
</template>

<script setup>
	import {
		reactive,
		ref,
		defineEmits
	} from 'vue'

	import {
		getPointList
	} from '../../apis/index'
	import popup from '../popup/index.vue'
	const popupRef = ref(null)
	const emit = defineEmits(['setMapCenter', 'setMapScale'])
	const state = reactive({
		visible: false,
		pointList: [],
		keyword: ''
	})
	const getLatLong = (latLongString) => {
		return {
			latitude: latLongString.split(/[\t\r\f\n\s]*/g).join('').split(',')[0],
			longitude: latLongString.split(/[\t\r\f\n\s]*/g).join('').split(',')[1]
		}
	}
	const handleClickItem = (item) => {
		emit('setMapCenter', item.coordinate)
		emit('setMapScale', 20)
	}
	const handleNav = (item) => {
		const latLong = getLatLong(item.coordinate)
		uni.openLocation({
			latitude: Number(latLong.latitude),
			longitude: Number(latLong.longitude),
			name: item.name,
			scale: 15,
			address: item.address
		})
	}

	const handleSearch = async () => {
		const 
			data
		 = await getPointList(state.keyword)
		state.pointList = data.records
		popupRef.value.open()
	}
	const scrollBottom = async () => {
	}
	const handleClose = () => {
		popupRef.value.close()
	}
</script>

<style lang="less" scoped>
	.close {
		position: absolute;
		right: 20rpx;
		top: 20rpx;
		width: 40rpx;
		height: 40rpx;
		z-index: 99999;
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

	.search-list {
		margin-top: 60rpx;
		padding: 20rpx;

		.item {
			display: flex;
			margin-bottom: 20rpx;
			align-items: flex-start;
			border-radius: 12rpx;
			box-shadow: 0rpx 0rpx 6rpx 0rpx rgba(0, 0, 0, 0.4);
			padding: 16rpx 20rpx;
			font-size: 26rpx;

			.item-png {
				height: 160rpx;
				width: 200rpx;
				border-radius: 6rpx;
			}

			.content {
				flex: 1;
				display: flex;
				flex-direction: column;
				height: 160rpx;
				justify-content: space-between;

				.title {
					color: #222;
					font-size: 30rpx;
				}

				.address {
					display: flex;
					align-items: center;
				}

			}

			.right {
				display: flex;
				flex-direction: column;
				height: 160rpx;
				justify-content: space-between;
				button{
					font-size: 24rpx;
					background: #ff6600;
					color: #fff;
				}
				.nav {
					display: flex;
					flex-direction: column;
					align-items: flex-end;

					.text {
						color: #ff6600;
					}
				}
			}

		}

	}

	.search-bar {
		position: fixed;
		top: 20rpx;
		z-index: 10;
		width: 100%;

		.container {
			width: 80%;
			margin: 0 auto;
			padding: 16rpx 10rpx;
			background: #fff;
			display: flex;
			align-items: center;
			border-radius: 40rpx;
			gap: 20rpx;
			box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.4);

			image {
				width: 40rpx;
				height: 40rpx;
				margin-left: 20rpx;
			}

			input {
				flex: 1;
				font-size: 24rpx;
			}

			.search-button {
				padding: 10rpx 20rpx;
				border: 1rpx solid #ff6600;
				color: #ff6600;
				border-radius: 30rpx;
				font-size: 24rpx;
			}
		}
	}
</style>