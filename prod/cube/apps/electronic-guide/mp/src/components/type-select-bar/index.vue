<template>
	<view class="type-select-container">
		<view class="scroll-container">
			<scroll-view class="select-list" scroll-y>
				<view :class="['select-item',state.checkedType.id===item.id&&'active']" @click="handleClickItem(item)"
					v-for="item in state.typeList" :key="item.id">
					<image class="icon" :src="item.filePath"></image>
					<text>{{item.name}}</text>
				</view>
			</scroll-view>
		</view>
		<view class="triangle-container" @click="handleScroll">
			<view class="triangle">

			</view>
		</view>


		<!-- <view :class="['type-item',state.checkedType.id===item.id&&'active']" v-for="item in state.typeList" @click.native.stop="handleClick(item)" :key="item.id">
			<image :src="item.filePath"></image>
			<text>{{item.name}}</text>
		</view> -->
	</view>
</template>

<script setup>
	import {
		onMounted,
		reactive
	} from 'vue';
	import {
		getPointType
	} from '../../apis/index'
	import {
		serviceUrl
	} from '../../service/index'
	const state = reactive({
		typeList: [],
		checkedType: {
			id: ''
		}
	})
	const emit = defineEmits(['checkedType'])
	const handleScroll = () => {
	}
	const handleClickItem = (item) => {
		state.checkedType = item
		emit('checkedType', item)
	}
	const getList = async () => {
		const  data = await getPointType()
		const allItem = {
			name: '全部',
			filePath: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAuZJREFUaEPtWl1IFFEU/s7sj4a76JKBL2laBGoIPlQW1ENkJPQDGRVSJBWFlLWJQpAS0QbBLmpZSGARFFKRPVRgpPhQEFoPgrVJUbutPSRkrrJruT+zN2ZsScTdmYnc3aGZt+F+d873nTnnnvtHmPN4mK84EgkfAdgWBuSCwTQXk9B3gp+AEYCecZy+I4/Mztn2KfrCGDO6IxPNBNQwxriEkpRpjIgiDGjP57LqiCgodBMFCOQ/8xPdDGyTzG8lFUagvmW6rApBhCjAxXuvgrHjSWWl1DjRtQKd5QT9jvmhVA2bWLqEcOI4fQm5eW8LY8yq1AGpgCeiVnLz407GUJQKhJRyIMI7cvHjvqQPlUqZR/HCEOsKj7O/7Z8K/f4fAWP+SZy914YXw4OYDgUWxPnphjRsKCzFxb21yDZlyrIh+w8cu2FDz1A/jHojipcuh0Gnk2VALijE83B++YRgOIjykjJcP9woq6tsAUX1lYgwhkcNLViZkyfr40pB7796sNNxGpwwvDi6ZHWXLaDg1DaU5heiy2rHd/8k7vf3IBASpyPzPrnZOdi1emZm8vB1H0bGRmNi0wxG7Ckrx2JTJipbGzDoHobr8pN/L2DNilW4W3sJ7b0PYH98S9LAgO22iFnbeEAS27C9GjWbd2Nf2xm8+vh2YQW0dnfiytNOSVLPz90UMRvPH5LEntxaBWtFlSYgpqeEHIiGkPYH5nGTFkJSWaaFkISHEhpCQmGqv9Mcl5I5PQMvL8zUivVN1fBNT8XFO/bXiYUvIXVAYPLN50UgFIpJymIyI8O4SGyfCv6E1++LU4kNWGK2iO2agFhump3ESkNoXdNB+Kd/pE4IaYVMK2R/PKBoPaDNheKkcUILmZbEyU5i1S4pVb2oT8S2yodRD3bYF2hb5WiHDb1vVLyxpfqtRakVW7LaZVfiZBGUsqv+Aw7VHzGp/pBP9cesQpKo+qBbEKD6qwZREaq97DF7rFXbdZtf5p4EpDaOFPMAAAAASUVORK5CYII=',
			id: ''
		}
		state.typeList = [allItem, ...data].map(item => {
			return {
				...item,
				filePath: (item.filePath.includes('http') || item.filePath.includes('data:image/png')) ?
					item
					.filePath : serviceUrl + item.filePath
			}
		})
		state.checkedType = allItem
		emit('checkedType', allItem)
	}
	const handleClick = (item) => {
		state.checkedType = item
		emit('checkedType', item)
	}
	onMounted(() => {
		getList()
	})
</script>

<style lang="less" scoped>
	.type-select-container {
		position: fixed;
		background: rgba(255, 255, 255, 0.70);
		border-radius: 5px;
		box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.06);
		backdrop-filter: blur(2px);
		padding: 20rpx 16rpx 10rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		right: 24rpx;
		z-index: 999;
		top: 148rpx;

		.triangle {
			width: 0;
			height: 0;
			border-left: 10rpx solid transparent;
			border-right: 10rpx solid transparent;
			border-top: 10rpx solid #d0ddea;
		}

		.scroll-container {
			::-webkit-scrollbar {
				display: none;
				width: 0;
				height: 0;
				color: transparent;
			}
		}

		.select-list {
			text-align: center;
			height: 364rpx;
			margin-bottom: 12px;

			.select-item {
				display: flex;
				align-items: center;
				flex-direction: column;
				margin-top: 12rpx;

				&.active {
					color: #1f3140;
					transform: scale(1.2);
				}

				&:first-child {
					margin-top: 4px;
				}

				image {
					width: 48rpx;
					height: 48rpx;
					background: #dafbec;
					border-radius: 8rpx;
				}

				text {
					font-size: 20rpx;
					font-family: Source Han Sans CN, Source Han Sans CN-Medium;
					font-weight: Medium;
					text-align: left;
					color: #1f3140;
					margin-top: 8rpx;
				}
			}
		}
	}
</style>