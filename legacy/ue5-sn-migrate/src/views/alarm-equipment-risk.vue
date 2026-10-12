<template>
	<div class="floor-container">
		<div class="floor-item waves-effect" :style="{ visibility: showPageButton ? 'visible' : 'hidden' }"
			:class="{ 'disabled': page === 1 }" @click="pageChange('up')" v-if="page > 1" v-waves>上一页
		</div>
		<div class="floor-item waves-effect" @click="backArea()" v-else v-waves>返回</div>

		<Swiper v-if="piniaStoreMarket.alarmDeviceRisk.length > pageSize" class="swiper-area" :modules="modules" :slides-per-view="pageSize"
			:slides-per-group="pageSize" :direction="'vertical'" ref="swiperRef" :observe-parents="true" :observer="true"
			:observeSlideChildren="true">
			<SwiperSlide v-for="(item, index) in piniaStoreMarket.alarmDeviceRisk" :key="index">
				<div class="floor-item waves-effect" :class="{ 'active': item.value === selectedFloor?.value }" @click="changeFloor(item)">
					{{ item.label }}
				</div>
			</SwiperSlide>
		</Swiper>
		<template v-else>
			<div class="floor-item mg-t-12 waves-effect" :class="{ 'active': item.value === selectedFloor?.value }" @click="changeFloor(item)"
				v-for="(item, index) in piniaStoreMarket.alarmDeviceRisk">
				{{ item.label }}
			</div>
		</template>

		<div class="floor-item waves-effect" :style="{ visibility: showPageButton ? 'visible' : 'hidden' }"
			:class="{ 'disabled': page === maxPage }" @click="pageChange('down')" v-waves>下一页</div>
	</div>
</template>
<script lang="ts" setup>
import { Swiper, SwiperSlide } from "swiper/vue";
// 引入swiper样式（按需导入）
import "swiper/css";
import "swiper/css/navigation"; // 轮播图两边的左右箭头
import { Pagination, Navigation, Scrollbar } from "swiper";
const modules = [Pagination, Navigation, Scrollbar];
import { storeArea } from "@/piniaStore/area";
import { computed, nextTick, onMounted, ref, watch } from "vue"
import { FloorType, FloorOper } from './floor'
import { storeMarket } from '@/piniaStore/other'
import bus from '@/utils/bus'
interface Props {
	floors: FloorType[]
}
const props = withDefaults(defineProps<Props>(), {
	floors: () => []
})
const piniaStoreMarket = storeMarket();

type Emit = {
	(e: 'floorBack'): void,
	(e: 'changeFloor', value: FloorOper): void
}
const emit = defineEmits<Emit>();
const selectedFloor = ref({label:'',value:''})

const swiperRef = ref()
const pageSize = 10
const page = ref(1)
const showPageButton = computed(() => {
	return piniaStoreMarket.alarmDeviceRisk.length > pageSize
})
const maxPage = computed(() => {
	return Math.ceil(piniaStoreMarket.alarmDeviceRisk.length / pageSize)
})
/** 分页按钮 */
const pageChange = (direction: 'up' | 'down'): void => {
	if (direction === 'up' && page.value <= 1) {
		return
	}
	if (direction === 'down' && page.value >= maxPage.value) {
		return
	}

	if (direction === 'up') {
		page.value--
		swiperRef.value.$el.swiper.slidePrev()
	}

	if (direction === 'down') {
		page.value++
		swiperRef.value.$el.swiper.slideNext()
	}
}


const backArea = () => {
	piniaStoreMarket.alarmDeviceRisk = [];
	selectedFloor.value = null
	emit('floorBack')
}
const changeFloor = (data)=>{
	if (data.value === selectedFloor.value.value) {
		selectedFloor.value = {label:'',value:''}
	}else{
		selectedFloor.value = data
	}
	bus.emit("alarmDeviceFilter", {value:selectedFloor.value})
}
</script>

<style lang="less" scoped>
.floor-container {
	.mg-t-12{
		margin-top: 12px;
	}
	.swiper-area {
    min-height: 420px;
    max-height: 420px;
		margin-top: 12px;
		:deep(.swiper-wrapper) {
      justify-content: center;
    }
	}

	.floor-item {
		width: auto !important;
		padding: 4px 10px;
		background: rgba(6, 6, 6, 0.7);
		color: #FFFFFF;
		font-size: 12px;
		border-radius: 13px;
		text-align: center;
		cursor: pointer;
		border: none;

		&.active {
			background: #2989FF;
		}
	}

	.disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}
}
</style>