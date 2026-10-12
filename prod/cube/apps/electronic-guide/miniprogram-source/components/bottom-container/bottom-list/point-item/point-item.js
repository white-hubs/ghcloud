import { getLatLong } from '../../../utils/index';
Component({
  'properties': {
    'pointItem': {
      'type': Object,
      'value': []
    }
  },
  'data': {},
  'methods': {
    'handleNav'() {
      const latlng = getLatLong(this.properties.pointItem.coordinate);
      wx.openLocation({
        'latitude': Number(latlng.latitude),
        'longitude': Number(latlng.longitude),
        'name': this.properties.pointItem.name,
        'scale': 15,
        'address': this.properties.pointItem.address
      });
    }
  },
  'lifetimes': {}
});