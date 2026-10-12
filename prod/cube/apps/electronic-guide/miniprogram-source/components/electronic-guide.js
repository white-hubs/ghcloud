import './store/index.js';
import {
  getPointList,
  getAreaLayer
} from './api/index';
import {
  serviceUrl
} from './service/request';
import {
  getLatLong,
  findItemById
} from './utils/index';
let initCenter = '';
let hasOverLay = false;
let initScale = 17
let mapContext = null;
Component({
  'properties': {},
  'data': {
    'mapState': {
      'center': {
        'longitude': 104.020175,
        'latitude': 30.564616
      },
      'scale': 0x11,
      'minScale': 15.5
    },
    'keyword': '',
    'isSearch': '',
    'markers': [],
    'pointMarkers': []
  },
  'methods': {
    'handleChangeType'() {
      this.setState({
        checkedPoint: {
          id: ''
        },
        isSearch: true
      })
      this.setMapCenter()
      this.setMapScale()
      this.getPoints();
    },
    'handleSearch'(e) {
      const keyword = e.detail;
      this.setData({
        'keyword': keyword
      });
      this.setState({
        checkedPoint: {
          id: ''
        },
        isSearch: true
      });
      wx.nextTick(() => {
        this.setMapCenter()
        this.setMapScale()
        this.getPoints();
      });
    },
    'handleCheckedPoint'(e) {
      const point = e.detail;
      this.setMapCenter(point.coordinate);
      this.setMapScale(20);
      const markers = this.data.markers.map(marker => {
        return {
          ...marker,
          'customCallout': {
            'display': marker.originId === point.id ? "ALWAYS" : "BYCLICK"
          }
        };
      });
      this.setData({
        'markers': markers
      });
    },
    async 'handleChangeRegion'(e) {
      const region = e.detail;
      if (region.id === this.$state.currentRegion.id) {
        return;
      }
      this.setState({
        'currentRegion': region
      });
      await this.getPoints();
      await this.initMapLayer(region);
      initScale = region.zoom
      this.setMapScale(region.zoom);
    },
    'setMapCenter'(coordinate) {
      const latLng = coordinate ? getLatLong(coordinate) : getLatLong(initCenter);
      this.setData({
        'mapState': {
          ...this.data.mapState,
          'center': latLng
        }
      });
    },
    'setMapBoundary'(mapContext) {
      const northeast = {
        'longitude': 104.033211,
        'latitude': 30.570677
      };
      const southwest = {
        'longitude': 104.009815,
        'latitude': 30.558826
      };
      mapContext.setBoundary({
        'southwest': southwest,
        'northeast': northeast,
        'success': () => {
        },
        'fail': error => {
        }
      });
    },
    'setMapScale'(scale) {
      this.setData({
        'mapState': {
          ...this.data.mapState,
          'scale': scale ? Number(scale) : initScale
        }
      });
    },
    async 'initMapLayer'(region) {
      const layerInfo = await this.getRegionLayer(region);
      if (!layerInfo) {
        return;
      }
      mapContext = !mapContext ? wx.createMapContext("myMap", this) : mapContext;
    //   this.setMapBoundary(mapContext);
      this.setMapCenter(region.coordinate);
      initCenter = layerInfo.center;
      const southwest = getLatLong(layerInfo.southwest);
      const northeast = getLatLong(layerInfo.northeast);
      const layerFile = layerInfo.layerFile.includes("http") ? layerInfo.layerFile : serviceUrl + layerInfo.layerFile;
      if (!hasOverLay) {
        mapContext.addGroundOverlay({
          'id': 0x1,
          'src': layerFile,
          'zIndex': 0xa,
          'bounds': {
            'southwest': {
              'longitude': southwest.longitude,
              'latitude': southwest.latitude
            },
            'northeast': {
              'longitude': northeast.longitude,
              'latitude': northeast.latitude
            }
          },
          'success': () => {
            hasOverLay = true;
          },
          'fail': error => {
          },
          'complete': info => {
          }
        });
      } else {
        mapContext.updateGroundOverlay({
          'id': 0x1,
          'src': layerFile,
          'zIndex': 0xa,
          'bounds': {
            'southwest': {
              'longitude': southwest.longitude,
              'latitude': southwest.latitude
            },
            'northeast': {
              'longitude': northeast.longitude,
              'latitude': northeast.latitude
            }
          },
          'success': () => {
            hasOverLay = true;
          },
          'fail': _0x1d235f => {
          },
          'complete': _0x23f8ae => {
          }
        });
      }
    },
    async 'getPoints'() {
      const data = await getPointList({
        'typeId': this.$state.typeId,
        'keyword': this.data.keyword,
        'areaId': this.$state.currentRegion.id
      });
      const pointRecords = data.records;
      const pointList = pointRecords.map(point => {
        return {
          ...point,
          'filePath': !point.filePath.includes("http") && point.filePath ? serviceUrl + point.filePath : point.filePath,
          'typeFilePath': !point.typeFilePath.includes("http") && point.typeFilePath ? serviceUrl + point.typeFilePath : point.typeFilePath
        };
      });
      const pointMarkers = pointRecords.map(point => {
        const latLng = getLatLong(point.coordinate);
        return {
          'id': Number(point.id),
          'latitude': latLng.latitude,
          'longitude': latLng.longitude,
          'width': 0x18,
          'height': 0x18,
          'zIndex': "999",
          'originId': point.id,
          'type': "point",
          'label': {
            'content': point.name,
            'anchorX': 0xa,
            'anchorY': -0x19,
            'padding': 0x5
          },
          'iconPath': !point.typeFilePath.includes("http") && point.typeFilePath ? serviceUrl + point.typeFilePath : point.typeFilePath,
          'joinCluster': false,
          'name': point.name,
          'address': point.address,
          'areaName': point.areaName,
          'filePath': !point.filePath.includes("http") && point.filePath ? serviceUrl + point.filePath : point.filePath,
          'remarks': point.remarks,
          'customCallout': {
            'display': "BYCLICK"
          }
        };
      });
      this.setState({
        'pointList': pointList
      });
      const firstRegion = this.$state.regionTreeList[0x0];
      if (!firstRegion || this.$state.currentRegion.id !== firstRegion.id || this.$state.typeId !== '') {
        this.setData({
          'pointMarkers': pointMarkers,
          'markers': pointMarkers
        });
        return;
      };
      const regionMarkers = firstRegion.children.map(region => {
        const latLng = getLatLong(region.coordinate);
        return {
          'id': Number(region.id),
          'latitude': latLng.latitude,
          'longitude': latLng.longitude,
          'originId': region.id,
          'width': 0x18,
          'height': 0x18,
          'zIndex': "999",
          'type': "area",
          'label': {
            'content': region.name,
            'anchorX': 0xa,
            'anchorY': -0x19,
            'padding': 0x5
          },
          'iconPath': 'https://minio-test.guhecloud.com:30000/guhecloud-prod-mdata/1838466564291039234.png',
          'joinCluster': false,
          'name': region.name
        };
      });
      this.setData({
        'pointMarkers': pointMarkers,
        'markers': [...pointMarkers, ...regionMarkers]
      });
    },
    async 'getRegionLayer'(region) {
      const data = await getAreaLayer({
        'areaId': region.id
      });
      if (!data) {
        if (!region.parentId) {
          return null;
        }
        const parentRegion = findItemById(this.$state.regionTreeList, region.parentId);
        return await this.getRegionLayer(parentRegion);
      }
      return data;
    },
    'handleClickMarker'(e) {
      const markerId = e.detail.markerId;
      const marker = this.data.markers.find(marker => marker.id === markerId);
      if (marker.type === "area") {
        const firstRegion = this.$state.regionTreeList[0x0];
        if (!firstRegion) {
          return;
        }
        const regionMarker = firstRegion.children.find(region => region.id === marker.originId);
        if (!regionMarker) {
          return;
        }
        this.handleChangeRegion({
          'detail': regionMarker
        });
      }
    },
    'handleClickCallouttap'(e) {
      const {
        markerId
      } = e.detail;
      const marker = this.data.pointMarkers.find(pointMarker => pointMarker.id === markerId);
      wx.openLocation({
        'latitude': Number(marker.latitude),
        'longitude': Number(marker.longitude),
        'name': marker.name,
        'scale': 0xf,
        'address': marker.address
      });
    },
    'handleBackMapCenter'(_0x4f51a1) {
      const region = this.$state.currentRegion;
      mapContext.getCenterLocation({
        'success': center => {
          this.setData({
            'mapState': {
              ...this.data.mapState,
              'center': {
                'longitude': center.longitude,
                'latitude': center.latitude
              }
            }
          });
          wx.nextTick(() => {
            if (!region) {
              return;
            }
            this.setMapCenter(region.coordinate);
            this.setMapScale(region.scale);
          });
        }
      });
    }
  },
  'lifetimes': {
  }
});