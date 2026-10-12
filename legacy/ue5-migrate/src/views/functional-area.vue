<template>
	<div class="floor-container">
		<div class="floor-item waves-effect" @click="backArea()" v-waves>返回</div>
		<div class="floor-item mg-t-12 waves-effect" :style="{ visibility: showPageButton ? 'visible' : 'hidden' }"
			:class="{ 'disabled': page === 1 }" @click="pageChange('up')" v-if="page > 1" v-waves>上一页
		</div>

		<Swiper v-if="floorList.length > pageSize" class="swiper-area" :modules="modules" :slides-per-view="pageSize"
			:slides-per-group="pageSize" :direction="'vertical'" ref="swiperRef" :observe-parents="true" :observer="true"
			:observeSlideChildren="true">
			<SwiperSlide v-for="(item, index) in floorList" :key="index">
				<div class="floor-item waves-effect" :class="{ 'active': item.id === selectedFloor?.id, 'disabled': determineExistenceArea(item) }" @click="changeFloor(item)">
					{{ item.name }}
				</div>
			</SwiperSlide>
		</Swiper>
		<template v-else>
			<div class="floor-item mg-t-12 waves-effect" :class="{ 'active': item.id === selectedFloor?.id , 'disabled': determineExistenceArea(item)}" @click="changeFloor(item)"
				v-for="(item, index) in floorList">
				{{ item.name }}
			</div>
		</template>

		<div class="floor-item waves-effect" :style="{ visibility: showPageButton ? 'visible' : 'hidden' }"
			:class="{ 'disabled': page === maxPage }" @click="pageChange('down')" v-waves>下一页</div>
	</div>
</template>
<script lang="ts" setup>
import { storeMarket } from '@/piniaStore/other'
import { message } from 'ant-design-vue'
import { determineExistenceArea } from "@/views/index";
import { Swiper, SwiperSlide } from "swiper/vue";
// 引入swiper样式（按需导入）
import "swiper/css";
import "swiper/css/navigation"; // 轮播图两边的左右箭头
import { Pagination, Navigation, Scrollbar } from "swiper";
const modules = [Pagination, Navigation, Scrollbar];
import { storeArea } from "@/piniaStore/area";
import { computed, nextTick, onMounted, ref, watch } from "vue"
import { FloorType, FloorOper } from './floor'
import { useStateStore } from '@/pages/state/use-state-store';
interface Props {
	floors: FloorType[],
	curBuild:any
}
const props = withDefaults(defineProps<Props>(), {
	floors: () => [],
	curBuild: () => {}
})
const piniaStoreMarket = storeMarket();

type Emit = {
	(e: 'floorBack'): void,
	(e: 'changeFloor', value: FloorOper): void
}
watch(() => props.curBuild, () => {
  if(props.curBuild){
		selectedFloor.value = {
			id: '',
			name: '',
			code: '',
			aliasName: '',
			level: 0,
			selected: false,
			actorId: '',
			value: undefined
		}
    selectedFloor.value.id = props.curBuild.props.areaId 
    selectedFloor.value.name = props.curBuild.props.name
  }
})
const emit = defineEmits<Emit>();
const floorList = ref<FloorType[]>(props.floors ?? []);
const selectedFloor = ref<FloorType>({
	id: '',
	name: '',
	code: '',
	aliasName: '',
	level: 0,
	selected: false,
	actorId: '',
	value: undefined
})
const { globalState } = useStateStore()


const swiperRef = ref()
const pageSize = 10
const page = ref(1)
const showPageButton = computed(() => {
	return floorList.value.length > pageSize
})
const maxPage = computed(() => {
	return Math.ceil(floorList.value.length / pageSize)
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

onMounted(() => {
	floorList.value = props.floors
})
watch(() => props.floors, (value) => {
	floorList.value = value
})
const backArea = () => {
	if (!selectedFloor.value) {
		floorList.value = [];
	}
	emit('floorBack')
	selectedFloor.value = null
}
const changeFloor = (item: FloorType) => {
	if (determineExistenceArea(item)) {
    message.warning('当前区域暂无设备！');
    return
  }
	selectedFloor.value = item
	globalState.business.currentAreaId = item.id;
	const index = floorList.value.findIndex(v => v.actorId === item.actorId);
	const hidFloors = floorList.value.filter((item, i) => {
		if (i < index && item.selected) {
			return item
		}
	})
	const showFloors = floorList.value.filter((item, i) => {
		if (i >= index && !item.selected) {
			return item
		}
	})
	floorList.value = floorList.value.map((item, i) => {
		if (i < index) {
			item.selected = false
		}
		else {
			item.selected = true
		}
		return item
	})

	setTimeout(() => {
		emit('changeFloor', { showFloors: showFloors, hidFloors: hidFloors, selectedFloor: item });
	}, 1000)
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