<template>
	<view class="floor-select">
		<scroll-view :scroll-into-view="state.viewId" class="floor-select-list" scroll-x="true">
			<view :id="`floor-${index}`" @click="handleClick(item,index)"
				v-for="(item,index) in commonStore.thirdLevelList.value" :key="item.id"
				:class="['list-item',item.id===commonStore.thirdActive.value&&'active']">{{item.name}}</view>
		</scroll-view>
		<view class="triangle-container" @click.stop="handleMore">
			<view class="triangle">
			</view>
		</view>
		<view class="bg-container" v-show="state.showMore">
			<view class="floor-list">
				<view :class="[item.id===commonStore.thirdActive.value&&'active','floor-item']"
					@click="handleClick(item,index)" v-for="(item,index) in commonStore.thirdLevelList.value"
					:key="item.id">
					{{item.name}}
				</view>
			</view>
		</view>

	</view>
</template>

<script setup>
	import {
		reactive
	} from 'vue'
	import {
		useCommonStore
	} from '../../../store/index.js'
	const commonStore = useCommonStore()
	const emit = defineEmits(['change'])
	const state = reactive({
		showMore: false,
		viewId: 'floor-0'
	})
	const handleClick = (item, index) => {
		state.viewId = `floor-${index}`
		commonStore.setThirdActive(item.id)
		emit('change', item)
	}
	const handleMore = () => {
		state.showMore = !state.showMore
	}
</script>

<style lang="less" scoped>
	.floor-select {
		width: 100%;
	}

	.triangle-container {
		width: 60rpx;
		height: 80rpx;
		display: inline-block;
		background: rgba(255, 255, 255, 0.70);
		position: relative;
		box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.03);

		.triangle {
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			margin-top: 70%;
			width: 0;
			height: 0;
			border-left: 10rpx solid transparent;
			border-right: 10rpx solid transparent;
			border-top: 10rpx solid #d0ddea;
		}
	}

	.bg-container {
		position: absolute;
		top: 109rpx;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.30);

		.floor-list {
			display: grid;
			grid-template-columns: 1fr 1fr 1fr;
			gap: 20rpx;
			// justify-content: flex-start;
			// /* 强制换行 */
			// flex-wrap: wrap;
			background: #fff;
			padding: 0 60rpx 0 32rpx;
			padding-bottom: 24rpx;

			.floor-item {
				padding: 16rpx;
				background: #f2f2f2;
				text-align: center;
				border-radius: 8rpx;
				font-size: 28rpx;
				font-family: Source Han Sans CN, Source Han Sans CN-Regular;
				font-weight: Regular;
				color: #1f3140;

				&.active {
					background: #e1f4e9;
					color: #006b3a;
				}
			}

		}
	}

	.floor-select-list {
		// flex: 1;
		display: inline-block;
		width: 80%;
		white-space: nowrap;
		padding: 14rpx 20rpx;

		.list-item {
			font-size: 12px;
			display: inline-block;
			margin-right: 24rpx;
			font-family: Source Han Sans CN, Source Han Sans CN-Regular;
			font-weight: Regular;
			text-align: left;
			color: #1f3140;
			padding: 12rpx 32rpx;
			background: #f8f8f8;
			border-radius: 4px;

			&.active {
				background: #e1f4e9;
				color: #006b3a;
			}
		}
	}
</style>