<template>
	<view class="container">
		<view class="region-list">
			<view :class="['region-item',state.activeRegion===item.id&&'active']" @click="handleActiveRegion(item)"
				v-for="item in state.regionList" :key="item.id">
				{{item.name}}
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		onMounted,
		reactive,
		defineEmits
	} from 'vue'
	import {
		getRegionList,
		getRegionInfo
	} from '../../apis/index'
	const emit = defineEmits(['setMapCenter', 'setMapScale'])
	const state = reactive({
		regionList: [],
		activeRegion: '121'
	})
	const handleActiveRegion = async (region) => {
		if(region.id==='121'){
			state.activeRegion = region.id
			emit('setMapCenter', '')
			emit('setMapScale', 17)
			return
		}
		const 
			data
		 = await getRegionInfo(region.id)
		state.activeRegion = region.id
		emit('setMapCenter', data.coordinate)
		emit('setMapScale', data.zoom)
	}
	const getList = async () => {
		const 
			data
		 = await getRegionList()
		state.regionList = [{
			coordinate: '',
			name: '全部',
			id: '121',
			createTime: (new Date).getTime()
		}, ...data.records]
	}
	onMounted(() => {
		getList()
	})
</script>

<style lang="less" scoped>
	.container {
		position: fixed;
		top: 120rpx;
		height: auto;
		z-index: 10;
		right: 20rpx;

		.region-list {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 30rpx;

			.region-item {
				padding: 10rpx 20rpx;
				font-size: 20rpx;
				background: #fff;
				box-shadow: ;
				border-radius: 10rpx;
				color: #222;
				box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.4);
			}

			.active {
				background: #ff6600;
				color: #fff;
			}
		}
	}
</style>