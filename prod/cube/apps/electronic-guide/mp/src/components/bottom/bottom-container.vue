<template>
	<view class="bottom-container" catchtouchmove="true">
		<view class="handle">
			<view class="handle-current-location" @click="handleBackMapCenter">
				<image class="location-icon" src="../../static/images/current-location.png"></image>
			</view>
			<view class="handle-bootom" @click="handleChangeBottomType">
				<image v-if="state.bottomType==='full-map'" src="../../static/images/botton-list.png"></image>
				<image v-else src="../../static/images/botton-enlarge.png"></image>
				<text>
					{{state.bottomType==='full-map'?'回列表':'大地图'}}
				</text>
			</view>
		</view>
		<bottom-swiper v-if="state.bottomType==='full-map'" @checkedPoint="checkedPoint"></bottom-swiper>
		<bottom-list v-if="state.bottomType!=='full-map'" @checkedPoint="checkedPoint"
			@changeRegion="handleChangeRegion"></bottom-list>
	</view>
</template>

<script setup>
	import {
		reactive
	} from 'vue';
	import BottomList from './bottom-list.vue'
	import BottomSwiper from './bottom-swiper.vue'
	const state = reactive({
		bottomType: 'list'
	})
	const emit = defineEmits(['changeRegion', 'checkedPoint'])
	const handleChangeBottomType = () => {
		if (state.bottomType === 'list') {
			state.bottomType = 'full-map'
			return;
		}
		state.bottomType = 'list'
	}
	const handleBackMapCenter=()=>{
		emit('backMapCenter')
	}
	const handleChangeRegion = (region) => {
		emit('changeRegion', region)
	}
	const checkedPoint = (item) => {
		// checkedPoint()
		emit('checkedPoint', item)
	}
</script>

<style lang="less" scoped>
	.bottom-container {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 9999;

		.handle {
			display: flex;
			padding: 0 24rpx;
			justify-content: space-between;
			align-items: flex-end;
			margin-bottom: 12rpx;
		
			.handle-current-location{
				padding:12rpx 18rpx 18rpx;
				background: #fff;
				border-radius: 16rpx;
				.location-icon{
					width: 40rpx;
					height: 40rpx;
					vertical-align: middle;
				}
			}


			.handle-bootom {
				background: #006b3a;
				display: flex;
				align-items: center;
				gap: 6rpx;
				border-radius: 6px;
				box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.20);
				padding: 14rpx;
				font-size: 24rpx;
				font-family: Source Han Sans CN, Source Han Sans CN-Regular;
				font-weight: Regular;
				text-align: left;
				color: #ffffff;

				image {
					width: 22rpx;
					height: 22rpx;
				}
			}
		}

	}
</style>