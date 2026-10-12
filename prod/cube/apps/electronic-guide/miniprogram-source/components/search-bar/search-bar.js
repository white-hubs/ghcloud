Component({
  'properties': {},
  'data': {
    'searchValue': '',
    'tabsList': [{
      'id': 0x1,
      'name': '全部'
    }, {
      'id': 0x2,
      'name': "蔬菜区"
    }, {
      'id': 0x3,
      'name': "蔬菜区12"
    }, {
      'id': 0x4,
      'name': "蔬菜区22"
    }, {
      'id': 0x5,
      'name': "蔬菜区33"
    }, {
      'id': 0x6,
      'name': "蔬菜区44"
    }]
  },
  'methods': {
    'handleSearch'() {
      this.triggerEvent("search", this.data.searchValue);
    },
    'handleClear'() {
      this.setData({
        'searchValue': ''
      });
      this.triggerEvent('search', '');
    }
  },
  'lifetimes': {}
});