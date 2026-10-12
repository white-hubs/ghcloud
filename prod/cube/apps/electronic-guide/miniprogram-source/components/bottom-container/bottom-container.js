import '../store/index'
Component({
  'properties': {},
  'data': {
    'fullMap': false
  },
  'methods': {
    'handleBackMapCenter'() {
      this.triggerEvent('backMapCenter');
    },
    'handleFullMap'() {
      this.setState({
        'isSearch': !this.$state.isSearch
      });
    },
    'handleChangeRegion'(e) {
      this.triggerEvent('changeRegion', e.detail);
    },
    'handleCheckedPoint'(e) {
      this.triggerEvent("checkedPoint", e.detail);
    }
  },
  'lifetimes': {}
});