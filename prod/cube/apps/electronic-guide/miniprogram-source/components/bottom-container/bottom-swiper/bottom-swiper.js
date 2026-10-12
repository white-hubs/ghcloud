import '../../store/index'
Component({
  'properties': {},
  'data': {},
  'methods': {
    'handleSwiperChange'(e) {
      const index = e.detail.current;
      const checkedPoint = this.$state.pointList[index];
      if (!checkedPoint) {
        return;
      }
      this.setState({
        'checkedPoint': checkedPoint,
        'currentPointIndex': index
      });
      this.triggerEvent("checkedPoint", checkedPoint);
    },
    'handleClickSwiper'(e) {
      const index = e.currentTarget.dataset.index;
      const checkedPoint = this.$state.pointList[index];
      if (!checkedPoint) {
        return;
			}
      this.setState({
        'checkedPoint': checkedPoint,
        'currentPointIndex': index
      });
      this.triggerEvent("checkedPoint", checkedPoint);
    }
  },
  'lifetimes': {}
});