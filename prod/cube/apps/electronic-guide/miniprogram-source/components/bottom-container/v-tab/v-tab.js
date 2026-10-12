import '../../store/index'
Component({
	'properties': {
		'tabs': {
			'type': Array,
			'value': []
		},
		'active': ''
	},
	'data': {
		'currentIndex': 0,
		'lineWidth': 0,
		'scrollWidth': 0,
		'scrollLeft': 0,
		'lineTranslateX': 0,
		'container': {
			'width': 0,
			'height': 0,
			'left': 0,
			'right': 0
		}
	},
	'methods': {
		'changeTab'(e) {
			const currentIndex = e.currentTarget.dataset.index;
			const active = e.currentTarget.dataset.id;
			this.setData({
				'active': active,
				'currentIndex': currentIndex
			});
			this.updateLinePosition();
			setTimeout(() => {
				this.triggerEvent('tabChange', {
					'item': this.properties.tabs[currentIndex],
					'index': currentIndex
				});
			}, 500);
		},
		'updateLinePosition'() {
			const selector = wx.createSelectorQuery()['in'](this);
			selector.select('#scroll-view').boundingClientRect(rect => {
				const {
					width,
					height,
					left,
					right
				} = rect;
				this.setData({
					container: {
						width,
						height,
						left,
						right: right - width
					}
				});
				this.calcScrollWidth();
				this.setScrollLeft();
				this.setLine();
			}).exec();
		},
		'calcScrollWidth'(callback) {
			const query = wx.createSelectorQuery()['in'](this);
			query.select("#scroll-view").fields({'scrollOffset': true}, scrollInfo => {
				if (callback && typeof callback === "function") {
					callback(scrollInfo);
					return;
				}
				this.setData({
					'scrollWidth': scrollInfo.scrollWidth
				});
			}).exec();
		},
		'setScrollLeft'() {
			this.calcScrollWidth(scrollInfo => {
				let scrollLeft = scrollInfo.scrollLeft;
				wx.createSelectorQuery()['in'](this).select("#scroll-view .tab-item.active").boundingClientRect(rect => {
					if (!rect) {
						return;
					}
					let _0x207d6a = (this.data.container.width - rect.width) / 2;
					let _0x552026 = this.data.scrollWidth - this.data.container.width;
					scrollLeft += rect.left - _0x207d6a - this.data.container.left;
					if (scrollLeft < 0x0) {
						scrollLeft = 0x0;
					} else if (scrollLeft > _0x552026) {
						scrollLeft = _0x552026;
					}
					this.setData({
						'scrollLeft': scrollLeft
					});
				}).exec();
			});
		},
		'setLine'() {
			this.calcScrollWidth(scrollInfo => {
				const scrollLeft = scrollInfo.scrollLeft;
				wx.createSelectorQuery()['in'](this).select("#scroll-view .tab-item.active").boundingClientRect(rect => {
					if (!rect) {
						return;
					}
					const lineWidth = rect.width * 0.5;
					const lineTranslateX = scrollLeft + rect.left + (rect.width - rect.width * 0.5) / 2 - this.data.container.left;
					this.setData({
						'lineWidth': lineWidth,
						'lineTranslateX': lineTranslateX
					});
				}).exec();
			});
		}
	},
	'lifetimes': {
		'attached'() {
			this.updateLinePosition();
		}
	}
});