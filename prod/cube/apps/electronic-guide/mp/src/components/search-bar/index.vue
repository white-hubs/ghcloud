<template>
	<view class="search-bar">
		<view class="container">
			<image src="/static/images/search.png" mode=""></image>
			<input type="text" v-model="state.keyword" placeholder="输入关键字搜索">
			<image src="../../static/images/close.png" v-if="showClearIcon" @click="clearIcon">&#xe434;</image>
			<view class="search-button" @click.stop="handleSearch">
				搜索
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		reactive,
		ref,
		defineEmits,
		computed
	} from 'vue'
	import {
		useCommonStore
	} from '../../store/index.js'
	const emit = defineEmits(['search'])
	const commonStore = useCommonStore()
	const state = reactive({
		visible: false,
		pointList: [],
		keyword: ''
	})
	const showClearIcon = computed(() => {
		return state.keyword.length > 0
	})
	const clearIcon = () => {
		state.keyword = ''
		commonStore.setCurrentPoint(-1)
		emit('search', state.keyword)
	}
	const handleSearch = () => {
		commonStore.setCurrentPoint(-1)
		emit('search', state.keyword)
	}
</script>

<style lang="less" scoped>
	.search-bar {
		position: fixed;
		top: 0rpx;
		padding: 8px 0 0;
		z-index: 10;
		width: 100%;

		.container {
			width: 87%;
			margin: 0 auto;
			padding: 12rpx 24rpx;
			background: #ffffff;
			border-radius: 14rpx;
			display: flex;
			align-items: center;
			gap: 20rpx;

			image {
				width: 28rpx;
				height: 28rpx;
			}

			.uni-icon {
				font-family: uniicons;
				font-size: 24px;
				font-weight: 400;
				font-style: normal;
				width: 24px;
				height: 24px;
				line-height: 24px;
				color: #999;
			}

			input {
				flex: 1;
				height: 28rpx !important;
				font-size: 28rpx;
			}

			.search-button {
				padding: 10rpx 14rpx;
				background: #006b3a;
				border: 1px solid #006b3a;
				border-radius: 6px;
				color: #ffffff;
				font-size: 26rpx;
			}
		}
	}
</style>