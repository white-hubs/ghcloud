Component({
  'properties': {},
  'data': {
    'showMore': false,
    'viewId': ''
  },
  'methods': {
    'handleMore'() {
      this.setData({
        'showMore': !this.data.showMore
      });
    },
    'handleClick'(e) {
      const index = e.currentTarget.dataset.index;
      const thirdRegionActive = this.$state.thirdRegionList[index];
      if (!thirdRegionActive) {
        return;
      }
      this.setData({
        'viewId': "floor-" + index
      });
      this.setState({
        'thirdRegionActive': thirdRegionActive.id
      });
      this.triggerEvent("changeFloor", thirdRegionActive);
    }
  },
  'lifetimes': {}
});