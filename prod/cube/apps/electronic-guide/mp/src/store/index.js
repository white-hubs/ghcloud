import {
	onMounted
} from 'vue'
import {
	reactive,
	toRefs
} from 'vue'
import {
	getRegionTreeList
} from '../apis/index'
const state = reactive({
	isSearch: false,
	regionTreeList: [],
	firstLevelList: [],
	currentRegion: null,
	pointList: [],
	checkedPoint: '',
	currentPointIndex: 0,
	currentPointId: '',
	firstActive: "",
	secondLevelList: [],
	secondActive: '',
	thirdLevelList: [],
	thirdActive: ''
})
export const useCommonStore = () => {
	const setIsSearch = (isSearch) => {
		state.isSearch = isSearch
	}
	const setCurrentRegion = (region) => {
		state.currentRegion = region
	}
	const setRegionTreeList = (regionTreeList) => {
		state.regionTreeList = regionTreeList
	}
	const setCurrentPoint = (index) => {
		state.currentPointId = `point-${index}`
		state.currentPointIndex = index
	}
	const setCheckedPoint = (point) => {
		state.checkedPoint = point.id
	}
	const setFirstLevelList = (list) => {
		state.firstLevelList = list
	}
	const setPointList = (list) => {
		state.pointList = list
	}
	const setSecondLevelList = (list) => {
		state.secondLevelList = list
	}
	const setThirdLevelList = (list) => {
		state.thirdLevelList = list
	}
	const setFirstActive = (id) => {
		state.firstActive = id
	}
	const setSecondActive = (id) => {
		state.secondActive = id
	}
	const setThirdActive = (id) => {
		state.thirdActive = id
	}

	// onMounted(() => {
	// 	getList()
	// })
	return {
		...toRefs(state),
		setCurrentPoint,
		setRegionTreeList,
		setFirstLevelList,
		setPointList,
		setCheckedPoint,
		setCurrentRegion,
		setSecondLevelList,
		setThirdLevelList,
		setIsSearch,
		setFirstActive,
		setSecondActive,
		setThirdActive,
	}
}