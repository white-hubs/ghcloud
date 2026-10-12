<template>
	<view class="bridge-page">
		<view class="loading-text">{{ state.statusText }}</view>
	</view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

interface BridgeParams {
	action: string
	params: Record<string, any>
	returnPage: string
}

const state = reactive({
	params: {} as BridgeParams,
	statusText: '处理中...',
	result: null as any
})

// 处理扫码请求
const handleScanCode = async (): Promise<void> => {
	try {
		state.statusText = '扫码中...'
		uni.scanCode({
			scanType: state.params.params?.scanType || ['qrCode'],
			success: (res) => {
				state.result = {
					action: 'scanCodeResult',
					success: true,
					rawData: res.rawData,
					result: res.result,
				}
				// 扫码成功后返回上一页并传递结果
				returnToH5WithResult()
			},
			fail: (err) => {
				state.result = {
					action: 'scanCodeResult',
					success: false,
					error: err
				}
				// 扫码失败后返回上一页并传递结果
				returnToH5WithResult()
			}
		})
	} catch (error) {
		state.result = {
			action: 'scanCodeResult',
			success: false,
			error: error
		}
		returnToH5WithResult()
	}
}
const returnToH5WithResult = (): void => {
  state.statusText = '处理完成，正在返回...'
  
  // 将扫码结果存储到全局变量
  getApp().globalData = getApp().globalData || {}
  getApp().globalData.scanCodeResult = state.result
  
  // 确保在返回前先触发事件，避免事件丢失
  uni.$emit('scanCodeComplete', {
    result: state.result,
    params: state.params
  })
  
  // 使用navigateBack返回上一页，而不是创建新页面
  uni.navigateBack({
    delta: 1,
    success: () => {
      // 再次触发事件，确保接收方能收到
      setTimeout(() => {
        uni.$emit('scanCodeComplete', {
          result: state.result,
          params: state.params
        })
      }, 100)
    },
    fail: (err) => void 0
  })
}

const handleGetLocation = (): void => {
  state.statusText = '定位中...'
  uni.getLocation({
    type: 'gcj02',
    isHighAccuracy: true,
    success: (res) => {
      state.result = {
        action: 'locationResult',
        success: true,
        latitude: res.latitude,
        longitude: res.longitude,
        speed: res.speed,
        accuracy: res.accuracy,
        altitude: res.altitude,
        verticalAccuracy: res.verticalAccuracy,
        horizontalAccuracy: res.horizontalAccuracy,
      }
      returnToH5WithLocationResult()
    },
    fail: (err) => {
      state.result = {
        action: 'locationResult',
        success: false,
        error: err,
      }
      returnToH5WithLocationResult()
    },
  })
}

const returnToH5WithLocationResult = (): void => {
  state.statusText = '处理完成，正在返回...'
  getApp().globalData = getApp().globalData || {}
  getApp().globalData.locationResult = state.result
  uni.$emit('locationComplete', {
    result: state.result,
    params: state.params,
  })
  uni.navigateBack({
    delta: 1,
    success: () => {
      setTimeout(() => {
        uni.$emit('locationComplete', {
          result: state.result,
          params: state.params,
        })
      }, 100)
    },
    fail: (err) => void 0,
  })
}

// 根据action执行相应操作
const executeAction = (): void => {
	switch (state.params.action) {
		case 'scanCode':
			handleScanCode()
			break
		case 'getLocation':
			handleGetLocation()
			break
		default:
			state.statusText = '未知操作，即将返回...'
			state.result = {
				action: 'error',
				success: false,
				error: '未知操作'
			}
			setTimeout(() => {
				returnToH5WithResult()
			}, 1000)
	}
}

onLoad((option) => {
	state.params = JSON.parse(decodeURIComponent(option?.params || '')) as BridgeParams
	try {
		if (option?.params) {
			state.params = JSON.parse(decodeURIComponent(option?.params || '')) as BridgeParams
			executeAction()
		} else {
			state.statusText = '参数错误，即将返回...'
			setTimeout(() => {
				uni.navigateBack({ delta: 1 })
			}, 1500)
		}
	} catch (error) {
		state.statusText = '参数解析错误，即将返回...'
		setTimeout(() => {
			uni.navigateBack({ delta: 1 })
		}, 1500)
	}
})
</script>

<style lang="less" scoped>
.bridge-page {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100vh;
	background-color: #f5f5f5;
	
	.loading-text {
		font-size: 16px;
		color: #666;
	}
}
</style>