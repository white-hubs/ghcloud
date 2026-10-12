import {
	getRegionTreeList
} from '../../api/index';
import '../../store/index'
const touchData = {
	'startX': 0,
	'startY': 0,
	'endX': 0,
	'endY': 0,
	'touchStart': false,
	'touchEnd': false
};
Component({
	'properties': {},
	'data': {
		'popupUp': false
	},
	'methods': {
		async 'getRegionList'() {
			const data = await getRegionTreeList();
			if (!data || !data.length) {
				return;
			}
			const firstRegionActive = {
				...data[0x0],
				'children': []
			};
			const firstRegionList = [firstRegionActive, ...data[0x0].children];
			this.setState({
				'regionTreeList': data,
				'firstRegionList': firstRegionList,
				'firstRegionActive': firstRegionActive.id
			});
			this.handleChangeRegion(firstRegionActive);
		},
		'handleTabChange'(e) {
			const region = e.detail.item;
			this.setState({
				'firstRegionActive': e.detail.item.id,
				'secondRegionList': e.detail.item.children ?? [],
				'thirdRegionList': [],
				'pointList': []
			});
			this.handleChangeRegion(region);
		},
		'handleChangeSecond'(e) {
			const index = e.currentTarget.dataset.index;
			const secondRegion = this.$state.secondRegionList[index];
			if (!secondRegion) {
				return;
			}
			this.setState({
				'secondRegionActive': secondRegion.id,
				'thirdRegionList': secondRegion.children,
				'pointList': []
			});
			this.handleChangeRegion(secondRegion);
		},
		'handleChangeFloor'(e) {
			this.setState({
				'pointList': []
			});
			this.handleChangeRegion(e.detail);
		},
		'handleChangeRegion'(region) {
			this.setState({
				'checkedPoint': {
					'id': ''
				},
				'currentPointIndex': null
			});
			setTimeout(() => {
				this.triggerEvent('changeRegion', region);
			}, 0);
		},
		'handleCheckPoint'(e) {
			const pointIndex = e.currentTarget.dataset.index;
			const checkedPoint = this.$state.pointList[pointIndex];
			this.setState({
				'checkedPoint': checkedPoint,
				'currentPointIndex': pointIndex
			});
			this.triggerEvent("checkedPoint", checkedPoint);
		},
		'handleTouchStart'(e) {
			touchData.startX = e.touches[0].pageX;
			touchData.startY = e.touches[0].pageY;
			touchData.touchStart = true;
		},
		'handleTouchMove'(e) {
			touchData.endX = e.touches[0].pageX;
			touchData.endY = e.touches[0].pageY;
			touchData.touchEnd = true;
		},
		'handleTouchEnd'(_0x3ed452) {
			if (!touchData.touchEnd) return;
			if (!touchData.touchStart) return;
			let direction = this.getSwipeDirection();
			if (direction === 'up') {
				this.setData({
					'popupUp': true
				});
			} else {
				this.setData({
					'popupUp': false
				});
			}
		},
		'getSwipeDirection'() {
			touchData.touchEnd = false;
			touchData.touchStart = false;
			if (touchData.startY - touchData.endY > 30) {
				return 'up';
			}
			return "none";
		}
	},
	'lifetimes': {
		'attached'() {
			this.getRegionList();
		}
	}
});