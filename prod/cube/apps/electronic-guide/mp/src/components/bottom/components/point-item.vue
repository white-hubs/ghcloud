<template>
	<view :class="['point-item',commonStore.checkedPoint.value===props.pointItem.id&&'active']" :style="{
		background:props.background
	}">
		<image class="merchant-png" v-if="props.pointItem&&props.pointItem.filePath" :src="props.pointItem.filePath">
		</image>
		<image v-else src="../../static/images/default-merchant.png" class="merchant-png"></image>
		<view class="content">
			<view class="title">
				{{pointItem.name}}
			</view>
			<view class="address">
				<image class="icon" src="../../static/images/area-icon.png"></image>
				<text>{{pointItem.areaName}}</text>
			</view>
			<view class="address">
				<image class="icon" src="../../static/images/address-icon.png"></image>
				<text>{{pointItem.address}}</text>
			</view>
		</view>
		<view class="right" v-if="props.showRight">
			<view class="share">
				<image src="../../../static/images/share.png"></image>
				<button style="margin-right: 0;" class="share-btn" open-type="share" :data-info="pointItem">分享</button>
			</view>
			<view class="right-nav" @click="handleNav">
				<image class="nav-png" src="../../static/images/nav.png"></image>
				<view>到这去</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		useCommonStore
	} from '../../../store/index.js'
	const props = defineProps({
		pointItem: {
			type: Object,
			default: () => {}
		},
		background: {
			type: String,
			default: () => 'rgba(248,248,248,0.70)'
		},
		showRight: {
			type: Boolean,
			default: () => true
		}
	})
	const commonStore = useCommonStore()
	const getLatLong = (latLongString) => {
		return {
			latitude: latLongString.split(/[\t\r\f\n\s]*/g).join('').split(',')[0],
			longitude: latLongString.split(/[\t\r\f\n\s]*/g).join('').split(',')[1]
		}
	}
	const handleNav = () => {
		const latLong = getLatLong(props.pointItem.coordinate)
		uni.openLocation({
			latitude: Number(latLong.latitude),
			longitude: Number(latLong.longitude),
			name: props.pointItem.name,
			scale: 15,
			address: props.pointItem.address
		})
	}
	
</script>

<style lang="less" scoped>
	.point-item {
		display: flex;
		margin-bottom: 20rpx;
		align-items: flex-start;
		background: #f8f8f8;
		border-radius: 8px;
		padding: 24rpx;
		font-size: 26rpx;
		box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.16);
		border: 1px solid #f8f8f8;

		&.active {
			border: 1px solid #006b3a;
			border-radius: 8px;
		}

		.merchant-png {
			width: 120rpx;
			height: 120rpx;
			flex-shrink: 0;
			margin-right: 20rpx;
		}


		.content {
			flex: 1;
			display: flex;
			height: 120rpx;
			flex-direction: column;
			justify-content: space-between;

			.title {
				color: #222;
				font-size: 28rpx;
				font-family: Source Han Sans CN, Source Han Sans CN-Medium;
				font-weight: Medium;
			}

			.address {
				display: flex;
				align-items: center;
				font-family: Source Han Sans CN, Source Han Sans CN-Regular;
				font-weight: Regular;
				color: #7c8380;
				font-size: 20rpx;

				.icon {
					width: 20rpx;
					height: 20rpx;
					margin-right: 12rpx;
				}
			}

		}

		.right {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			align-items: flex-end;
			height: 120rpx;

			.share {
				display: flex;
				align-items: center;
				gap: 4rpx;

				image {
					width: 28rpx;
					height: 28rpx;
				}

				.share-btn {
					font-size: 24rpx;
					color: #006B3A;
					padding: 0;
					background-color: transparent;
					border-radius: 0;
					margin-right: 0 !important;
					margin-left: auto;
					line-height: initial;

					&::after {
						border: none;
					}

				}
			}



			.right-nav {
				display: flex;
				flex-shrink: 0;
				align-items: center;
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
		}

	}
</style>