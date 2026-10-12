<template>
	<view class="bottom-swiper">
		<swiper class="swiper" active-class="active-swiper" @change="handleSwiperChange"
			:current="commonStore.currentPointIndex.value" circular previous-margin="30rpx" next-margin="30rpx">
			<swiper-item v-for="(item,index) in commonStore.pointList.value" :key="item.id">
				<view class="swiper-item" @click="handleClickItem(item,index)">
					<point-item background="#fff" :pointItem="item"></point-item>
				</view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script setup>
	import PointItem from './components/point-item.vue'
	import {
		useCommonStore
	} from '../../store/index.js'
	const commonStore = useCommonStore()
	const emit = defineEmits(['checkedPoint'])
	const handleClickItem = (item, index) => {
		commonStore.setCheckedPoint(item)
		commonStore.setCurrentPoint(index)
		emit('checkedPoint', item)
	}

	const handleSwiperChange = (e) => {
		const current = e.target.current
		const point = commonStore.pointList.value[current];
		commonStore.setCurrentPoint(current);
		commonStore.setCheckedPoint(point)
		emit('checkedPoint', point)
	}
</script>

<style lang="less" scoped>
	.swiper {
		height: 220rpx;
	}

	.swiper-item {
		margin: 0 10rpx;
	}
</style>